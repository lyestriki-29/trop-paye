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
    // Claim atomique : on ne retourne "claimed" QUE si l'UPDATE a réellement modifié la ligne
    // (sinon une requête concurrente l'a déjà réclamée entre le SELECT et l'UPDATE).
    const { data: updated } = await admin
      .from("dossiers")
      .update({ user_id: userId, session_token: null })
      .eq("id", dossierId)
      .is("user_id", null)
      .select("id")
      .maybeSingle();
    return updated ? "claimed" : "forbidden";
  }
  return "forbidden";
}

/**
 * Rattachement par EMAIL VÉRIFIÉ (fuite cross-browser colmatée, 2026-06-11) :
 * Léa fait son diagnostic dans la webview TikTok, le magic link s'ouvre dans
 * Safari → pas de cookie `tp_session`, dossier orphelin. Or le magic link
 * PROUVE la propriété de l'email : on rattache tous les dossiers sans
 * propriétaire dont le lead porte cet email. Appelé au callback d'auth.
 */
export async function claimDossiersByEmail(userId: string, email: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data: leads } = await admin.from("leads").select("dossier_id").eq("email", email);
  const ids = (leads ?? []).map((l) => l.dossier_id);
  if (ids.length === 0) return;
  // `is user_id null` : on ne vole JAMAIS un dossier déjà possédé (même e-mail
  // re-saisi sur le dossier d'un tiers → le cookie/propriétaire prime).
  await admin
    .from("dossiers")
    .update({ user_id: userId, session_token: null })
    .in("id", ids)
    .is("user_id", null);
}
