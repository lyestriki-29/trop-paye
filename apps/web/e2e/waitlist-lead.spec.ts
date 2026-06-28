import { test, expect, chromium, type Page } from "@playwright/test";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";

/**
 * Parcours WAITLIST de bout en bout (lancement léger MANDATE_ENABLED=false) :
 *   1. Un VISITEUR ANONYME (sans login) fait le diagnostic public jusqu'au verdict.
 *   2. Sur la page verdict, il laisse son email via le module de capture
 *      (RecapCaptureModule → submitLead, table `leads`, anonyme par cookie de session).
 *   3. Ce lead apparaît dans le back-office /admin/funnel, file de recontact
 *      « Leads capturés : à recontacter » (ajoutée en P1, lue directement depuis leads).
 *
 * Le tunnel rejoue les conventions de diagnostic-tunnel.spec (autocomplete IGN réel,
 * adresse parisienne « rue du Bac », storageState vide). La session admin réutilise le
 * helper magic-link de contact-rappel.spec (même garde-fou non-local que global-setup).
 *
 * NOTE POLLUTION : crée un dossier anonyme « rue du Bac » + un lead jetable
 * (email marqueur ci-dessous). On supprime le lead et le dossier en fin de test.
 */
const TEST_ADDRESS_QUERY = "6 rue du Bac, Paris";
const ADDRESS_MARKER = /rue du bac/i;
// Email jetable (lowercase : leadSchema normalise en minuscules au stockage).
const LEAD_EMAIL = `e2e-waitlist+${Date.now()}@troppaye.test`;

const ADMIN_STATE = path.resolve(__dirname, ".auth/waitlist-admin-state.json");
const ADMIN_EMAIL = "waitlist-admin@troppaye.test";

// Marges très généreuses : cloud lent + dev Next à froid + débounce IGN 250 ms.
const LONG = 30_000;

// Le tunnel est public : on neutralise la session espace partagée du global-setup.
test.use({ storageState: { cookies: [], origins: [] } });

let admin: SupabaseClient;
let appUrl: string;
let adminUserId: string;

async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 5): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { last = e; await new Promise((r) => setTimeout(r, 1500 * (i + 1))); }
  }
  throw new Error(`${label} a échoué après ${tries} tentatives: ${String(last)}`);
}

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

  const adminUser = await ensureUser(ADMIN_EMAIL);
  adminUserId = adminUser.id;
  await admin.from("profiles").update({ role: "admin" }).eq("id", adminUserId);
  await sessionState(ADMIN_EMAIL, "/admin", ADMIN_STATE);
});

test.afterAll(async () => {
  // Nettoyage best-effort : on retrouve le dossier via le lead (email marqueur).
  if (admin) {
    const { data: lead } = await admin.from("leads").select("dossier_id").eq("email", LEAD_EMAIL).maybeSingle();
    await admin.from("leads").delete().eq("email", LEAD_EMAIL);
    if (lead?.dossier_id) await admin.from("dossiers").delete().eq("id", lead.dossier_id);
    if (adminUserId) await withRetry("deleteUser", async () => {
      const { error } = await admin.auth.admin.deleteUser(adminUserId);
      if (error) throw error;
    });
  }
  if (fs.existsSync(ADMIN_STATE)) fs.rmSync(ADMIN_STATE);
});

test.beforeEach(async ({ page }) => {
  // Repart propre : on vide le brouillon du tunnel avant de relancer.
  await page.goto("/diagnostic");
  await page.evaluate(() => {
    try { localStorage.clear(); } catch { /* mode privé : non bloquant */ }
  });
  await page.goto("/diagnostic");
});

/** Pilule de choix (ChoiceField / boutons aria-pressed) repérée par libellé exact. */
function pill(page: Page, label: string) {
  return page.getByRole("button", { name: label, exact: true });
}

/** Clique le bouton « Continuer » (champs libres : avance manuelle). */
async function clickContinue(page: Page): Promise<void> {
  const cont = page.getByRole("button", { name: "Continuer" });
  await expect(cont).toBeVisible({ timeout: LONG });
  await cont.click();
}

