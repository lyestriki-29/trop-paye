import { test, expect } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

/**
 * E2E mandat (écran DIAGNOSED) — deux comportements :
 *
 *  1. GATE (état ACTUEL, MANDATE_ENABLED=false) : un dossier DIAGNOSED affiche
 *     la liste d'attente pilote (Waitlist.tsx) ET PAS le formulaire de signature.
 *  2. SIGNATURE happy-path : remplir MandateForm puis vérifier en base
 *     (mandates.SIGNED + signature_proofs + dossier MANDATE_PENDING). Gardé
 *     derrière test.skip tant que la feature n'est pas activée dans l'env.
 *
 * On RÉUTILISE la session client partagée (storageState du global-setup,
 * compte client@troppaye.test) : on NE vide PAS le storageState, on a besoin
 * d'être connecté en client pour voir l'écran /mandat/<id>.
 *
 * La création/suppression des dossiers passe par la clé service_role, avec le
 * MÊME garde-fou opt-in que global-setup.ts (écritures destructives refusées
 * hors local sauf E2E_ALLOW_NONLOCAL_URL = l'URL exacte du projet visé).
 */

const CLIENT_EMAIL = "client@troppaye.test";
const GATE_ADDR = "E2E mandat liste-attente, 75011 Paris";
const SIGN_ADDR = "E2E mandat signature, 75011 Paris";

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
let clientId: string;
let gateDossierId: string;
let signDossierId: string;

/**
 * Crée un dossier DIAGNOSED minimal valide pour `clientId`.
 * Colonnes/enum confirmés dans 0001_init.sql : status (enum dossier_status,
 * valeur 'DIAGNOSED'), recovery_state (enum recovery_state, 'SCHEDULED'),
 * address_label, initial_rent_cents, current_rent_cents (montants en centimes).
 */
async function createDiagnosedDossier(label: string): Promise<string> {
  const { data, error } = await admin
    .from("dossiers")
    .insert({
      user_id: clientId,
      status: "DIAGNOSED",
      recovery_state: "SCHEDULED",
      address_label: label,
      initial_rent_cents: 90000,
      current_rent_cents: 105000,
    })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("création dossier DIAGNOSED a échoué");
  return data.id as string;
}

test.beforeAll(async () => {
  loadEnvConfig(path.resolve(__dirname, "../../.."));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.");
  }

  // Même garde-fou que global-setup : écritures destructives interdites hors
  // local, sauf opt-in explicite sur l'URL EXACTE d'un cloud jetable.
  const isLocal = /127\.0\.0\.1|localhost/.test(url);
  if (!isLocal && process.env.E2E_ALLOW_NONLOCAL_URL !== url) {
    throw new Error(
      `Refus : Supabase hors local (${url}). Pour un cloud de test, définir E2E_ALLOW_NONLOCAL_URL=<url exacte>.`,
    );
  }

  admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Le compte démo est garanti par global-setup ; on récupère son id.
  const list = await withRetry("listUsers", async () => {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    return data;
  });
  const user = list.users.find((u) => u.email === CLIENT_EMAIL);
  if (!user) throw new Error(`Compte démo ${CLIENT_EMAIL} introuvable (global-setup attendu).`);
  clientId = user.id;

  // Purge idempotente entre runs, puis création des dossiers de test.
  await admin
    .from("dossiers")
    .delete()
    .eq("user_id", clientId)
    .in("address_label", [GATE_ADDR, SIGN_ADDR]);

  gateDossierId = await createDiagnosedDossier(GATE_ADDR);
  // Le dossier signature n'est créé que si la feature est activée (sinon inutile).
  if (process.env.MANDATE_ENABLED === "true") {
    signDossierId = await createDiagnosedDossier(SIGN_ADDR);
  }
});

test.afterAll(async () => {
  // NETTOYAGE impératif : ce projet est un gabarit cloné pour une cliente.
  // Supprimer les dossiers cascade sur mandates / signature_proofs / ...
  if (admin && clientId) {
    await admin
      .from("dossiers")
      .delete()
      .eq("user_id", clientId)
      .in("address_label", [GATE_ADDR, SIGN_ADDR]);
  }
});

// --- Test 1 : GATE — comportement actuel (MANDATE_ENABLED=false) -------------
test("GATE : un dossier DIAGNOSED affiche la liste d'attente, pas la signature", async ({ page }) => {
  await page.goto(`/mandat/${gateDossierId}`);

  // Titre exact de Waitlist.tsx (liste d'attente pilote).
  await expect(
    page.getByRole("heading", { name: "Votre dossier est prêt : vous êtes sur la liste du pilote" }),
  ).toBeVisible();

  // Le formulaire de signature (MandateForm) NE doit PAS être rendu :
  // ni son titre, ni son bouton de signature.
  await expect(page.getByRole("heading", { name: "Dernière étape : votre mandat" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /signer mon mandat/i })).toHaveCount(0);
});

// --- Test 2 : SIGNATURE happy-path — gardé derrière MANDATE_ENABLED ----------
// Ne tourne QUE si la feature est activée dans l'environnement ; sinon skip
// (le flux serveur signMandate refuse tant que MANDATE_ENABLED !== true).
test("SIGNATURE : remplir le mandat le signe et passe le dossier en MANDATE_PENDING", async ({ page }) => {
  test.skip(process.env.MANDATE_ENABLED !== "true", "Mandat désactivé dans cet env");

  await page.goto(`/mandat/${signDossierId}`);

  // Formulaire de signature présent (MandateForm).
  await expect(page.getByRole("heading", { name: "Dernière étape : votre mandat" })).toBeVisible();

  // Champs du bailleur (composant Field → label associé via htmlFor) + signataire.
  await page.getByLabel("Nom du bailleur ou de l'agence").fill("SCI Bailleur Test");
  await page
    .getByLabel("Adresse postale du bailleur (sur le bail ou les quittances)")
    .fill("10 rue des Quittances, 75011 Paris");
  // Type de bailleur : <select> natif (combobox accessible).
  await page.getByRole("combobox").selectOption("SCI");
  await page.getByLabel("Vos nom et prénom (signature)").fill("Jean Locataire");

  // Consentement à la signature électronique (case obligatoire pour soumettre).
  await page
    .getByRole("checkbox", { name: /Je consens expressément à signer ce mandat/i })
    .check();

  await page.getByRole("button", { name: /signer mon mandat/i }).click();

  // Le rendu repasse en MANDATE_PENDING (router.refresh) : l'écran affiche
  // désormais l'upload de pièces (« Vos pièces »).
  await expect(page.getByRole("heading", { name: /Vos pièces/i })).toBeVisible({ timeout: 60_000 });

  // Vérifications en base via service_role (source de vérité).
  const { data: mandate } = await admin
    .from("mandates")
    .select("status")
    .eq("dossier_id", signDossierId)
    .single();
  expect(mandate?.status).toBe("SIGNED");

  const { data: proofs } = await admin
    .from("signature_proofs")
    .select("id")
    .eq("dossier_id", signDossierId);
  expect(proofs?.length ?? 0).toBeGreaterThan(0);

  const { data: dossier } = await admin
    .from("dossiers")
    .select("status")
    .eq("id", signDossierId)
    .single();
  expect(dossier?.status).toBe("MANDATE_PENDING");
});
