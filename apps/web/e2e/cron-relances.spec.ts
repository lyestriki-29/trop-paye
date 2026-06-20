import { test, expect, type APIRequestContext } from "@playwright/test";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

/**
 * Route interne des relances (`POST /api/cron/run-due-actions`) — prouve qu'elle :
 *   1. exécute les Actions dues d'un dossier RECOVERY/SCHEDULED (rend le courrier,
 *      horodate `executed_at`, met en file `post_status='TO_POST'`, remplit `payload`) ;
 *   2. est idempotente (un 2e POST ne re-traite pas l'action déjà exécutée) ;
 *   3. respecte `recovery_state` (une Action d'un dossier PAUSED reste intacte) ;
 *   4. rejette les appels sans secret / mauvais secret (401).
 *
 * Setup/asserts via client service_role (même garde-fou opt-in que global-setup) ;
 * l'appel HTTP passe par le fixture `request` de Playwright (baseURL :3000).
 *
 * On ignore le storageState authentifié partagé : ces tests parlent à la route
 * cron (protégée par CRON_SECRET, pas par session) et à la base en service_role.
 */
test.use({ storageState: { cookies: [], origins: [] } });

// ---- Compte de test dédié (idempotent, supprimé en afterAll) ----
const CRON_EMAIL = "cron@troppaye.test";
const PASSWORD = "cron-relances-1234";

// Contrats EXACTS relevés dans le code/migrations (ne pas deviner) :
//  - header secret de la route : x-cron-secret  (route.ts ligne 15)
//  - 1re Action de relance      : LETTER_J0     (enum action_type, 0001_init.sql)
//  - status dossier en recouvrement : RECOVERY  (enum dossier_status)
//  - recovery_state requis      : SCHEDULED     (garde post-claim dans run.ts)
const CRON_HEADER = "x-cron-secret";
const RELANCE_TYPE = "LETTER_J0";

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

// Résolus dans beforeAll, lus dans les tests.
let admin: SupabaseClient;
let cronSecret: string;
let userId: string;
// Dossier #1 : RECOVERY + SCHEDULED → son Action due DOIT être exécutée.
let scheduledDossierId: string;
let scheduledActionId: string;
// Dossier #2 : RECOVERY mais PAUSED → son Action due ne doit PAS être exécutée.
let pausedDossierId: string;
let pausedActionId: string;

/** Crée le compte s'il n'existe pas, sinon le récupère (mot de passe + email confirmé garantis). */
async function ensureUser(email: string): Promise<User> {
  const list = await withRetry("listUsers", async () => {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    return data;
  });
  const existing = list.users.find((u) => u.email === email);
  if (existing) {
    await withRetry("updateUser", async () => {
      const { error } = await admin.auth.admin.updateUserById(existing.id, {
        password: PASSWORD,
        email_confirm: true,
      });
      if (error) throw error;
    });
    return existing;
  }
  const created = await withRetry("createUser", async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("createUser a échoué");
    return data.user;
  });
  return created;
}

/**
 * Dossier en recouvrement avec un bailleur destinataire (le courrier en a besoin
 * pour le rendu) et le `recovery_state` voulu. Colonnes confirmées dans
 * 0001_init.sql + 0004_pilote_ops.sql.
 */
async function createRecoveryDossier(
  label: string,
  recoveryState: "SCHEDULED" | "PAUSED",
): Promise<string> {
  const { data, error } = await admin
    .from("dossiers")
    .insert({
      user_id: userId,
      status: "RECOVERY",
      recovery_state: recoveryState,
      address_label: label,
      landlord_name: "Bailleur Test",
      landlord_address: "1 rue du Bailleur, 75011 Paris",
      initial_rent_cents: 90000,
      current_rent_cents: 105000,
    })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("création dossier RECOVERY a échoué");
  return data.id as string;
}

/**
 * Une Action de relance DUE : échéance dans le passé, jamais exécutée
 * (`executed_at` NULL), `post_status` non encore positionné.
 */
async function createDueAction(dossierId: string): Promise<string> {
  // 7 jours dans le passé → garantie d'être <= now() côté route.
  const pastISO = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data, error } = await admin
    .from("actions")
    .insert({
      dossier_id: dossierId,
      type: RELANCE_TYPE,
      scheduled_at: pastISO,
      executed_at: null,
    })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("création Action due a échoué");
  return data.id as string;
}

/** Lit l'état courant d'une Action (pour les assertions d'exécution/idempotence). */
async function readAction(actionId: string): Promise<{
  executed_at: string | null;
  post_status: string | null;
  payload: Record<string, unknown> | null;
}> {
  const { data, error } = await admin
    .from("actions")
    .select("executed_at, post_status, payload")
    .eq("id", actionId)
    .single();
  if (error || !data) throw error ?? new Error("lecture Action a échoué");
  return data as {
    executed_at: string | null;
    post_status: string | null;
    payload: Record<string, unknown> | null;
  };
}

/** POST la route cron avec un header secret donné (ou sans header si `secret` est null). */
async function postCron(request: APIRequestContext, secret: string | null) {
  const headers: Record<string, string> = {};
  if (secret !== null) headers[CRON_HEADER] = secret;
  return request.post("/api/cron/run-due-actions", { headers });
}

