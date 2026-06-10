"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { safeRelativePath } from "@/lib/safe-redirect";

export interface LoginState {
  error?: string;
  sent?: boolean;
}

const emailSchema = z.string().email("Adresse email invalide");

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Email invalide" };

  const next = safeRelativePath(String(formData.get("next") ?? ""));
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: "Envoi impossible pour le moment. Réessayez." };
  return { sent: true };
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
