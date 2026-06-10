import { ACTION_TEMPLATE, renderTemplate } from "@troppaye/templates";
import { formatEur } from "@troppaye/rules-engine";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getLreProvider } from "@/lib/providers/lre";
import { queueEmail } from "@/lib/notify";

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

/** Exécute une Action courrier. Idempotent (claim par `executed_at`) ; respecte recovery_state. */
async function executeOne(action: DueAction, nowISO: string): Promise<boolean> {
  const template = ACTION_TEMPLATE[action.type];
  if (!template) return false; // non un courrier planifié (event admin)

  const admin = getSupabaseAdmin();
  const { data: dossier } = await admin
    .from("dossiers")
    .select("id, user_id, status, recovery_state, address_label")
    .eq("id", action.dossier_id)
    .single();
  if (!dossier) return false;
  // Garde-fou n°1 : aucune relance si la séquence est en pause ou verrouillée.
  if (dossier.recovery_state !== "SCHEDULED" || dossier.status !== "RECOVERY") return false;

  // Claim atomique : seul le premier passage exécute (évite le double envoi).
  const { data: claimed } = await admin
    .from("actions")
    .update({ executed_at: nowISO })
    .eq("id", action.id)
    .is("executed_at", null)
    .select("id")
    .maybeSingle();
  if (!claimed) return false;

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
    tenantName: "le locataire",
    landlordName: "le bailleur",
    tenantAddress: dossier.address_label ?? "—",
    recoverableAmount: formatEur(verdict?.total_recoverable_cents ?? 0),
    deadlineDays: "21",
    previousDate: nowISO.slice(0, 10),
  });

  const receipt = await getLreProvider().send({
    dossierId: action.dossier_id,
    kind: action.type,
    recipient: "bailleur (mock)",
  });

  await admin.from("actions").update({ payload: { lreRef: receipt.ref } }).eq("id", action.id);

  await queueEmail({
    dossierId: action.dossier_id,
    toEmail: await resolveEmail(dossier.user_id),
    subject: "Avancement de votre dossier TropPayé",
    body: `Un courrier (${action.type}) a été adressé au bailleur.\n\n${body}`,
    template: action.type,
  });

  return true;
}

async function resolveEmail(userId: string | null): Promise<string> {
  if (!userId) return "outbox@troppaye.test";
  const admin = getSupabaseAdmin();
  const { data } = await admin.auth.admin.getUserById(userId);
  return data.user?.email ?? "outbox@troppaye.test";
}
