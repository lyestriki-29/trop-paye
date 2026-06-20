import { test, expect } from "@playwright/test";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

/**
 * Isolation RLS / anti-IDOR : prouve qu'un client A ne peut ni lire ni écrire
 * les données d'un client B en passant par supabase-js avec le JWT de chacun
 * (clé anon publique + signInWithPassword), PAS via la clé service_role.
 *
 * On gère notre propre auth ici : on ignore le storageState authentifié partagé
 * (compte démo du global-setup) pour ne pas mélanger les sessions.
 */
test.use({ storageState: { cookies: [], origins: [] } });

// ---- Comptes de test dédiés (idempotents, supprimés en afterAll) ----
const USER_A_EMAIL = "rls-a@troppaye.test";
const USER_B_EMAIL = "rls-b@troppaye.test";
const PASSWORD = "rls-isolation-1234";

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
let anonUrl: string;
let anonKey: string;
let userAId: string;
let userBId: string;
let dossierAId: string;
let dossierBId: string;

/** Crée le compte s'il n'existe pas, sinon le récupère et réinitialise son mot de passe. */
async function ensureUser(email: string): Promise<User> {
  const list = await withRetry("listUsers", async () => {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    return data;
  });
  const existing = list.users.find((u) => u.email === email);
  if (existing) {
    // Garantit un mot de passe connu + email confirmé même si le compte traîne.
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

/** Un dossier minimal valide appartenant à `userId` (colonnes confirmées dans 0001_init.sql). */
async function createDossier(userId: string, label: string): Promise<string> {
  const { data, error } = await admin
    .from("dossiers")
    .insert({
      user_id: userId,
      status: "DRAFT",
      address_label: label,
      initial_rent_cents: 90000,
      current_rent_cents: 105000,
    })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("création dossier a échoué");
  return data.id as string;
}

/** Client anon (clé publique) connecté en tant que `email` : reflète exactement un vrai client. */
async function signedInAnonClient(email: string): Promise<SupabaseClient> {
  const client = createClient(anonUrl, anonKey, { auth: { persistSession: false } });
  await withRetry(`signIn ${email}`, async () => {
    const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
    if (error) throw error;
  });
  return client;
}

test.beforeAll(async () => {
  loadEnvConfig(path.resolve(__dirname, "../../.."));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pubKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey || !pubKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants.");
  }
  anonUrl = url;
  anonKey = pubKey;

  // Même garde-fou que global-setup : écritures destructives interdites hors local,
  // sauf opt-in explicite sur l'URL EXACTE d'un cloud jetable.
  const isLocal = /127\.0\.0\.1|localhost/.test(url);
  if (!isLocal && process.env.E2E_ALLOW_NONLOCAL_URL !== url) {
    throw new Error(`Refus : Supabase hors local (${url}). Pour un cloud de test, définir E2E_ALLOW_NONLOCAL_URL=<url exacte>.`);
  }

  admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const userA = await ensureUser(USER_A_EMAIL);
  const userB = await ensureUser(USER_B_EMAIL);
  userAId = userA.id;
  userBId = userB.id;

  // Rôle 'client' explicite (le trigger crée le profil ; on force le rôle attendu).
  await admin.from("profiles").update({ role: "client" }).eq("id", userAId);
  await admin.from("profiles").update({ role: "client" }).eq("id", userBId);

  // 1 dossier propre par user (on purge d'abord pour rester idempotent entre runs).
  await admin.from("dossiers").delete().in("user_id", [userAId, userBId]);
  dossierAId = await createDossier(userAId, "RLS-A rue de l'Isolation, 75011 Paris");
  dossierBId = await createDossier(userBId, "RLS-B rue de l'Isolation, 75011 Paris");

  // Données enfant côté B : prouvent que la traversée transitive est bien filtrée.
  await admin.from("pieces").insert({ dossier_id: dossierBId, kind: "bail", status: "RECEIVED" });
  await admin.from("verdicts").insert({
    dossier_id: dossierBId,
    outcome: "REFUND_DUE",
    confidence: "HIGH",
    total_recoverable_cents: 50000,
    results: {},
    as_of: "2026-01-01",
  });
  // Coordonnées de reversement (table deny-all) pour le dossier de A : même son
  // propriétaire ne doit rien voir côté client anon.
  await admin.from("payout_details").insert({
    dossier_id: dossierAId,
    holder_name: "Client A",
    iban_encrypted: "enc::test",
  });
});

test.afterAll(async () => {
  // NETTOYAGE impératif : ce projet est un gabarit qui sera cloné pour une cliente.
  // On supprime les dossiers (cascade sur pieces/verdicts/payout_details/...) puis les users.
  if (admin) {
    if (userAId || userBId) {
      await admin.from("dossiers").delete().in("user_id", [userAId, userBId].filter(Boolean));
    }
    for (const id of [userAId, userBId].filter(Boolean)) {
      await withRetry("deleteUser", async () => {
        const { error } = await admin.auth.admin.deleteUser(id);
        if (error) throw error;
      });
    }
  }
});

test("A lit SON propre dossier (SELECT renvoie 1 ligne)", async () => {
  const a = await signedInAnonClient(USER_A_EMAIL);
  const { data, error } = await a.from("dossiers").select("id").eq("id", dossierAId);
  expect(error).toBeNull();
  expect(data).toHaveLength(1);
  expect(data?.[0]?.id).toBe(dossierAId);
});

test("A ne peut PAS lire le dossier de B (RLS filtre silencieusement → [])", async () => {
  const a = await signedInAnonClient(USER_A_EMAIL);
  const { data, error } = await a.from("dossiers").select("id").eq("id", dossierBId);
  expect(error).toBeNull(); // RLS ne lève pas d'erreur, il masque la ligne.
  expect(data).toEqual([]);
});

test("A ne peut PAS insérer un message sur le dossier de B (INSERT → erreur)", async () => {
  const a = await signedInAnonClient(USER_A_EMAIL);
  const { error } = await a
    .from("messages")
    .insert({ dossier_id: dossierBId, sender: "client", body: "intrusion IDOR" });
  // with check (owns_dossier(B)) faux → violation de policy : error non nul.
  expect(error).not.toBeNull();

  // Vérification croisée via service_role : rien n'a été écrit sur le dossier de B.
  const { data: leaked } = await admin
    .from("messages")
    .select("id")
    .eq("dossier_id", dossierBId)
    .eq("body", "intrusion IDOR");
  expect(leaked).toEqual([]);
});

test("A ne peut PAS lire les pieces de B (traversée transitive owns_dossier → [])", async () => {
  const a = await signedInAnonClient(USER_A_EMAIL);
  const { data, error } = await a.from("pieces").select("id").eq("dossier_id", dossierBId);
  expect(error).toBeNull();
  expect(data).toEqual([]);
});

test("A ne peut PAS lire les verdicts de B (traversée transitive owns_dossier → [])", async () => {
  const a = await signedInAnonClient(USER_A_EMAIL);
  const { data, error } = await a.from("verdicts").select("id").eq("dossier_id", dossierBId);
  expect(error).toBeNull();
  expect(data).toEqual([]);
});

test("A ne peut PAS lire les callback_requests de B (traversée transitive owns_dossier → [])", async () => {
  // Un rappel de B inséré en service_role (bypass RLS) ; nettoyé par la cascade du dossier en afterAll.
  const { data: row } = await admin
    .from("callback_requests")
    .insert({ dossier_id: dossierBId, phone: "0600000000", subject: "secret B", preferred_slot: "ASAP", status: "PENDING" })
    .select("id")
    .single();
  expect(row).toBeTruthy();

  const a = await signedInAnonClient(USER_A_EMAIL);
  const { data, error } = await a.from("callback_requests").select("id").eq("dossier_id", dossierBId);
  expect(error).toBeNull();
  expect(data).toEqual([]);
});

test("A ne peut PAS créer un callback_request sur le dossier de B (INSERT → erreur)", async () => {
  const a = await signedInAnonClient(USER_A_EMAIL);
  const { error } = await a
    .from("callback_requests")
    .insert({ dossier_id: dossierBId, phone: "0611111111", subject: "intrusion", preferred_slot: "ASAP" });
  // with check (owns_dossier(B)) faux → violation de policy : error non nul.
  expect(error).not.toBeNull();
});

test("payout_details est deny-all : A ne voit RIEN, même pour son propre dossier", async () => {
  const a = await signedInAnonClient(USER_A_EMAIL);
  const { data, error } = await a.from("payout_details").select("id").eq("dossier_id", dossierAId);
  // Aucune policy → RLS refuse tout : soit liste vide, soit erreur. Jamais de fuite.
  if (error) {
    expect(error).not.toBeNull();
  } else {
    expect(data).toEqual([]);
  }
});
