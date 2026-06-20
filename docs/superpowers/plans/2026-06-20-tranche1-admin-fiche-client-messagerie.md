# Tranche 1 — Fiche client admin + messagerie admin libre — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner à l'admin la vue des coordonnées du client (nom, prénom, téléphone, email) sur la fiche dossier, et la possibilité de répondre librement au client par message.

**Architecture:** Deux ajouts purement additifs, sans migration de schéma (les tables `profiles` et `messages` existent déjà). (1) `getDossierAdmin()` charge en plus le profil du client (`profiles`) et son email (`auth.admin.getUserById`) ; la page détail affiche une carte « Client ». (2) Une nouvelle Server Action `sendAdminMessage()` insère un `messages.sender='operator'` ; `AdminActions` expose une zone de réponse libre disponible quel que soit le statut. Le client voit déjà les messages `operator` dans son espace.

**Tech Stack:** Next.js 16 (App Router, Server Actions), TypeScript strict, Supabase (`supabase-js`, service_role côté admin), Playwright (e2e, opt-in cloud), Vitest.

## Global Constraints

- TypeScript strict, **jamais `any`** — `unknown` puis narrowing, ou typage exact.
- Imports en **alias `@/...`**, jamais de relatif `../../`.
- Toute Server Action admin commence par `await requireAdmin()` (session + rôle vérifié en base).
- **Refonte visuelle non concernée ici** : ne PAS casser les sélecteurs e2e existants (`getByLabel`, `getByRole`, textes).
- **Pas de log de PII** (nom, email, téléphone, IBAN ne doivent jamais finir dans un `console.log`).
- Montants en centimes (sans objet ici, mais règle projet).
- Copy en français.
- Gate rapide par tâche = `pnpm --filter @troppaye/web typecheck`. Gate d'intégration (1 fois en fin de tranche) = e2e en cloud opt-in.

---

### Task 1: Écrire le test e2e d'intégration (rouge d'abord)

**Files:**
- Create: `apps/web/e2e/admin-dossier.spec.ts`

**Interfaces:**
- Consumes: rien (boot e2e via service_role, comme `e2e/paiements.spec.ts`).
- Produces: un test qui ÉCHOUE tant que la carte « Client » et la réponse admin n'existent pas. Sert de gate d'intégration final.

Ce test crée un **client** (avec profil nom/prénom/téléphone) propriétaire d'un dossier, plus un **admin** dédié ; il vérifie côté UI que l'admin voit les coordonnées du client et peut lui répondre, puis vérifie en base qu'un `messages.sender='operator'` a été inséré.

- [ ] **Step 1: Écrire le test e2e complet**

```ts
// apps/web/e2e/admin-dossier.spec.ts
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
```

