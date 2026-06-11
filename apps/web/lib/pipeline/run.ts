import { ACTION_TEMPLATE, renderTemplate } from "@troppaye/templates";
import { formatEur } from "@troppaye/rules-engine";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface RunResult {
  processed: number;
  skipped: number;
}

interface DueAction {
  id: string;
  dossier_id: string;
  type: string;
  scheduled_at: string | null;
}

/** Exécute toutes les Actions dues (cron) : courriers planifiés dont l'échéance est atteinte. */
export async function runCronDue(nowISO: string): Promise<RunResult> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("actions")
    .select("id, dossier_id, type, scheduled_at")
    .is("executed_at", null)
    .lte("scheduled_at", nowISO)
    .order("scheduled_at", { ascending: true });
  return runAll(data ?? [], nowISO);
}

/** Avance manuellement un dossier d'un cran : exécute sa prochaine Action en attente. */
export async function advanceDossier(dossierId: string, nowISO: string): Promise<RunResult> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("actions")
    .select("id, dossier_id, type, scheduled_at")
    .eq("dossier_id", dossierId)
    .is("executed_at", null)
    .order("scheduled_at", { ascending: true })
    .limit(1);
  return runAll(data ?? [], nowISO);
}

async function runAll(actions: DueAction[], nowISO: string): Promise<RunResult> {
  let processed = 0;
  let skipped = 0;
  for (const action of actions) {
    const ok = await executeOne(action, nowISO);
    if (ok) processed += 1;
    else skipped += 1;
  }
  return { processed, skipped };
}

/**
 * Exécute une Action courrier — circuit PAPIER du pilote (décision 2026-06-11,
 * remplace le mock LRE qui notifiait le client d'un recommandé jamais posté) :
 * le cron REND le courrier et le met en file `TO_POST` ; l'opérateur imprime,
 * poste en recommandé et saisit le n° de suivi dans /admin/courriers — c'est
 * CETTE saisie (markPosted) qui horodate l'envoi et notifie le client.
 * Idempotent (claim par `executed_at`) ; respecte recovery_state.
 */
async function executeOne(action: DueAction, nowISO: string): Promise<boolean> {
  const template = ACTION_TEMPLATE[action.type];
  if (!template) return false; // non un courrier planifié (event admin)

  const admin = getSupabaseAdmin();

  // 1) Claim atomique de l'action : seul le premier passage l'exécute (évite le double rendu).
  const { data: claimed } = await admin
    .from("actions")
    .update({ executed_at: nowISO })
    .eq("id", action.id)
    .is("executed_at", null)
    .select("id")
    .maybeSingle();
  if (!claimed) return false;

  // 2) Garde-fou n°1 RE-LU APRÈS le claim (atomicité du verrou) : si la séquence a été mise en
  //    pause/verrou entre-temps, on annule le claim et on ne met RIEN en file.
  const { data: dossier } = await admin
    .from("dossiers")
    .select("user_id, status, recovery_state, address_label, landlord_name, landlord_address")
    .eq("id", action.dossier_id)
    .single();
  if (!dossier || dossier.recovery_state !== "SCHEDULED" || dossier.status !== "RECOVERY") {
    await admin.from("actions").update({ executed_at: null }).eq("id", action.id);
    return false;
  }

  const { data: verdict } = await admin
    .from("verdicts")
    .select("total_recoverable_cents")
    .eq("dossier_id", action.dossier_id)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const body = renderTemplate(template, {
    dossierRef: action.dossier_id.slice(0, 8),
    date: nowISO.slice(0, 10),
    tenantName: await resolveTenantName(dossier.user_id),
    // validateDossier bloque désormais sans bailleur ; fallback pour les dossiers legacy.
    landlordName: dossier.landlord_name ?? "le bailleur",
    tenantAddress: dossier.address_label ?? "—",
    recoverableAmount: formatEur(verdict?.total_recoverable_cents ?? 0),
    deadlineDays: "21",
    previousDate: nowISO.slice(0, 10),
  });

  // 3) File « à poster » : courrier rendu + adresse postale dans le payload —
  //    AUCUNE notification client ici (elle part à la saisie du n° de suivi).
  await admin
    .from("actions")
    .update({
      post_status: "TO_POST",
      payload: {
        letterBody: body,
        landlordName: dossier.landlord_name ?? null,
        landlordAddress: dossier.landlord_address ?? null,
      },
    })
    .eq("id", action.id);

  return true;
}

/** Nom du locataire pour l'en-tête du courrier (profil, sinon neutre). */
async function resolveTenantName(userId: string | null): Promise<string> {
  if (!userId) return "le locataire";
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();
  const name = [data?.first_name, data?.last_name].filter(Boolean).join(" ").trim();
  return name || "le locataire";
}
