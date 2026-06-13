"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { safeRelativePath } from "@/lib/safe-redirect";
import { claimDossiersByEmail } from "@/lib/dossier/claim";

export interface LoginState {
  error?: string;
  /** Le code a été envoyé : l'UI bascule sur l'étape de saisie. */
  sent?: boolean;
  /** Email confirmé à l'étape 1, reporté à l'étape 2 (champ caché). */
  email?: string;
}

const emailSchema = z.string().email("Adresse email invalide");
const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Entrez le code à 6 chiffres reçu par email");

/**
 * Étape 1 — envoie un code à 6 chiffres par email (OTP).
 * `signInWithOtp` envoie un code dès que le template email porte `{{ .Token }}`
 * (cf. supabase/templates/magic_link.html). Pas de lien : rien à rediriger.
 */
export async function sendLoginCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Email invalide" };

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { shouldCreateUser: true },
  });
  if (error) return { error: "Envoi impossible pour le moment. Réessayez.", email: parsed.data };
  return { sent: true, email: parsed.data };
}

/**
 * Étape 2 — vérifie le code et ouvre la session (cookies posés par le client
 * serveur). Rattache les dossiers orphelins de l'email puis redirige vers `next`.
 */
export async function verifyLoginCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) return { error: "Email invalide" };

  const code = codeSchema.safeParse(String(formData.get("code") ?? ""));
  if (!code.success) {
    return { sent: true, email: email.data, error: code.error.issues[0]?.message ?? "Code invalide" };
  }

  const next = safeRelativePath(String(formData.get("next") ?? ""));
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.data,
    token: code.data,
    type: "email",
  });
  if (error) {
    return {
      sent: true,
      email: email.data,
      error: "Code invalide ou expiré. Renvoyez-en un nouveau.",
    };
  }

  const user = data.session?.user;
  if (user?.email) {
    try {
      await claimDossiersByEmail(user.id, user.email);
    } catch {
      /* best-effort : la connexion ne casse jamais pour un rattachement raté */
    }
  }
  // `next` est validé same-origin relatif → pas d'open-redirect.
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