- [ ] **Step 2: Vérifier la compilation du test**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS (le test compile ; il ÉCHOUERA à l'exécution car l'UI n'existe pas encore — c'est voulu, on ne lance pas l'e2e maintenant).

- [ ] **Step 3: Commit**

```bash
git add apps/web/e2e/admin-dossier.spec.ts
git commit -m "test(e2e): fiche client admin + réponse libre (rouge avant impl)"
```

---

### Task 2: `getDossierAdmin` charge les coordonnées du client

**Files:**
- Modify: `apps/web/lib/admin/read.ts` (interface `AdminDossierDetail` + fonction `getDossierAdmin`)

**Interfaces:**
- Consumes: `getSupabaseAdmin()` (service_role) ; `dossier.user_id` (colonne existante de `DossierRow`).
- Produces: `AdminDossierDetail.client: { firstName: string | null; lastName: string | null; phone: string | null; email: string | null }` — consommé par la page (Task 3) et le test (Task 1).

- [ ] **Step 1: Étendre l'interface `AdminDossierDetail`**

Dans `apps/web/lib/admin/read.ts`, ajouter le champ `client` à l'interface :

```ts
export interface AdminDossierDetail {
  dossier: DossierRow;
  verdict: VerdictGlobal | null;
  mandate: MandateRow | null;
  proof: SignatureProofRow | null;
  pieces: PieceRow[];
  actions: ActionRow[];
  messages: MessageRow[];
  funds: FundRow[];
  client: { firstName: string | null; lastName: string | null; phone: string | null; email: string | null };
}
```

- [ ] **Step 2: Charger profil + email dans `getDossierAdmin`**

Dans la même fonction, après le `Promise.all` existant (qui produit `verdict, mandate, proof, pieces, actions, messages, funds`), ajouter le chargement du client puis l'inclure au retour. Remplacer le bloc `return { ... }` final par :

```ts
  // Coordonnées du client (parité admin) : profil + email auth. user_id = propriétaire.
  const [profile, authUser] = await Promise.all([
    admin
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", dossier.user_id)
      .maybeSingle()
      .then((r) => r.data),
    admin.auth.admin.getUserById(dossier.user_id).then((r) => r.data.user),
  ]);
  const client = {
    firstName: profile?.first_name ?? null,
    lastName: profile?.last_name ?? null,
    phone: profile?.phone ?? null,
    email: authUser?.email ?? null,
  };

  return { dossier, verdict, mandate, proof, pieces, actions, messages, funds, client };
```

- [ ] **Step 3: Vérifier le typecheck**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS. (`dossier.user_id` est `string` sur `DossierRow` ; `getUserById` accepte un `string`.)

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/admin/read.ts
git commit -m "feat(admin): getDossierAdmin charge les coordonnées du client"
```

---

### Task 3: Carte « Client » sur la fiche dossier admin

**Files:**
- Modify: `apps/web/app/admin/dossiers/[id]/page.tsx`

**Interfaces:**
- Consumes: `detail.client` (Task 2).
- Produces: une section visible affichant `Prénom Nom`, email (lien `mailto:`), téléphone (lien `tel:`).

- [ ] **Step 1: Déstructurer `client` et rendre la carte**

Dans `apps/web/app/admin/dossiers/[id]/page.tsx`, ajouter `client` à la déstructuration de `detail` :

```ts
  const { dossier, verdict, mandate, proof, pieces, actions, messages, funds, client } = detail;
```

Puis insérer la carte « Client » juste après le bloc des badges de statut (le `<p className="mt-2 flex flex-wrap gap-2 text-xs">…</p>` qui ferme avant `{verdict ? (`). Coller ce bloc immédiatement avant `{verdict ? (` :

```tsx
        <section className="mt-6 rounded-card border border-line bg-paper p-4 text-sm">
          <h2 className="font-display font-bold">Client</h2>
          <dl className="mt-2 space-y-1 text-ink/70">
            <div className="flex justify-between gap-4">
              <dt>Nom</dt>
              <dd className="font-medium text-ink">
                {client.firstName || client.lastName
                  ? `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim()
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Email</dt>
              <dd>
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="text-refund-text underline underline-offset-2">
                    {client.email}
                  </a>
                ) : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Téléphone</dt>
              <dd>
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className="text-refund-text underline underline-offset-2">
                    {client.phone}
                  </a>
                ) : "—"}
              </dd>
            </div>
          </dl>
        </section>
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS.

- [ ] **Step 3: Vérification visuelle manuelle**

Se connecter en admin (bouton « Admin démo » sur `/login`), ouvrir un dossier d'un client ayant un profil rempli, confirmer que la carte « Client » montre nom/email/téléphone.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/admin/dossiers/[id]/page.tsx"
git commit -m "feat(admin): carte Client (nom, email, téléphone) sur la fiche dossier"
```

---

### Task 4: Server Action `sendAdminMessage`

**Files:**
- Modify: `apps/web/app/admin/actions.ts` (ajout d'une fonction exportée)

**Interfaces:**
- Consumes: `requireAdmin()`, `getSupabaseAdmin()`, `refresh(dossierId)` (helpers déjà présents dans le fichier), type `AdminResult` (déjà exporté).
- Produces: `sendAdminMessage(dossierId: string, body: string): Promise<AdminResult>` — consommé par `AdminActions` (Task 5) et le test (Task 1). Insère `messages` avec `sender: "operator"`.

- [ ] **Step 1: Ajouter la fonction**

Dans `apps/web/app/admin/actions.ts`, ajouter (par exemple juste après `requestPiece`, car même mécanique d'insertion de message operator) :

```ts
/**
 * Réponse LIBRE de l'opérateur au client (visible dans son espace `/espace/.../messages`).
 * Distincte de `requestPiece` (demande typée) et `refuseDossier` (clôture) : ici message
 * conversationnel quel que soit le statut du dossier. N'envoie pas d'email (notification
 * branchée dans une tranche ultérieure).
 */
export async function sendAdminMessage(dossierId: string, body: string): Promise<AdminResult> {
  await requireAdmin();
  const text = body.trim();
  if (!text) return { error: "Message vide." };
  if (text.length > 4000) return { error: "Message trop long (4000 caractères max)." };
  const admin = getSupabaseAdmin();
  await admin.from("messages").insert({ dossier_id: dossierId, sender: "operator", body: text });
  refresh(dossierId);
  return { ok: true };
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/admin/actions.ts
git commit -m "feat(admin): sendAdminMessage — réponse libre de l'opérateur au client"
```

---

### Task 5: Zone de réponse libre dans `AdminActions`

**Files:**
- Modify: `apps/web/app/admin/dossiers/[id]/AdminActions.tsx`

**Interfaces:**
- Consumes: `sendAdminMessage` (Task 4) ; helper local `run(key, fn)` (déjà présent).
- Produces: un `<label>` « Répondre au client » + bouton « Envoyer au client », disponibles QUEL QUE SOIT le statut (un client peut écrire à tout moment). Sélecteurs ciblés par l'e2e (Task 1).

- [ ] **Step 1: Importer l'action**

Dans `apps/web/app/admin/dossiers/[id]/AdminActions.tsx`, ajouter `sendAdminMessage` à l'import existant depuis `@/app/admin/actions` :

```ts
import {
  validateDossier,
  refuseDossier,
  requestPiece,
  tagLandlordReply,
  resumeRecovery,
  tagContestation,
  recordPayment,
  advanceTime,
  sendAdminMessage,
  type AdminResult,
  type LandlordReplyTag,
} from "@/app/admin/actions";
```

- [ ] **Step 2: Ajouter l'état du message**

Sous les `useState` existants (après `const [delayDays, setDelayDays] = useState("15");`), ajouter :

```ts
  const [message, setMessage] = useState("");
```

- [ ] **Step 3: Ajouter le bloc UI (toujours visible)**

Juste avant la fermeture du composant — c.-à-d. avant le bloc `{!["IN_REVIEW", "RECOVERY", "ESCALATED"].includes(status) ? (` — insérer la zone de réponse, séparée par un filet :

```tsx
      <div className="border-t border-line pt-4">
        <label htmlFor="admin-reply" className="text-xs text-ink/60">
          Répondre au client
        </label>
        <textarea
          id="admin-reply"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Votre réponse, visible par le client…"
          className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <button
          type="button"
          disabled={pending !== null || !message.trim()}
          onClick={() =>
            run("reply-client", async () => {
              const res = await sendAdminMessage(dossierId, message);
              if ("ok" in res) setMessage("");
              return res;
            })
          }
          className={`mt-2 ${NEUTRAL}`}
        >
          {pending === "reply-client" ? "…" : "Envoyer au client"}
        </button>
      </div>
```

- [ ] **Step 4: Vérifier le typecheck**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS.

- [ ] **Step 5: Vérification visuelle manuelle**

En admin, ouvrir un dossier, taper une réponse, « Envoyer au client » → le message apparaît dans la section « Messages » de la fiche ; en se reconnectant côté client (bouton « Client démo »), le message `operator` est visible dans `/espace/<id>/messages`.

- [ ] **Step 6: Commit**

```bash
git add "apps/web/app/admin/dossiers/[id]/AdminActions.tsx"
git commit -m "feat(admin): zone de réponse libre au client dans AdminActions"
```

---

### Task 6: Gate d'intégration e2e (vert) + clôture

**Files:** aucun (exécution + vérif).

- [ ] **Step 1: Lancer l'e2e d'intégration**

L'e2e écrit à grands frais (cloud opt-in). Le lancer UNE fois la tranche implémentée. Avec un serveur dev pointant le cloud de test :

Run:
```bash
pnpm --filter @troppaye/web e2e --grep "fiche client visible"
```
Expected: PASS (carte Client visible + réponse admin round-trip + message operator en base).

> Si l'environnement cloud opt-in n'est pas armé (`E2E_ALLOW_NONLOCAL_URL`), faire la vérif manuelle des Tasks 3 et 5 à la place et le noter.

- [ ] **Step 2: Typecheck global + tests unitaires**

Run: `pnpm typecheck && pnpm --filter @troppaye/web test`
Expected: PASS (aucune régression Vitest).

- [ ] **Step 3: Vérifier que les 20 e2e existants ne sont pas cassés**

Les changements sont additifs (nouvelle carte, nouveau bloc) et ne touchent aucun sélecteur existant. Confirmer rapidement que `e2e/paiements.spec.ts` et `e2e/espace-messages.spec.ts` n'utilisent pas de texte en collision (« Messages », labels distincts). Aucun renommage effectué.

- [ ] **Step 4: Commit de clôture (si vérifs notées dans un fichier de suivi)**

```bash
git add -A
git commit -m "test(e2e): tranche 1 admin fiche client + messagerie — verte" || echo "rien à committer"
```

---

## Self-Review

**Spec coverage (vs spec §3 lots B et C) :**
- C (fiche client admin) → Tasks 2 + 3. ✅ (le téléphone du **bailleur** et le champ `landlord_phone` relèvent de la tranche « étape téléphone » H — hors scope ici, noté dans la spec.)
- B (messagerie admin libre) → Tasks 4 + 5, le client voit déjà les messages operator. ✅
- Notification email du message au client → **explicitement reportée** à la tranche E (emails réels). Noté dans la docstring de `sendAdminMessage`.

**Placeholder scan :** aucun TBD/TODO laissé ; tout le code des steps est complet.

**Type consistency :** `AdminDossierDetail.client` (Task 2) ↔ `detail.client` (Task 3) ↔ assertions e2e (Task 1) cohérents. `sendAdminMessage(dossierId, body): Promise<AdminResult>` (Task 4) ↔ appel dans `AdminActions` (Task 5) cohérent. Helper `run` et type `AdminResult` réutilisés tels quels.

**Scope :** une seule surface (fiche dossier admin), pas de migration, pas de dépendance externe → tranche autonome et testable.
