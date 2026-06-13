/**
 * CLI de connexion démo (DEV/local uniquement) : garantit le compte démo
 * `client@troppaye.test` (confirmé), lui crée 3 dossiers de démo si l'espace est
 * vide, puis imprime un LIEN DE CONNEXION DIRECT (sans email, via le callback
 * token_hash). Coller le lien dans le navigateur → connecté sur /espace.
 *
 *   pnpm --filter @troppaye/web db:demo-login
 *
 * NE PAS exécuter en prod (utilise la service_role + crée un compte de test).
 */
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(path.resolve(process.cwd(), "../.."));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
if (!url || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.");
}

// Garde-fou : ce script ne doit jamais viser un projet cloud.
if (!/127\.0\.0\.1|localhost/.test(url)) {
  throw new Error(`Refus : NEXT_PUBLIC_SUPABASE_URL pointe hors local (${url}). Script DEV uniquement.`);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const CLIENT_EMAIL = "client@troppaye.test";
const PASSWORD = "troppaye-demo-1234";

async function ensureClient(): Promise<string> {
  const { data: list } = await admin.auth.admin.listUsers();
  let user = list.users.find((u) => u.email === CLIENT_EMAIL);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: CLIENT_EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("createUser a échoué");
    user = data.user;
  }
  await admin.from("profiles").update({ role: "client" }).eq("id", user.id);
  return user.id;
}

const DEMO_DOSSIERS = [
  { status: "DIAGNOSED", recovery_state: "SCHEDULED", confidence: "HIGH", recoverable: 142000, address: "3 rue du Diagnostic, 75011 Paris" },
  { status: "RECOVERY", recovery_state: "SCHEDULED", confidence: "HIGH", recoverable: 220000, address: "21 cours du Recouvrement, 31000 Toulouse" },
  { status: "WON", recovery_state: "LOCKED", confidence: "HIGH", recoverable: 156000, address: "14 rue de la Victoire, 13001 Marseille" },
];

async function ensureDossiers(clientId: string): Promise<number> {
  const { count } = await admin
    .from("dossiers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", clientId);
  if ((count ?? 0) > 0) return count ?? 0;

  for (const d of DEMO_DOSSIERS) {
    const { data: dossier } = await admin
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
    await admin.from("verdicts").insert({
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
  return DEMO_DOSSIERS.length;
}

async function main(): Promise<void> {
  const clientId = await ensureClient();
  const dossiers = await ensureDossiers(clientId);

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: CLIENT_EMAIL,
  });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) throw error ?? new Error("generateLink n'a pas renvoyé de token_hash");

  const loginUrl = `${appUrl}/auth/callback?token_hash=${tokenHash}&type=magiclink&next=${encodeURIComponent("/espace")}`;

  console.log("\n────────────────────────────────────────────────────────");
  console.log(`  Espace démo prêt — ${CLIENT_EMAIL} (${dossiers} dossiers)`);
  console.log("  Colle ce lien dans ton navigateur pour te connecter :");
  console.log(`\n  ${loginUrl}\n`);
  console.log("  (lien à usage unique ; relance la commande pour en regénérer un)");
  console.log("────────────────────────────────────────────────────────\n");
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
