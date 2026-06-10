import type { z } from "zod";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Erreur d'autorisation (session/ownership). */
export class AuthError extends Error {
  constructor(message = "Non autorisé") {
    super(message);
    this.name = "AuthError";
  }
}

type SupabaseServer = Awaited<ReturnType<typeof getSupabaseServer>>;
export interface AuthContext {
  user: User;
  supabase: SupabaseServer;
}

/** Exige une session valide. À appeler en tête de chaque Server Action protégée. */
export async function requireUser(): Promise<AuthContext> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentification requise");
  return { user, supabase };
}

/** Exige le rôle admin (vérifié en base, pas seulement côté UI). */
export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await requireUser();
  const { data } = await ctx.supabase.from("profiles").select("role").eq("id", ctx.user.id).single();
  const role = (data as { role: string } | null)?.role;
  if (role !== "admin") throw new AuthError("Accès réservé à l'administration");
  return ctx;
}

/**
 * Enveloppe une Server Action : (1) session, (2) validation zod du payload,
 * (3) handler. Traite chaque action comme un endpoint POST public (anti-IDOR).
 * L'ownership précis (ex. appartenance du dossier) est vérifié dans le handler.
 */
export function withAuth<TSchema extends z.ZodTypeAny, TResult>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>, ctx: AuthContext) => Promise<TResult>,
): (raw: unknown) => Promise<TResult> {
  return async (raw: unknown) => {
    const ctx = await requireUser();
    const input = schema.parse(raw) as z.infer<TSchema>;
    return handler(input, ctx);
  };
}
