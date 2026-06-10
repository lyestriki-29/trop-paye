import type { VerdictGlobal } from "@troppaye/rules-engine";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSessionToken } from "./session";
import { mapVerdictRow } from "./verdict-map";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface VerdictForSession {
  verdict: VerdictGlobal;
  addressLabel: string;
  dossierId: string;
}

/**
 * Lit un verdict de diagnostic anonyme. La RLS interdit la lecture sans `auth.uid()` ;
 * on relit donc via service_role MAIS on ne retourne le verdict QUE si le cookie de
 * session correspond au `session_token` du dossier propriétaire. Le `verdictId` (uuid)
 * seul ne suffit pas : il faut posséder le cookie émis lors de la soumission.
 */
export async function getVerdictForSession(verdictId: string): Promise<VerdictForSession | null> {
  if (!UUID_RE.test(verdictId)) return null;

  const token = await getSessionToken();
  if (!token) return null;

  const admin = getSupabaseAdmin();
  const { data: v, error } = await admin
    .from("verdicts")
    .select(
      "dossier_id, outcome, confidence, total_recoverable_cents, total_future_monthly_saving_cents, results, signals, as_of",
    )
    .eq("id", verdictId)
    .single();
  if (error || !v) return null;

  const { data: dossier } = await admin
    .from("dossiers")
    .select("session_token, address_label")
    .eq("id", v.dossier_id)
    .single();
  if (!dossier || !dossier.session_token || dossier.session_token !== token) return null;

  const verdict: VerdictGlobal = mapVerdictRow(v);
  return { verdict, addressLabel: dossier.address_label ?? "", dossierId: v.dossier_id };
}
