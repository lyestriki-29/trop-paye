import { getSupabaseServer } from "@/lib/supabase/server";
import { mapVerdictRow } from "@/lib/diagnostic/verdict-map";
import type { Database } from "@/lib/supabase/database.types";
import type { VerdictGlobal } from "@troppaye/rules-engine";

type Tables = Database["public"]["Tables"];
export type DossierRow = Tables["dossiers"]["Row"];
export type MandateRow = Tables["mandates"]["Row"];
export type PieceRow = Tables["pieces"]["Row"];
export type ActionRow = Tables["actions"]["Row"];
export type MessageRow = Tables["messages"]["Row"];

export interface DossierDetail {
  dossier: DossierRow;
  verdict: VerdictGlobal | null;
  mandate: MandateRow | null;
  pieces: PieceRow[];
  actions: ActionRow[];
  messages: MessageRow[];
}

/** Liste les dossiers de l'utilisateur connecté (RLS) avec un résumé du dernier verdict. */
export async function listDossiersForUser(): Promise<
  { dossier: DossierRow; verdict: VerdictGlobal | null }[]
> {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("dossiers")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  return Promise.all(
    rows.map(async (dossier) => ({ dossier, verdict: await latestVerdict(dossier.id) })),
  );
}

/** Détail complet d'un dossier (RLS : null si non possédé). */
export async function getDossierDetail(id: string): Promise<DossierDetail | null> {
  const sb = await getSupabaseServer();
  const { data: dossier } = await sb.from("dossiers").select("*").eq("id", id).maybeSingle();
  if (!dossier) return null;

  const [verdict, mandate, pieces, actions, messages] = await Promise.all([
    latestVerdict(id),
    sb.from("mandates").select("*").eq("dossier_id", id).maybeSingle().then((r) => r.data),
    sb.from("pieces").select("*").eq("dossier_id", id).order("created_at").then((r) => r.data ?? []),
    sb
      .from("actions")
      .select("*")
      .eq("dossier_id", id)
      .order("scheduled_at", { ascending: true })
      .then((r) => r.data ?? []),
    sb.from("messages").select("*").eq("dossier_id", id).order("created_at").then((r) => r.data ?? []),
  ]);

  return { dossier, verdict, mandate, pieces, actions, messages };
}

async function latestVerdict(dossierId: string): Promise<VerdictGlobal | null> {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("verdicts")
    .select("*")
    .eq("dossier_id", dossierId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapVerdictRow(data) : null;
}
