import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { mapVerdictRow } from "@/lib/diagnostic/verdict-map";
import type { VerdictGlobal } from "@troppaye/rules-engine";
import type { DossierRow, MandateRow, PieceRow, ActionRow, MessageRow } from "@/lib/dossier/read";
import type { Database } from "@/lib/supabase/database.types";

type SignatureProofRow = Database["public"]["Tables"]["signature_proofs"]["Row"];
type FundRow = Database["public"]["Tables"]["fund_movements"]["Row"];

export interface ReviewItem {
  id: string;
  address_label: string | null;
  created_at: string;
  verdict: VerdictGlobal | null;
}

async function latestVerdict(dossierId: string): Promise<VerdictGlobal | null> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("verdicts")
    .select("*")
    .eq("dossier_id", dossierId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapVerdictRow(data) : null;
}

/** File de revue : dossiers en IN_REVIEW avec résumé du verdict. */
export async function listDossiersForReview(): Promise<ReviewItem[]> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("dossiers")
    .select("id, address_label, created_at")
    .eq("status", "IN_REVIEW")
    .order("created_at", { ascending: true });
  return Promise.all(
    (data ?? []).map(async (d) => ({ ...d, verdict: await latestVerdict(d.id) })),
  );
}

/** Tous les dossiers du pipeline (kanban), groupés par statut côté UI. */
export async function listPipeline(): Promise<Pick<DossierRow, "id" | "address_label" | "status" | "recovery_state" | "created_at">[]> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("dossiers")
    .select("id, address_label, status, recovery_state, created_at")
    .in("status", ["IN_REVIEW", "RECOVERY", "ESCALATED", "WON", "LOST", "CLOSED"])
    .order("created_at", { ascending: false });
  return data ?? [];
}

export interface AdminDossierDetail {
  dossier: DossierRow;
  verdict: VerdictGlobal | null;
  mandate: MandateRow | null;
  proof: SignatureProofRow | null;
  pieces: PieceRow[];
  actions: ActionRow[];
  messages: MessageRow[];
  funds: FundRow[];
  client: { firstName: string | null; lastName: string | null; phone: string | null; email: string | null };
}

/** Détail complet d'un dossier côté back-office (service_role). */
export async function getDossierAdmin(id: string): Promise<AdminDossierDetail | null> {
  const admin = getSupabaseAdmin();
  const { data: dossier } = await admin.from("dossiers").select("*").eq("id", id).maybeSingle();
  if (!dossier) return null;

  const [verdict, mandate, proof, pieces, actions, messages, funds] = await Promise.all([
    latestVerdict(id),
    admin.from("mandates").select("*").eq("dossier_id", id).maybeSingle().then((r) => r.data),
    admin
      .from("signature_proofs")
      .select("*")
      .eq("dossier_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then((r) => r.data),
    admin.from("pieces").select("*").eq("dossier_id", id).order("created_at").then((r) => r.data ?? []),
    admin
      .from("actions")
      .select("*")
      .eq("dossier_id", id)
      .order("scheduled_at", { ascending: true })
      .then((r) => r.data ?? []),
    admin.from("messages").select("*").eq("dossier_id", id).order("created_at").then((r) => r.data ?? []),
    admin
      .from("fund_movements")
      .select("*")
      .eq("dossier_id", id)
      .order("occurred_at")
      .then((r) => r.data ?? []),
  ]);

  // Coordonnées du client (parité admin) : profil + email auth. user_id = propriétaire.
  const [profile, authUser] = await Promise.all([
    dossier.user_id
      ? admin
          .from("profiles")
          .select("first_name, last_name, phone")
          .eq("id", dossier.user_id)
          .maybeSingle()
          .then((r) => r.data)
      : null,
    dossier.user_id
      ? admin.auth.admin.getUserById(dossier.user_id).then((r) => r.data.user)
      : null,
  ]);
  const client = {
    firstName: profile?.first_name ?? null,
    lastName: profile?.last_name ?? null,
    phone: profile?.phone ?? null,
    email: authUser?.email ?? null,
  };

  return { dossier, verdict, mandate, proof, pieces, actions, messages, funds, client };
}