test.beforeAll(async () => {
  loadEnvConfig(path.resolve(__dirname, "../../.."));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.CRON_SECRET;
  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.");
  }
  if (!secret) {
    throw new Error("CRON_SECRET manquant : la route cron ne peut pas être testée.");
  }
  cronSecret = secret;

  // Même garde-fou que global-setup : écritures destructives interdites hors local,
  // sauf opt-in explicite sur l'URL EXACTE d'un cloud jetable (gabarit, jamais la prod).
  const isLocal = /127\.0\.0\.1|localhost/.test(url);
  if (!isLocal && process.env.E2E_ALLOW_NONLOCAL_URL !== url) {
    throw new Error(`Refus : Supabase hors local (${url}). Pour un cloud de test, définir E2E_ALLOW_NONLOCAL_URL=<url exacte>.`);
  }

  admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const user = await ensureUser(CRON_EMAIL);
  userId = user.id;
  await admin.from("profiles").update({ role: "client" }).eq("id", userId);

  // Purge idempotente (au cas où un run précédent aurait laissé des dossiers).
  await admin.from("dossiers").delete().eq("user_id", userId);

  // Dossier #1 : RECOVERY + SCHEDULED, avec une Action due et un verdict (montant
  // du courrier). Le verdict est optionnel côté code (fallback 0 €) mais on en met
  // un pour exercer le rendu avec un vrai montant recouvrable.
  scheduledDossierId = await createRecoveryDossier("CRON-OK rue des Relances, 75011 Paris", "SCHEDULED");
  await admin.from("verdicts").insert({
    dossier_id: scheduledDossierId,
    outcome: "REFUND_DUE",
    confidence: "HIGH",
    total_recoverable_cents: 123400,
    results: {},
    as_of: "2026-01-01",
  });
  scheduledActionId = await createDueAction(scheduledDossierId);

  // Dossier #2 : RECOVERY mais PAUSED → la garde recovery_state doit annuler le claim.
  pausedDossierId = await createRecoveryDossier("CRON-PAUSED rue du Verrou, 75011 Paris", "PAUSED");
  pausedActionId = await createDueAction(pausedDossierId);
});

test.afterAll(async () => {
  // NETTOYAGE impératif : ce projet est un gabarit qui sera cloné pour une cliente.
  // Suppression du dossier (cascade sur actions/verdicts) puis du user de test.
  if (admin) {
    if (userId) {
      await admin.from("dossiers").delete().eq("user_id", userId);
      await withRetry("deleteUser", async () => {
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) throw error;
      });
    }
  }
});

test("POST avec le bon secret → 200 et exécute l'Action due (TO_POST + payload)", async ({ request }) => {
  const res = await postCron(request, cronSecret);
  expect(res.status()).toBe(200);

  // L'Action du dossier SCHEDULED a été exécutée : horodatée, mise en file, payload rempli.
  const action = await readAction(scheduledActionId);
  expect(action.executed_at).not.toBeNull();
  expect(action.post_status).toBe("TO_POST");
  expect(action.payload).not.toBeNull();
  // Le courrier rendu est dans payload.letterBody (run.ts) : non vide.
  expect(typeof action.payload?.letterBody).toBe("string");
  expect(String(action.payload?.letterBody).length).toBeGreaterThan(0);
});

test("Idempotence : un 2e POST ne re-traite pas l'Action déjà exécutée", async ({ request }) => {
  // État après le 1er passage (test précédent).
  const before = await readAction(scheduledActionId);
  expect(before.executed_at).not.toBeNull();

  const res = await postCron(request, cronSecret);
  expect(res.status()).toBe(200);

  // `executed_at` inchangé : le claim atomique (is executed_at null) a barré le re-rendu.
  const after = await readAction(scheduledActionId);
  expect(after.executed_at).toBe(before.executed_at);

  // Et toujours une seule Action de ce type sur le dossier (aucun doublon créé).
  const { data: dupes } = await admin
    .from("actions")
    .select("id")
    .eq("dossier_id", scheduledDossierId)
    .eq("type", RELANCE_TYPE);
  expect(dupes ?? []).toHaveLength(1);
});

test("Garde recovery_state : l'Action d'un dossier PAUSED n'est PAS exécutée", async ({ request }) => {
  // (les POST précédents ont déjà tourné ; on re-POST pour être robuste à l'ordre).
  const res = await postCron(request, cronSecret);
  expect(res.status()).toBe(200);

  // L'Action du dossier PAUSED reste vierge : claim annulé par la garde post-claim.
  const action = await readAction(pausedActionId);
  expect(action.executed_at).toBeNull();
  expect(action.post_status).toBeNull();
});

test("POST sans secret → 401", async ({ request }) => {
  const res = await postCron(request, null);
  expect(res.status()).toBe(401);
});

test("POST avec mauvais secret → 401", async ({ request }) => {
  const res = await postCron(request, `${cronSecret}-mauvais`);
  expect(res.status()).toBe(401);
});
