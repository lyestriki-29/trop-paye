"use server";

import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Connexion démo « 1 clic » — DEV/LOCAL UNIQUEMENT.
 *
 * Garantit le compte démo (client ou admin), génère un magic link via la
 * service_role (aucun email envoyé → insensible au blocker SMTP), puis redirige
 * vers /auth/callback qui pose la session. Câblé aux boutons de `/login`, rendus
 * seulement hors production.
 *
 * Double garde-fou : les boutons ne s'affichent pas en prod ET l'action refuse
 * si `NODE_ENV === "production"`. À ne jamais activer en prod : ces comptes
 * ouvrent une session admin sans vérification.
 */

const DEMO = {
  client: { email: "client@troppaye.test", role: "client", next: "/espace" },
  admin: { email: "admin@troppaye.test", role: "admin", next: "/admin" },
} as const;

const DEMO_PASSWORD = "troppaye-demo-1234";

// Dossiers de démo (mêmes données que le CLI `db:demo-login`) — seedés au premier
// clic « client démo » si l'espace est vide, pour avoir de quoi regarder.
const DEMO_DOSSIERS = [
  { status: "DIAGNOSED", recovery_state: "SCHEDULED", confidence: "HIGH", recoverable: 142000, address: "3 rue du Diagnostic, 75011 Paris" },
  { status: "RECOVERY", recovery_state: "SCHEDULED", confidence: "HIGH", recoverable: 220000, address: "21 cours du Recouvrement, 31000 Toulouse" },
  { status: "WON", recovery_state: "LOCKED", confidence: "HIGH", recoverable: 156000, address: "14 rue de la Victoire, 13001 Marseille" },
] as const;

type DemoRole = keyof typeof DEMO;

async function ensureDemoDossiers(adminClient: ReturnType<typeof getSupabaseAdmin>, clientId: string): Promise<void> {
  const { count } = await adminClient
    .from("dossiers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", clientId);
  if ((count ?? 0) > 0) return;

  for (const d of DEMO_DOSSIERS) {
    const { data: dossier } = await adminClient
      .from("dossiers")
      .insert({
        user_id: clientId,
        status: d.status,
        recovery_state: d.recovery_state,
        address_label: d.address,
        initial_rent_cents: 90000,
        current_rent_cents: 105000,
      })
      .select("id")
      .single();
    if (!dossier) continue;
    await adminClient.from("verdicts").insert({
      dossier_id: dossier.id,
      outcome: "IRREGULAR",
      confidence: d.confidence,
      total_recoverable_cents: d.recoverable,
      total_future_monthly_saving_cents: Math.round(d.recoverable / 12),
      results: [
        {
          ruleId: "DPE_FREEZE",
          ruleVersion: "2024-08",
          outcome: "IRREGULAR",
          confidence: d.confidence,
          recoverableCents: d.recoverable,
          futureMonthlySavingCents: Math.round(d.recoverable / 12),
          legalBasis: "Gel des loyers des passoires F/G — loi Climat et résilience (art. 159).",
          computation: { ruleId: "DPE_FREEZE", ruleVersion: "2024-08", steps: [{ label: "Trop-perçu", cents: d.recoverable }] },
        },
      ],
      signals: [],
      as_of: "2026-06-10",
    });
  }
}

async function runDevDemoLogin(role: DemoRole): Promise<never> {
  // Garde-fou serveur (défense en profondeur — le rendu conditionnel ne suffit pas).
  if (process.env.NODE_ENV === "production") {
    redirect("/login?error=auth");
  }
  const cfg = DEMO[role];
  const adminClient = getSupabaseAdmin();

  // 1. Garantir le compte démo (créé + confirmé si absent) et son rôle.
  const { data: list } = await adminClient.auth.admin.listUsers();
  let user = list.users.find((u) => u.email === cfg.email);
  if (!user) {
    const { data } = await adminClient.auth.admin.createUser({
      email: cfg.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    user = data.user ?? undefined;
  }
  if (!user) throw new Error("[dev-login] createUser n'a pas renvoyé d'utilisateur.");
  await adminClient.from("profiles").update({ role: cfg.role }).eq("id", user.id);

  if (role === "client") {
    await ensureDemoDossiers(adminClient, user.id);
  }

  // 2. Magic link (sans email) → on récupère le token_hash.
  const { data: link, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: cfg.email,
  });
  const tokenHash = link?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    // Dev-only : on remonte la vraie cause (clé service_role, projet…) au lieu de masquer.
    throw new Error(`[dev-login] generateLink a échoué : ${linkError?.message ?? "pas de token_hash"}`);
  }

  // 3. Échange le token contre une session DANS l'action (pose les cookies),
  //    sans passer par le Route Handler /auth/callback.
  const supabase = await getSupabaseServer();
  const { error: otpError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });
  if (otpError) {
    throw new Error(`[dev-login] verifyOtp a échoué : ${otpError.message}`);
  }

  redirect(cfg.next);
}

export async function devLoginClient(): Promise<void> {
  await runDevDemoLogin("client");
}

export async function devLoginAdmin(): Promise<void> {
  await runDevDemoLogin("admin");
}