/** Joue le tunnel public anonyme jusqu'à atteindre la page verdict /diagnostic/<uuid>. */
async function runTunnelToVerdict(page: Page): Promise<void> {
  // ── ADRESSE (autocomplete IGN réel) ─────────────────────────────────
  const addressInput = page.getByPlaceholder("12 rue de la République, Lyon");
  await expect(addressInput).toBeVisible({ timeout: LONG });
  await addressInput.fill(TEST_ADDRESS_QUERY);
  const firstSuggestion = page.locator("ul li button").first();
  await expect(firstSuggestion).toBeVisible({ timeout: LONG });
  await firstSuggestion.click();

  // ── LOGEMENT ────────────────────────────────────────────────────────
  const dpeUnknown = page.getByRole("button", { name: /Je ne le connais pas/ });
  await expect(dpeUnknown).toBeVisible({ timeout: LONG });
  await dpeUnknown.click();
  await clickContinue(page); // surface facultative

  const constructionPill = pill(page, "Avant 1946");
  await expect(constructionPill).toBeVisible({ timeout: LONG });
  await constructionPill.click();

  const furnishedPill = pill(page, "Non meublé");
  await expect(furnishedPill).toBeVisible({ timeout: LONG });
  await furnishedPill.click();

  const stepperOutput = page.locator("output").first();
  await expect(stepperOutput).toBeVisible({ timeout: LONG });
  const increase = page.getByRole("button", { name: "Augmenter" });
  await increase.click(); // 1
  await increase.click(); // 2
  await expect(stepperOutput).toHaveText("2");
  await clickContinue(page);

  const colocNo = pill(page, "Non");
  await expect(colocNo).toBeVisible({ timeout: LONG });
  await colocNo.click();

  // ── LOYER ───────────────────────────────────────────────────────────
  const modeHc = pill(page, "Hors charges");
  await expect(modeHc).toBeVisible({ timeout: LONG });
  await modeHc.click();

  const currentRent = page.getByLabel("Loyer mensuel actuel (hors charges)");
  await expect(currentRent).toBeVisible({ timeout: LONG });
  await currentRent.fill("1500");
  await clickContinue(page);

  const initialRent = page.getByLabel("Loyer mensuel de départ (hors charges)");
  await expect(initialRent).toBeVisible({ timeout: LONG });
  await initialRent.fill("1200");
  await clickContinue(page);

  await clickContinue(page); // dépôt facultatif

  const supplementNo = pill(page, "Non");
  await expect(supplementNo).toBeVisible({ timeout: LONG });
  await supplementNo.click();
  await clickContinue(page);

  // ── BAIL ────────────────────────────────────────────────────────────
  const yearSelect = page.locator('select[aria-label="Année"]');
  const monthSelect = page.locator('select[aria-label="Mois"]');
  await expect(yearSelect).toBeVisible({ timeout: LONG });
  await yearSelect.selectOption("2020");
  await monthSelect.selectOption("1");
  await clickContinue(page);

  const clauseYes = pill(page, "Oui");
  await expect(clauseYes).toBeVisible({ timeout: LONG });
  await clauseYes.click();
  const quarterT1 = pill(page, "T1");
  if (await quarterT1.count()) await quarterT1.first().click();
  await clickContinue(page);

  // Historique des hausses : facultatif → on passe pour atteindre le récap.
  const skipHistory = page.getByRole("button", { name: /passer cette étape/ });
  if (await skipHistory.count()) {
    await skipHistory.first().click();
  } else {
    await clickContinue(page);
  }

  // ── RÉCAP → SOUMISSION ──────────────────────────────────────────────
  const submitCta = page.getByRole("button", { name: "Voir mon résultat" });
  await expect(submitCta).toBeVisible({ timeout: LONG });
  await expect(submitCta).toBeEnabled({ timeout: LONG });
  await submitCta.click();
  await page.waitForURL(/\/diagnostic\/[0-9a-f-]{36}/, { timeout: 60_000 });
}

test("waitlist : un visiteur anonyme laisse son email au verdict → lead visible dans /admin/funnel", async ({ page, browser }) => {
  test.slow(); // triple les timeouts : cloud + compile à froid.

  // 1. Tunnel public anonyme jusqu'au verdict.
  await runTunnelToVerdict(page);

  // 2. Capture email ANONYME via le module post-verdict (RecapCaptureModule).
  const emailField = page.getByLabel("Votre email (pour qu'on vous recontacte)");
  await expect(emailField).toBeVisible({ timeout: LONG });
  await emailField.fill(LEAD_EMAIL);
  await page.getByRole("button", { name: "Être recontacté" }).click();
  // Lead posé → la page se rafraîchit et le module de capture disparaît.
  await expect(emailField).toHaveCount(0, { timeout: LONG });

  // Vérité base : un lead anonyme existe (sans login), rattaché à un dossier.
  await expect
    .poll(
      async () => {
        const { data } = await admin.from("leads").select("dossier_id").eq("email", LEAD_EMAIL).maybeSingle();
        return data?.dossier_id ?? null;
      },
      { timeout: LONG },
    )
    .not.toBeNull();
  const { data: lead } = await admin.from("leads").select("dossier_id").eq("email", LEAD_EMAIL).single();

  // 3. Le lead apparaît dans /admin/funnel, file de recontact « Leads capturés ».
  const ctx = await browser.newContext({ storageState: ADMIN_STATE });
  const ap = await ctx.newPage();
  try {
    await ap.goto("/admin/funnel");
    const queue = ap.getByRole("heading", { name: /Leads capturés/i });
    await expect(queue).toBeVisible({ timeout: LONG });
    // Email marqueur + adresse de test « rue du Bac » dans la même file.
    await expect(ap.getByText(LEAD_EMAIL, { exact: true })).toBeVisible({ timeout: LONG });
    await expect(ap.getByText(ADDRESS_MARKER).first()).toBeVisible({ timeout: LONG });
  } finally {
    await ctx.close();
  }

  expect(lead?.dossier_id).toBeTruthy();
});
