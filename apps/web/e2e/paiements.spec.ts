import { test, expect, chromium } from "@playwright/test";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";

/**
 * Encaissement (ports MOCK) — prouve la répartition d'un versement enregistré
 * depuis l'UI admin (`/admin/dossiers/<id>`, Server Action `recordPayment`) :
 *   1 `fund_movements` IN  = montant total convenu
 *   1 `fund_movements` OUT_FEE     = round(montant * fee_bps / 10000)  (25 % par défaut)
 *   1 `fund_movements` OUT_TENANT  = reste
 * et la transition RECOVERY → WON (montant unique = solde de tout compte).
 *
 * `recordPayment` est une Server Action ADMIN (pas de route HTTP) : impossible à
 * appeler directement. On passe donc par la vraie UI back-office, avec une session
 * admin DÉDIÉE à ce fichier (storageState à part — on n'emprunte PAS la session
 * client partagée du global-setup). Le port paiement est un mock (références
 * MOCK-IN / MOCK-OUT) et `recordPayment` ne déchiffre PAS l'IBAN : il vérifie
 * seulement la présence d'une ligne `payout_details` → `iban_encrypted` peut
 * être n'importe quelle chaîne. La LRE n'intervient pas dans ce flux (mock no-op).
 */

// Session admin propre à ce fichier (jamais le storageState client partagé).
// NB : pas de `test.use({ storageState })` au niveau module — sinon @playwright/test
// injecte ce storageState dans TOUS les `browser.newContext()`, y compris celui du
// beforeAll censé le CRÉER (le fichier n'existe pas encore → ENOENT). On crée donc
// le contexte admin manuellement dans le test, avec un storageState explicite.
const ADMIN_STATE = path.resolve(__dirname, ".auth/admin-pay-state.json");

const ADMIN_EMAIL = "admin-pay@troppaye.test";
const ADMIN_ADDR = "PAY rue de l'Encaissement, 75011 Paris";

// Montants en centimes — choisis en euros ronds : le champ « Versement encaissé »
// est saisi en EUROS (l'action multiplie par 100) et n'accepte que des chiffres.
const AGREED_CENTS = 120000; // 1 200 € convenus = un seul versement = solde.
const FEE_BPS = 2500; // 25 % (défaut + mandat explicite).
const EXPECTED_FEE = Math.round((AGREED_CENTS * FEE_BPS) / 10000); // 30 000
const EXPECTED_TENANT = AGREED_CENTS - EXPECTED_FEE; // 90 000

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

let admin: SupabaseClient;
let appUrl: string;
let adminUserId: string;
let dossierId: string;

