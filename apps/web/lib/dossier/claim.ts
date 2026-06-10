import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSessionToken } from "@/lib/diagnostic/session";

export type ClaimResult = "owned" | "claimed" | "forbidden";

/**
 * Rattache un dossier anonyme (créé via cookie `tp_session`) à un compte authentifié.
 * Idempotent et sûr : ne réclame que si le dossier n'appartient à personne ET que le
 * cookie correspond. Si déjà possédé par l'utilisateur → "owned" ; par un autre → "forbidden".
 * Écrit via service_role (la ligne a `user_id` NULL, donc hors RLS client).
 */
export async function claimDossierForUser(dossierId: string, userId: string): Promise<ClaimResult> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("dossiers")
    .select("user_id, session_token")
    .eq("id", dossierId)
    .single();

  if (!data) return "forbidden";
  if (data.user_id === userId) return "owned";
  if (data.user_id) return "forbidden";

  const token = await getSessionToken();
  if (token && data.session_token && data.session_token === token) {
    await admin
      .from("dossiers")
      .update({ user_id: userId, session_token: null })
      .eq("id", dossierId)
      .is("user_id", null);
    return "claimed";
  }
  return "forbidden";
}
