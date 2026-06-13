import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";

/**
 * Auth e2e (DEV/local uniquement) : garantit le compte démo, crée un dossier
 * MANDATE_PENDING propre pour le test du gate, échange un lien magic-link dans un
 * vrai navigateur et sauvegarde le storageState. Mirroir de scripts/demo-login.ts.
 */
const CLIENT_EMAIL = "client@troppaye.test";
const PASSWORD = "troppaye-demo-1234";
const GATE_ADDR = "E2E rue du Gate, 75011 Paris";
const AUTH_DIR = path.resolve(__dirname, ".auth");

/** GoTrue local hoquette parfois (AuthRetryableFetchError) : on retente. */
async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 5): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw new Error(`${label} a échoué après ${tries} tentatives: ${String(last)}`);
}

export default async function globalSetup(): Promise<void> {
  loadEnvConfig(path.resolve(__dirname, "../../.."));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (!url || !serviceKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.");
  if (!/127\.0\.0\.1|localhost/.test(url)) throw new Error(`Refus : Supabase hors local (${url}).`);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 1. Compte démo
  const list = await withRetry("listUsers", async () => {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    return data;
  });
  let user = list.users.find((u) => u.email === CLIENT_EMAIL);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({ email: CLIENT_EMAIL, password: PASSWORD, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("createUser a échoué");
    user = data.user;
  }
  const clientId = user.id;
  await admin.from("profiles").update({ role: "client" }).eq("id", clientId);

  // 2. Dossier MANDATE_PENDING propre (idempotent) pour le test du gate
  await admin.from("dossiers").delete().eq("user_id", clientId).eq("address_label", GATE_ADDR);
  const { data: gate, error: gErr } = await admin
    .from("dossiers")
    .insert({
      user_id: clientId,
      status: "MANDATE_PENDING",
      recovery_state: "SCHEDULED",
      address_label: GATE_ADDR,
      initial_rent_cents: 90000,
      current_rent_cents: 105000,
    })
    .select("id")
    .single();
  if (gErr || !gate) throw gErr ?? new Error("création dossier gate a échoué");

  // 3. Un dossier générique existant (pour apercu/messages/versement/compte)
  const { data: anyDossier } = await admin
    .from("dossiers")
    .select("id")
    .eq("user_id", clientId)
    .neq("address_label", GATE_ADDR)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const dossierId = anyDossier?.id ?? gate.id;

  // 4. Lien de connexion à usage unique → storageState
  const linkData = await withRetry("generateLink", async () => {
    const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: CLIENT_EMAIL });
    if (error) throw error;
    return data;
  });
  const tokenHash = linkData?.properties?.hashed_token;
  if (!tokenHash) throw new Error("generateLink n'a pas renvoyé de token_hash");
  const loginUrl = `${appUrl}/auth/callback?token_hash=${tokenHash}&type=magiclink&next=${encodeURIComponent("/espace")}`;

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  // Le serveur dev peut compiler la 1re route : on retente.
  let landed = false;
  for (let i = 0; i < 5 && !landed; i++) {
    try {
      await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForURL(/\/espace/, { timeout: 90_000 });
      landed = true;
    } catch {
      await page.waitForTimeout(2000);
    }
  }
  if (!landed) throw new Error("Échec de l'authentification e2e (callback non abouti).");

  await context.storageState({ path: path.join(AUTH_DIR, "state.json") });
  fs.writeFileSync(path.join(AUTH_DIR, "fixtures.json"), JSON.stringify({ dossierId, mandatePendingDossierId: gate.id }, null, 2));
  await browser.close();
}