/** Crée le compte admin s'il manque, garantit mot de passe + email confirmé. */
async function ensureAdminUser(): Promise<User> {
  const list = await withRetry("listUsers", async () => {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    return data;
  });
  const existing = list.users.find((u) => u.email === ADMIN_EMAIL);
  if (existing) {
    await withRetry("updateUser", async () => {
      const { error } = await admin.auth.admin.updateUserById(existing.id, { email_confirm: true });
      if (error) throw error;
    });
    return existing;
  }
  return withRetry("createUser", async () => {
    const { data, error } = await admin.auth.admin.createUser({ email: ADMIN_EMAIL, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("createUser admin a échoué");
    return data.user;
  });
}

test.beforeAll(async () => {
  loadEnvConfig(path.resolve(__dirname, "../../.."));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.");
  }

  // Même garde-fou que global-setup : écritures destructives interdites hors local,
  // sauf opt-in explicite sur l'URL EXACTE d'un cloud jetable.
  const isLocal = /127\.0\.0\.1|localhost/.test(url);
  if (!isLocal && process.env.E2E_ALLOW_NONLOCAL_URL !== url) {
    throw new Error(`Refus : Supabase hors local (${url}). Pour un cloud de test, définir E2E_ALLOW_NONLOCAL_URL=<url exacte>.`);
  }

  admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 1. Admin dédié + rôle 'admin' en base (la garde requireAdmin lit profiles.role).
  const adminUser = await ensureAdminUser();
  adminUserId = adminUser.id;
  await admin.from("profiles").update({ role: "admin" }).eq("id", adminUserId);

  // 2. Dossier RECOVERY/SCHEDULED propre + verdict (prefill montant), mandat
  //    (fee_rate_bps explicite) et payout_details (présence requise, IBAN non lu).
  await admin.from("dossiers").delete().eq("user_id", adminUserId).eq("address_label", ADMIN_ADDR);
  const { data: dossier, error: dErr } = await admin
    .from("dossiers")
    .insert({
      user_id: adminUserId,
      status: "RECOVERY",
      recovery_state: "SCHEDULED",
      address_label: ADMIN_ADDR,
      initial_rent_cents: 90000,
      current_rent_cents: 105000,
    })
    .select("id")
    .single();
  if (dErr || !dossier) throw dErr ?? new Error("création dossier RECOVERY a échoué");
  dossierId = dossier.id;

  // Verdict : `results: []` (le `RuleCard` n'a rien à mapper) ; le montant
  // récupérable préremplit le champ versement côté UI.
  await admin.from("verdicts").insert({
    dossier_id: dossierId,
    outcome: "REFUND_DUE",
    confidence: "HIGH",
    total_recoverable_cents: AGREED_CENTS,
    results: [],
    as_of: "2026-01-01",
  });

  // Mandat : fige la commission à 25 % (fee_rate_bps lu par recordPayment).
  await admin.from("mandates").insert({
    dossier_id: dossierId,
    status: "SIGNED",
    fee_rate_bps: FEE_BPS,
  });

  // Coordonnées de reversement : seule la PRÉSENCE compte (l'IBAN n'est jamais
  // déchiffré par recordPayment / le port mock) → valeur factice suffisante.
  await admin.from("payout_details").insert({
    dossier_id: dossierId,
    holder_name: "Locataire Encaissement",
    iban_encrypted: "enc::pay-test",
  });

  // 3. Session admin DÉDIÉE : magic-link à usage unique échangé dans un vrai
  //    navigateur → storageState à part (on ne touche pas la session client).
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
  // Le serveur dev peut compiler la 1re route : on retente l'atterrissage sur /admin.
  let landed = false;
  for (let i = 0; i < 5 && !landed; i++) {
    try {
      await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForURL(/\/admin/, { timeout: 90_000 });
      landed = true;
    } catch {
      await page.waitForTimeout(2000);
    }
  }
  if (!landed) {
    await browser.close();
    throw new Error("Échec de l'authentification admin e2e (callback non abouti).");
  }
  await context.storageState({ path: ADMIN_STATE });
  await browser.close();
});

test.afterAll(async () => {
  // NETTOYAGE impératif (gabarit cloné pour une cliente) : dossier (cascade
  // verdicts/mandates/payout_details/fund_movements/actions) puis user admin.
  if (admin) {
    if (dossierId) await admin.from("dossiers").delete().eq("id", dossierId);
    if (adminUserId) {
      await withRetry("deleteUser", async () => {
        const { error } = await admin.auth.admin.deleteUser(adminUserId);
        if (error) throw error;
      });
    }
  }
  if (fs.existsSync(ADMIN_STATE)) fs.rmSync(ADMIN_STATE);
});

test("encaissement total : IN + OUT_FEE + OUT_TENANT + transition WON (ports mock)", async ({ browser }) => {
  // Contexte admin créé manuellement depuis le storageState écrit en beforeAll.
  const context = await browser.newContext({ storageState: ADMIN_STATE });
  const page = await context.newPage();
  try {
    await page.goto(`/admin/dossiers/${dossierId}`);

    // On est bien sur le dossier admin attendu, en RECOVERY.
    await expect(page.getByRole("heading", { name: ADMIN_ADDR })).toBeVisible();
    await expect(page.getByText("RECOVERY", { exact: true })).toBeVisible();

    // Le champ « Versement encaissé (€) » est en euros : on fige la valeur exacte
    // (1 200 €) plutôt que de dépendre du prefill, puis on enregistre.
    await page.getByLabel(/versement encaissé/i).fill(String(AGREED_CENTS / 100));
    await page.getByRole("button", { name: /enregistrer le versement/i }).click();

    // L'UI re-render : les 3 mouvements de fonds apparaissent côté détail.
    await expect(page.getByText("OUT_TENANT", { exact: true })).toBeVisible({ timeout: 30_000 });
  } finally {
    await context.close();
  }

  // ---- Assertions de vérité (service_role, indépendantes de l'affichage) ----
  const { data: funds, error: fErr } = await admin
    .from("fund_movements")
    .select("direction, amount_cents, reference")
    .eq("dossier_id", dossierId)
    .order("direction");
  expect(fErr).toBeNull();
  expect(funds).toHaveLength(3);

  const byDir = new Map((funds ?? []).map((f) => [f.direction, f]));
  expect(byDir.get("IN")?.amount_cents).toBe(AGREED_CENTS);
  expect(byDir.get("OUT_FEE")?.amount_cents).toBe(EXPECTED_FEE);
  expect(byDir.get("OUT_TENANT")?.amount_cents).toBe(EXPECTED_TENANT);
  // Vérifie la cohérence comptable : la répartition ne perd ni ne crée de centime.
  expect(EXPECTED_FEE + EXPECTED_TENANT).toBe(AGREED_CENTS);

  // Ports MOCK : références simulées MOCK-IN-… (IN/OUT_FEE) et MOCK-OUT-… (OUT_TENANT).
  expect(byDir.get("IN")?.reference).toMatch(/^MOCK-IN-/);
  expect(byDir.get("OUT_FEE")?.reference).toMatch(/^MOCK-IN-/);
  expect(byDir.get("OUT_TENANT")?.reference).toMatch(/^MOCK-OUT-/);

  // Actions tracées : PAYMENT_RECEIVED + PAYOUT_SENT.
  const { data: actions } = await admin
    .from("actions")
    .select("type")
    .eq("dossier_id", dossierId)
    .in("type", ["PAYMENT_RECEIVED", "PAYOUT_SENT"]);
  const types = new Set((actions ?? []).map((a) => a.type));
  expect(types.has("PAYMENT_RECEIVED")).toBe(true);
  expect(types.has("PAYOUT_SENT")).toBe(true);

  // Transition : solde atteint → WON + recovery_state LOCKED.
  const { data: after } = await admin
    .from("dossiers")
    .select("status, recovery_state")
    .eq("id", dossierId)
    .single();
  expect(after?.status).toBe("WON");
  expect(after?.recovery_state).toBe("LOCKED");
});
