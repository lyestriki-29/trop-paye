/**
 * Seed de démonstration : comptes + dossiers dans chaque état du pipeline.
 * À lancer avec Supabase local démarré : `pnpm --filter @troppaye/web db:seed-demo`.
 * Idempotent : purge et recrée les dossiers de démo du client. NE PAS exécuter en prod.
 */
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(path.resolve(process.cwd(), "../.."));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.");

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const ADMIN_EMAIL = "admin@troppaye.test";
const CLIENT_EMAIL = "client@troppaye.test";
const PASSWORD = "troppaye-demo-1234";

async function ensureUser(email: string, role: "client" | "admin"): Promise<string> {
  const { data: list } = await admin.auth.admin.listUsers();
  let user = list.users.find((u) => u.email === email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("createUser a échoué");
    user = data.user;
  }
  await admin.from("profiles").update({ role }).eq("id", user.id);
  return user.id;
}

function verdictResults(recoverable: number, confidence: string) {
  return [
    {
      ruleId: "DPE_FREEZE",
      ruleVersion: "2024-08",
      outcome: "IRREGULAR",
      confidence,
      recoverableCents: recoverable,
      futureMonthlySavingCents: Math.round(recoverable / 12),
      legalBasis: "Gel des loyers des passoires F/G — loi Climat et résilience (art. 159).",
      computation: { ruleId: "DPE_FREEZE", ruleVersion: "2024-08", steps: [{ label: "Trop-perçu", cents: recoverable }] },
    },
  ];
}

interface DemoSpec {
  status: string;
  recovery_state?: string;
  confidence: string;
  recoverable: number;
  address: string;
  withMandate?: boolean;
  withActions?: boolean;
}

const DEMOS: DemoSpec[] = [
  { status: "DIAGNOSED", confidence: "HIGH", recoverable: 142000, address: "3 rue du Diagnostic, 75011 Paris" },
  { status: "MANDATE_PENDING", confidence: "HIGH", recoverable: 98000, address: "8 rue du Mandat, 69003 Lyon", withMandate: true },
  { status: "IN_REVIEW", confidence: "HIGH", recoverable: 184200, address: "12 avenue de la Revue, 33000 Bordeaux", withMandate: true },
  { status: "IN_REVIEW", confidence: "LOW", recoverable: 41000, address: "5 impasse du Doute, 59000 Lille", withMandate: true },
  { status: "RECOVERY", recovery_state: "SCHEDULED", confidence: "HIGH", recoverable: 220000, address: "21 cours du Recouvrement, 31000 Toulouse", withMandate: true, withActions: true },
  { status: "RECOVERY", recovery_state: "PAUSED", confidence: "MEDIUM", recoverable: 76000, address: "2 place de la Pause, 44000 Nantes", withMandate: true, withActions: true },
  { status: "ESCALATED", recovery_state: "LOCKED", confidence: "HIGH", recoverable: 310000, address: "9 rue de l'Escalade, 67000 Strasbourg", withMandate: true, withActions: true },
  { status: "WON", recovery_state: "LOCKED", confidence: "HIGH", recoverable: 156000, address: "14 rue de la Victoire, 13001 Marseille", withMandate: true, withActions: true },
  { status: "LOST", confidence: "MEDIUM", recoverable: 60000, address: "7 allée Sans Suite, 35000 Rennes", withMandate: true },
];

async function main() {
  const adminId = await ensureUser(ADMIN_EMAIL, "admin");
  const clientId = await ensureUser(CLIENT_EMAIL, "client");
  console.log(`admin=${adminId} client=${clientId}`);

  // Purge des dossiers de démo précédents (cascade verdicts/mandates/actions).
  await admin.from("dossiers").delete().eq("user_id", clientId);

  const asOf = "2026-06-10";
  for (const d of DEMOS) {
    const { data: dossier } = await admin
      .from("dossiers")
      .insert({
        user_id: clientId,
        status: d.status,
        recovery_state: d.recovery_state ?? "SCHEDULED",
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
      results: verdictResults(d.recoverable, d.confidence),
      signals: [],
      as_of: asOf,
    });

    if (d.withMandate) {
      await admin.from("mandates").insert({
        dossier_id: dossier.id,
        status: "SIGNED",
        fee_rate_bps: 2500,
        signed_at: new Date().toISOString(),
      });
    }
    if (d.withActions) {
      await admin.from("actions").insert([
        { dossier_id: dossier.id, type: "LETTER_J0", scheduled_at: "2026-06-10", executed_at: "2026-06-10" },
        { dossier_id: dossier.id, type: "REMINDER_J21", scheduled_at: "2026-07-01" },
      ]);
    }
  }

  console.log(`Seed démo : ${DEMOS.length} dossiers créés pour ${CLIENT_EMAIL}.`);
  console.log(`Connexion (magic link local) : ${ADMIN_EMAIL} / ${CLIENT_EMAIL}.`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
