import { test, expect, chromium } from "@playwright/test";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";

/**
 * Demande de rappel : un client crée une demande via l'UI → ligne callback_requests
 * PENDING → un admin la voit sur /admin/rappels et la marque traitée (DONE).
 * Sessions dédiées (storageState séparés), même garde-fou non-local que paiements.spec.
 */
const CLIENT_STATE = path.resolve(__dirname, ".auth/rappel-client-state.json");
const ADMIN_STATE = path.resolve(__dirname, ".auth/rappel-admin-state.json");
const CLIENT_EMAIL = "rappel-client@troppaye.test";
const ADMIN_EMAIL = "rappel-admin@troppaye.test";
const ADDR = "RAPPEL rue du Contact, 75011 Paris";
const SUBJECT = "Question QA rappel";

async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 5): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { last = e; await new Promise((r) => setTimeout(r, 1500 * (i + 1))); }
  }
  throw new Error(`${label} a échoué après ${tries} tentatives: ${String(last)}`);
}

let admin: SupabaseClient;
let appUrl: string;
let clientUserId: string;
let adminUserId: string;
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

async function sessionState(email: string, next: string, statePath: string): Promise<void> {
  const linkData = await withRetry("generateLink", async () => {
    const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (error) throw error;
    return data;
  });
  const tokenHash = linkData?.properties?.hashed_token;
  if (!tokenHash) throw new Error("generateLink n'a pas renvoyé de token_hash");
  const loginUrl = `${appUrl}/auth/callback?token_hash=${tokenHash}&type=magiclink&next=${encodeURIComponent(next)}`;
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  let landed = false;
  for (let i = 0; i < 5 && !landed; i++) {
    try {
      await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForURL(new RegExp(next.replace(/[/]/g, "\\/")), { timeout: 90_000 });
      landed = true;
    } catch { await page.waitForTimeout(2000); }
  }
  if (!landed) { await browser.close(); throw new Error(`Auth e2e échouée pour ${email}`); }
  await context.storageState({ path: statePath });
  await browser.close();
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

  const clientUser = await ensureUser(CLIENT_EMAIL);
  clientUserId = clientUser.id;
  await admin.from("profiles").update({ role: "client", phone: "0612345678" }).eq("id", clientUserId);
  const adminUser = await ensureUser(ADMIN_EMAIL);
  adminUserId = adminUser.id;
  await admin.from("profiles").update({ role: "admin" }).eq("id", adminUserId);

  await admin.from("dossiers").delete().eq("user_id", clientUserId).eq("address_label", ADDR);
  const { data: dossier, error: dErr } = await admin
    .from("dossiers")
    .insert({ user_id: clientUserId, status: "IN_REVIEW", recovery_state: "SCHEDULED", address_label: ADDR, initial_rent_cents: 90000, current_rent_cents: 105000 })
    .select("id")
    .single();
  if (dErr || !dossier) throw dErr ?? new Error("création dossier a échoué");
  dossierId = dossier.id;

  await sessionState(CLIENT_EMAIL, "/espace", CLIENT_STATE);
  await sessionState(ADMIN_EMAIL, "/admin", ADMIN_STATE);
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
  for (const s of [CLIENT_STATE, ADMIN_STATE]) if (fs.existsSync(s)) fs.rmSync(s);
});

test("client demande un rappel → admin le voit et le traite", async ({ browser }) => {
  // 1. Client crée la demande via l'UI.
  const cc = await browser.newContext({ storageState: CLIENT_STATE });
  const cp = await cc.newPage();
  try {
    await cp.goto(`/espace/${dossierId}`);
    await cp.getByRole("button", { name: "Contact" }).click();
    await cp.getByLabel("Sujet").fill(SUBJECT);
    await cp.getByRole("button", { name: "Dès que possible" }).click();
    await cp.getByRole("button", { name: /demander à être rappelé/i }).click();
    await expect(cp.getByText(/demande reçue/i)).toBeVisible({ timeout: 30_000 });
  } finally {
    await cc.close();
  }

  // Vérité base : une ligne PENDING existe.
  const { data: rows } = await admin
    .from("callback_requests")
    .select("id, status, subject")
    .eq("dossier_id", dossierId);
  expect((rows ?? []).some((r) => r.subject === SUBJECT && r.status === "PENDING")).toBe(true);

  // 2. Admin voit la demande et la traite.
  const ac = await browser.newContext({ storageState: ADMIN_STATE });
  const ap = await ac.newPage();
  try {
    await ap.goto("/admin/rappels");
    await expect(ap.getByText(SUBJECT)).toBeVisible({ timeout: 30_000 });
    await ap.getByRole("button", { name: /marquer rappelé/i }).first().click();
    await expect(ap.getByText(SUBJECT)).toHaveCount(0, { timeout: 30_000 });
  } finally {
    await ac.close();
  }

  const { data: after } = await admin
    .from("callback_requests")
    .select("status")
    .eq("dossier_id", dossierId)
    .maybeSingle();
  expect(after?.status).toBe("DONE");
});
