import { test, expect, chromium } from "@playwright/test";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";

/**
 * Fiche client admin + réponse libre. Prouve via la vraie UI back-office :
 *   1. La carte « Client » affiche prénom/nom + email + téléphone du locataire.
 *   2. L'admin tape une réponse libre → un message `sender='operator'` est créé.
 * Session admin dédiée (storageState à part), même garde-fou non-local que paiements.spec.
 */
const ADMIN_STATE = path.resolve(__dirname, ".auth/admin-dossier-state.json");
const ADMIN_EMAIL = "admin-dossier@troppaye.test";
const CLIENT_EMAIL = "client-dossier@troppaye.test";
const ADDR = "FICHE rue du Client, 75011 Paris";
const CLIENT_FIRST = "Camille";
const CLIENT_LAST = "Testeur";
const CLIENT_PHONE = "0612345678";
const REPLY = "Bonjour, nous avons bien reçu votre message, nous revenons vers vous.";

async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 5): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { last = e; await new Promise((r) => setTimeout(r, 1500 * (i + 1))); }
  }
  throw new Error(`${label} a échoué après ${tries} tentatives: ${String(last)}`);
}

let admin: SupabaseClient;
let appUrl: string;
let adminUserId: string;
let clientUserId: string;
let dossierId: string;

async function ensureUser(email: string): Promise<User> {
  const list = await withRetry("listUsers", async () => {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    return data;
  });
  const existing = list.users.find((u) => u.email === email);
  if (existing) {
    await withRetry("updateUser", async () => {
      const { error } = await admin.auth.admin.updateUserById(existing.id, { email_confirm: true });
      if (error) throw error;
    });
    return existing;
  }
  return withRetry("createUser", async () => {
    const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("createUser a échoué");
    return data.user;
  });
}

test.beforeAll(async () => {
  loadEnvConfig(path.resolve(__dirname, "../../.."));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (!url || !serviceKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.");
  const isLocal = /127\.0\.0\.1|localhost/.test(url);
  if (!isLocal && process.env.E2E_ALLOW_NONLOCAL_URL !== url) {
    throw new Error(`Refus : Supabase hors local (${url}). Définir E2E_ALLOW_NONLOCAL_URL=<url exacte>.`);
  }
  admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Admin (rôle admin) + client (profil nom/prénom/téléphone).
  const adminUser = await ensureUser(ADMIN_EMAIL);
  adminUserId = adminUser.id;
  await admin.from("profiles").update({ role: "admin" }).eq("id", adminUserId);

  const clientUser = await ensureUser(CLIENT_EMAIL);
  clientUserId = clientUser.id;
  await admin.from("profiles").update({
    role: "client", first_name: CLIENT_FIRST, last_name: CLIENT_LAST, phone: CLIENT_PHONE,
  }).eq("id", clientUserId);

  // Dossier du client (statut quelconque ; IN_REVIEW suffit).
  await admin.from("dossiers").delete().eq("user_id", clientUserId).eq("address_label", ADDR);
  const { data: dossier, error: dErr } = await admin
    .from("dossiers")
    .insert({ user_id: clientUserId, status: "IN_REVIEW", recovery_state: "SCHEDULED", address_label: ADDR, initial_rent_cents: 90000, current_rent_cents: 105000 })
    .select("id")
    .single();
  if (dErr || !dossier) throw dErr ?? new Error("création dossier a échoué");
  dossierId = dossier.id;

  // Session admin dédiée via magic-link.
  const linkData = await withRetry("generateLink", async () => {
    const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: ADMIN_EMAIL });
    if (error) throw error;
    return data;
  });
  const tokenHash = linkData?.properties?.hashed_token;
  if (!tokenHash) throw new Error("generateLink n'a pas renvoyé de token_hash");
  const loginUrl = `${appUrl}/auth/callback?token_hash=${tokenHash}&type=magiclink&next=${encodeURIComponent("/admin")}`;
  fs.mkdirSync(path.dirname(ADMIN_STATE), { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  let landed = false;
  for (let i = 0; i < 5 && !landed; i++) {
    try {
      await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForURL(/\/admin/, { timeout: 90_000 });
      landed = true;
    } catch { await page.waitForTimeout(2000); }
  }
  if (!landed) { await browser.close(); throw new Error("Auth admin e2e échouée."); }
  await context.storageState({ path: ADMIN_STATE });
  await browser.close();
});

test.afterAll(async () => {
  if (admin) {
    if (dossierId) await admin.from("dossiers").delete().eq("id", dossierId);
    for (const id of [clientUserId, adminUserId]) {
      if (id) await withRetry("deleteUser", async () => {
        const { error } = await admin.auth.admin.deleteUser(id);
        if (error) throw error;
      });
    }
  }
  if (fs.existsSync(ADMIN_STATE)) fs.rmSync(ADMIN_STATE);
});

test("fiche client visible + réponse admin libre", async ({ browser }) => {
  const context = await browser.newContext({ storageState: ADMIN_STATE });
  const page = await context.newPage();
  try {
    await page.goto(`/admin/dossiers/${dossierId}`);
    await expect(page.getByRole("heading", { name: ADDR })).toBeVisible();

    // 1. Carte « Client » : nom, email, téléphone.
    await expect(page.getByText(`${CLIENT_FIRST} ${CLIENT_LAST}`)).toBeVisible();
    await expect(page.getByText(CLIENT_EMAIL)).toBeVisible();
    await expect(page.getByText(CLIENT_PHONE)).toBeVisible();

    // 2. Réponse libre au client.
    await page.getByLabel(/répondre au client/i).fill(REPLY);
    await page.getByRole("button", { name: /envoyer au client/i }).click();
    await expect(page.getByText(REPLY)).toBeVisible({ timeout: 30_000 });
  } finally {
    await context.close();
  }

  // Vérité base : un message operator a été créé.
  const { data: msgs } = await admin
    .from("messages")
    .select("sender, body")
    .eq("dossier_id", dossierId)
    .eq("sender", "operator");
  expect((msgs ?? []).some((m) => m.body === REPLY)).toBe(true);
});
