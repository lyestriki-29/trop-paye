# Contact — Demande de rappel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le placeholder « Contact » de l'espace client par une demande de rappel native (file admin dédiée + email de notification), alignée avec l'étape téléphone du modèle amiable.

**Architecture:** Nouvelle table `callback_requests` (RLS par dossier). Le client soumet via une Server Action `requestCallback` (zod + `requireUser` + insert RLS + `queueEmail` vers `contact@troppaye.fr` dans l'outbox). L'admin traite depuis une page dédiée `/admin/rappels` (lecture service_role + action `markCallbackDone`). Schéma zod et libellés de créneaux centralisés dans un module pur partagé.

**Tech Stack:** Next.js 16 (App Router, Server Actions), TypeScript strict, Supabase (`supabase-js`, RLS côté client / service_role côté admin), zod, Vitest, Playwright (e2e cloud opt-in).

## Global Constraints

- TypeScript strict, **jamais `any`**.
- Imports en **alias `@/...`**, jamais de relatif `../../`.
- Toute Server Action = session + validation zod + ownership (anti-IDOR). Client : `requireUser`/`withAuth` ; admin : `requireAdmin`.
- **Ne JAMAIS utiliser le MCP Supabase** (connecté à un autre projet). Migrations via fichier SQL + CLI Supabase ; le dev pointe le **cloud**.
- **Pas de log de PII** (téléphone, sujet ne doivent jamais finir dans un `console.log`).
- Montants en centimes (sans objet ici). Dates ISO, fuseau Europe/Paris.
- Email réel **gated sur Brevo** : aujourd'hui `EMAIL_PROVIDER=outbox` → l'email est mis en file, pas envoyé. Ne pas tenter de « forcer » l'envoi.
- `CONTACT_EMAIL` = `contact@troppaye.fr` (constante, adresse publique).
- Créneaux : exactement `ASAP` (Dès que possible), `MORNING` (Matin), `AFTERNOON` (Après-midi), `EVENING` (Soir).

---

### Task 1: Migration `callback_requests` + types générés

**Files:**
- Create: `supabase/migrations/0009_callback_requests.sql`
- Modify: `apps/web/lib/supabase/database.types.ts` (régénéré, pas à la main)

**Interfaces:**
- Produces: table `public.callback_requests` (colonnes `id, dossier_id, phone, subject, preferred_slot, status, created_at, handled_at`) + policies `callback_select_own`, `callback_insert_own`. Le type généré `Database["public"]["Tables"]["callback_requests"]` est consommé par toutes les tâches suivantes.

- [ ] **Step 1: Écrire la migration**

```sql
-- supabase/migrations/0009_callback_requests.sql
-- Demandes de rappel (Contact espace client, 2026-06-20). RLS par dossier.

create table public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  phone text not null,
  subject text not null,
  preferred_slot text not null check (preferred_slot in ('ASAP','MORNING','AFTERNOON','EVENING')),
  status text not null default 'PENDING' check (status in ('PENDING','DONE')),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);
create index idx_callback_requests_dossier on public.callback_requests(dossier_id);
create index idx_callback_requests_pending on public.callback_requests(created_at) where status = 'PENDING';

alter table public.callback_requests enable row level security;

-- Le client lit/écrit uniquement les rappels de SES dossiers (anti-IDOR).
create policy callback_select_own on public.callback_requests for select to authenticated
  using (public.owns_dossier(dossier_id));
create policy callback_insert_own on public.callback_requests for insert to authenticated
  with check (public.owns_dossier(dossier_id));
-- Pas d'update/delete client : l'admin gère via service_role.
```

- [ ] **Step 2: Appliquer la migration au cloud (PAS le MCP)**

Le `DIRECT_URL` est dans `.env`/`.env.local` (connexion directe au Postgres cloud, port 5432).

Run (PowerShell) :
```powershell
supabase db push --db-url $env:DIRECT_URL
```
Expected: la migration `0009_callback_requests` est marquée appliquée (« Applying migration 0009… » sans erreur). Si `DIRECT_URL` n'est pas dans l'environnement, le charger depuis `.env` d'abord. En cas d'échec d'accès cloud → BLOCKED (ne pas contourner par le MCP).

- [ ] **Step 3: Régénérer les types depuis le cloud**

Le script `db:types` du repo cible `--local` ; ici le dev pointe le cloud, donc on génère depuis la même base que le runtime :
```powershell
supabase gen types typescript --db-url $env:DIRECT_URL > apps/web/lib/supabase/database.types.ts
```
Expected: le fichier contient désormais `callback_requests`.

- [ ] **Step 4: Vérifier types + typecheck**

Run:
```powershell
Select-String -Path apps/web/lib/supabase/database.types.ts -Pattern "callback_requests" | Select-Object -First 1
pnpm --filter @troppaye/web typecheck
```
Expected: la 1re commande imprime une ligne (table présente) ; typecheck PASS.

- [ ] **Step 5: Commit**

```powershell
git add supabase/migrations/0009_callback_requests.sql apps/web/lib/supabase/database.types.ts
git commit -m "feat(db): table callback_requests + RLS (demande de rappel)"
```

---

### Task 2: Module partagé `callback` (schéma zod + libellés) + test unitaire

**Files:**
- Create: `apps/web/lib/espace/callback.ts`
- Test: `apps/web/lib/espace/callback.test.ts`

**Interfaces:**
- Produces:
  - `CALLBACK_SLOTS: ReadonlyArray<{ value: CallbackSlot; label: string }>` — pour les boutons client.
  - `slotLabel(slot: string): string` — libellé FR (fallback : la valeur brute).
  - `type CallbackSlot = "ASAP" | "MORNING" | "AFTERNOON" | "EVENING"`.
  - `callbackSchema` (zod) → `{ dossierId: string; subject: string; preferredSlot: CallbackSlot; phone: string }`.
  - `type CallbackInput = z.infer<typeof callbackSchema>`.

- [ ] **Step 1: Écrire le test (rouge)**

```ts
// apps/web/lib/espace/callback.ts ne contient pas encore le code testé.
// apps/web/lib/espace/callback.test.ts
import { describe, it, expect } from "vitest";
import { callbackSchema, slotLabel } from "@/lib/espace/callback";

describe("callbackSchema", () => {
  const base = { dossierId: "d1", subject: "Question loyer", preferredSlot: "MORNING", phone: "0612345678" };

  it("accepte une entrée valide", () => {
    const r = callbackSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("refuse un sujet vide", () => {
    expect(callbackSchema.safeParse({ ...base, subject: "  " }).success).toBe(false);
  });

  it("refuse un créneau inconnu", () => {
    expect(callbackSchema.safeParse({ ...base, preferredSlot: "NIGHT" }).success).toBe(false);
  });

  it("refuse un téléphone vide", () => {
    expect(callbackSchema.safeParse({ ...base, phone: "  " }).success).toBe(false);
  });
});

describe("slotLabel", () => {
  it("traduit les créneaux connus", () => {
    expect(slotLabel("ASAP")).toBe("Dès que possible");
    expect(slotLabel("EVENING")).toBe("Soir");
  });
  it("retombe sur la valeur brute si inconnu", () => {
    expect(slotLabel("XXX")).toBe("XXX");
  });
});
```

- [ ] **Step 2: Lancer le test → échec attendu**

Run: `pnpm --filter @troppaye/web test -- callback`
Expected: FAIL (`callback.ts` n'exporte pas encore `callbackSchema`/`slotLabel`).

- [ ] **Step 3: Écrire le module**

```ts
// apps/web/lib/espace/callback.ts
import { z } from "zod";

/** Créneaux de rappel — valeurs stockées + libellés FR (source unique). */
export const CALLBACK_SLOTS = [
  { value: "ASAP", label: "Dès que possible" },
  { value: "MORNING", label: "Matin" },
  { value: "AFTERNOON", label: "Après-midi" },
  { value: "EVENING", label: "Soir" },
] as const;

export type CallbackSlot = (typeof CALLBACK_SLOTS)[number]["value"];

const SLOT_LABEL: Record<string, string> = Object.fromEntries(
  CALLBACK_SLOTS.map((s) => [s.value, s.label]),
);

/** Libellé FR d'un créneau (fallback : la valeur brute). */
export function slotLabel(slot: string): string {
  return SLOT_LABEL[slot] ?? slot;
}

/** Payload d'une demande de rappel — validé côté Server Action. */
export const callbackSchema = z.object({
  dossierId: z.string().min(1),
  subject: z.string().trim().min(1).max(200),
  preferredSlot: z.enum(["ASAP", "MORNING", "AFTERNOON", "EVENING"]),
  phone: z.string().trim().min(4).max(30),
});

export type CallbackInput = z.infer<typeof callbackSchema>;
```

- [ ] **Step 4: Lancer le test → vert**

Run: `pnpm --filter @troppaye/web test -- callback`
Expected: PASS (6 assertions).

- [ ] **Step 5: Commit**

```powershell
git add apps/web/lib/espace/callback.ts apps/web/lib/espace/callback.test.ts
git commit -m "feat(espace): schéma zod + libellés des créneaux de rappel"
```

---

### Task 3: `CONTACT_EMAIL` + Server Action `requestCallback`

**Files:**
- Modify: `apps/web/lib/content/legal-entity.ts` (ajout d'une constante)
- Modify: `apps/web/app/espace/[dossierId]/actions.ts` (ajout de `requestCallback`)

**Interfaces:**
- Consumes: `callbackSchema`, `CallbackInput` (Task 2) ; `requireUser` (`@/lib/auth/with-auth`) ; `queueEmail` (`@/lib/notify`) ; `CONTACT_EMAIL`.
- Produces: `requestCallback(input: CallbackInput): Promise<CallbackResult>` où `CallbackResult = { ok: true } | { error: string }` — consommé par `ContactDialog` (Task 4) et l'e2e (Task 6). Insère une ligne `callback_requests` (`status='PENDING'`) sur un dossier possédé, puis met un email en file vers `CONTACT_EMAIL`.

- [ ] **Step 1: Ajouter la constante `CONTACT_EMAIL`**

Dans `apps/web/lib/content/legal-entity.ts`, après le bloc `LEGAL_ENTITY`, ajouter :

```ts
/** Adresse de contact opérateur (publique) — destinataire des notifications de rappel. */
export const CONTACT_EMAIL = "contact@troppaye.fr";
```

- [ ] **Step 2: Écrire `requestCallback`**

Dans `apps/web/app/espace/[dossierId]/actions.ts`, ajouter en tête les imports puis la fonction (le fichier a déjà `"use server"` et `requireUser`) :

```ts
import { callbackSchema, slotLabel, type CallbackInput } from "@/lib/espace/callback";
import { queueEmail } from "@/lib/notify";
import { CONTACT_EMAIL } from "@/lib/content/legal-entity";
```

```ts
export type CallbackResult = { ok: true } | { error: string };

/**
 * Le client demande à être rappelé sur SON dossier. Insert RLS (`callback_insert_own`)
 * + ownership explicite (anti-IDOR, comme postMessage) + notification opérateur en
 * outbox (envoi réel gated sur Brevo). Ne loggue jamais le téléphone (PII).
 */
export async function requestCallback(input: CallbackInput): Promise<CallbackResult> {
  const { user, supabase } = await requireUser();
  const parsed = callbackSchema.safeParse(input);
  if (!parsed.success) return { error: "Demande incomplète : vérifiez le sujet et le téléphone." };
  const { dossierId, subject, preferredSlot, phone } = parsed.data;

  const { data: dossier } = await supabase
    .from("dossiers")
    .select("user_id")
    .eq("id", dossierId)
    .maybeSingle();
  if (!dossier || dossier.user_id !== user.id) return { error: "Dossier introuvable." };

  const { error } = await supabase.from("callback_requests").insert({
    dossier_id: dossierId,
    phone,
    subject,
    preferred_slot: preferredSlot,
    status: "PENDING",
  });
  if (error) return { error: "Demande impossible pour ce dossier." };

  // Notification opérateur (outbox ; partira au branchement Brevo). PII non loggée.
  await queueEmail({
    dossierId,
    toEmail: CONTACT_EMAIL,
    subject: `Demande de rappel — ${subject}`,
    body: `Un client demande à être rappelé.\nDossier : ${dossierId}\nCréneau : ${slotLabel(preferredSlot)}\nTéléphone : ${phone}`,
    template: "callback_request",
  });

  revalidatePath(`/espace/${dossierId}`);
  return { ok: true };
}
```

- [ ] **Step 3: Vérifier le typecheck**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS (la table `callback_requests` est typée depuis Task 1 ; `revalidatePath` est déjà importé dans le fichier).

- [ ] **Step 4: Commit**

```powershell
git add apps/web/lib/content/legal-entity.ts "apps/web/app/espace/[dossierId]/actions.ts"
git commit -m "feat(espace): action requestCallback (demande de rappel + notif outbox)"
```

---

### Task 4: `ContactDialog` → formulaire de rappel + téléphone du profil

**Files:**
- Modify: `apps/web/components/espace/ContactDialog.tsx` (réécriture)
- Modify: `apps/web/app/espace/[dossierId]/layout.tsx` (charger `phone`, passer les props)

**Interfaces:**
- Consumes: `requestCallback`, `CallbackResult` (Task 3) ; `CALLBACK_SLOTS` (Task 2) ; `Field`, `Button` (UI).
- Produces: `<ContactDialog dossierId={string} initialPhone={string} />`.

- [ ] **Step 1: Réécrire `ContactDialog`**

Remplacer tout le contenu de `apps/web/components/espace/ContactDialog.tsx` par :

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CALLBACK_SLOTS, type CallbackSlot } from "@/lib/espace/callback";
import { requestCallback } from "@/app/espace/[dossierId]/actions";

export function ContactDialog({ dossierId, initialPhone }: { dossierId: string; initialPhone: string }) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const [subject, setSubject] = useState("");
  const [slot, setSlot] = useState<CallbackSlot>("ASAP");
  const [phone, setPhone] = useState(initialPhone);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    const res = await requestCallback({ dossierId, subject, preferredSlot: slot, phone });
    setPending(false);
    if ("error" in res) setError(res.error);
    else setDone(true);
  }

  return (
    <div className="w-80 rounded-card border border-line bg-paper p-4 shadow-lift">
      <p className="mb-3 font-display text-sm font-bold">Être rappelé</p>

      {done ? (
        <p className="text-sm text-refund-text">Demande reçue. Nous vous rappelons au {phone}.</p>
      ) : (
        <div className="space-y-3">
          <label className="block text-xs text-ink/60">
            Sujet
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="Ex. question sur mon dossier"
              className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          <fieldset>
            <legend className="text-xs text-ink/60">Créneau préféré</legend>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {CALLBACK_SLOTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={slot === s.value}
                  onClick={() => setSlot(s.value)}
                  className={`rounded-field border px-2.5 py-1 text-xs ${
                    slot === s.value ? "border-ink bg-ink text-paper" : "border-line text-ink hover:border-ink/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-xs text-ink/60">
            Téléphone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              maxLength={30}
              placeholder="0612345678"
              className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2 font-mono text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          {error ? <p className="text-xs text-stamp">{error}</p> : null}

          <button
            type="button"
            disabled={pending || !subject.trim() || phone.trim().length < 4}
            onClick={submit}
            className="w-full rounded-field bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-40"
          >
            {pending ? "Envoi…" : "Demander à être rappelé"}
          </button>

          {whatsapp ? (
            <Button href={`https://wa.me/${whatsapp}`} variant="accent">
              Discuter sur WhatsApp
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Passer `dossierId` + `initialPhone` depuis le layout**

Dans `apps/web/app/espace/[dossierId]/layout.tsx` : récupérer le `supabase` de la garde, charger le téléphone du profil, et passer les props. Remplacer la ligne `const { user } = await requireAuthPage();` par :

```tsx
  const { user, supabase } = await requireAuthPage();
  const { data: profile } = await supabase.from("profiles").select("phone").eq("id", user.id).maybeSingle();
```

Puis remplacer `contact={<ContactDialog />}` par :

```tsx
        contact={<ContactDialog dossierId={dossierId} initialPhone={profile?.phone ?? ""} />}
```

- [ ] **Step 3: Vérifier le typecheck**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS.

- [ ] **Step 4: Vérification visuelle manuelle**

Connexion client (bouton « Client démo » sur `/login`), ouvrir un dossier → bouton « Contact » du header → le formulaire (sujet, 4 créneaux, téléphone prérempli) s'affiche ; envoyer → message « Demande reçue ».

- [ ] **Step 5: Commit**

```powershell
git add apps/web/components/espace/ContactDialog.tsx "apps/web/app/espace/[dossierId]/layout.tsx"
git commit -m "feat(espace): ContactDialog en formulaire de demande de rappel"
```

---

### Task 5: Admin — file `/admin/rappels` + `markCallbackDone` + nav

**Files:**
- Modify: `apps/web/lib/admin/read.ts` (`listPendingCallbacks`, `countPendingCallbacks`)
- Modify: `apps/web/app/admin/actions.ts` (`markCallbackDone`)
- Create: `apps/web/app/admin/rappels/page.tsx`
- Create: `apps/web/app/admin/rappels/MarkDoneButton.tsx`
- Modify: `apps/web/app/admin/layout.tsx` (lien « Rappels » + compteur)

**Interfaces:**
- Consumes: `getSupabaseAdmin`, `requireAdmin`, `AdminResult`, `refresh` (existant dans `admin/actions.ts`), `slotLabel` (Task 2).
- Produces:
  - `listPendingCallbacks(): Promise<CallbackRow[]>` avec `CallbackRow = { id: string; dossier_id: string; phone: string; subject: string; preferred_slot: string; created_at: string }`.
  - `countPendingCallbacks(): Promise<number>`.
  - `markCallbackDone(id: string): Promise<AdminResult>`.

- [ ] **Step 1: Lectures admin**

Dans `apps/web/lib/admin/read.ts`, ajouter à la fin :

```ts
export interface CallbackRow {
  id: string;
  dossier_id: string;
  phone: string;
  subject: string;
  preferred_slot: string;
  created_at: string;
}

/** Rappels en attente (file admin), du plus ancien au plus récent. */
export async function listPendingCallbacks(): Promise<CallbackRow[]> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("callback_requests")
    .select("id, dossier_id, phone, subject, preferred_slot, created_at")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });
  return data ?? [];
}

/** Compteur de rappels en attente (badge de nav). */
export async function countPendingCallbacks(): Promise<number> {
  const admin = getSupabaseAdmin();
  const { count } = await admin
    .from("callback_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "PENDING");
  return count ?? 0;
}
```

- [ ] **Step 2: Action `markCallbackDone`**

Dans `apps/web/app/admin/actions.ts`, ajouter (réutilise `requireAdmin`, `getSupabaseAdmin`, `AdminResult` ; `revalidatePath` est déjà importé) :

```ts
/** Marque un rappel comme traité (PENDING → DONE). Claim atomique anti double-clic. */
export async function markCallbackDone(id: string): Promise<AdminResult> {
  await requireAdmin();
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("callback_requests")
    .update({ status: "DONE", handled_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "PENDING")
    .select("id")
    .maybeSingle();
  if (!data) return { error: "Rappel introuvable ou déjà traité." };
  revalidatePath("/admin/rappels");
  return { ok: true };
}
```

- [ ] **Step 3: Bouton client « Marquer rappelé »**

```tsx
// apps/web/app/admin/rappels/MarkDoneButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markCallbackDone } from "@/app/admin/actions";

export function MarkDoneButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const res = await markCallbackDone(id);
          setPending(false);
          if ("error" in res) setError(res.error);
          else router.refresh();
        }}
        className="rounded-field border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper-2 disabled:opacity-40"
      >
        {pending ? "…" : "Marquer rappelé"}
      </button>
      {error ? <p className="mt-1 text-xs text-stamp">{error}</p> : null}
    </div>
  );
}
```

- [ ] **Step 4: Page `/admin/rappels`**

```tsx
// apps/web/app/admin/rappels/page.tsx
import Link from "next/link";
import { listPendingCallbacks } from "@/lib/admin/read";
import { slotLabel } from "@/lib/espace/callback";
import { frenchDate } from "@/lib/format-date";
import { MarkDoneButton } from "./MarkDoneButton";

export const dynamic = "force-dynamic";

export default async function RappelsPage() {
  const items = await listPendingCallbacks();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Rappels à passer</h1>
        <Link href="/admin" className="text-sm text-ink/70 underline underline-offset-4 hover:text-ink">
          ← File de revue
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Demandes de rappel des clients. Appeler au numéro indiqué, puis marquer comme traité.
      </p>

      <ul className="mt-6 space-y-4">
        {items.map((c) => (
          <li key={c.id} className="rounded-card border border-line bg-paper p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold">{c.subject}</p>
                <p className="mt-1 text-sm text-ink/70">
                  <a href={`tel:${c.phone}`} className="font-mono text-refund-text underline underline-offset-2">
                    {c.phone}
                  </a>
                  {" · "}
                  {slotLabel(c.preferred_slot)} · {frenchDate(c.created_at)}
                </p>
              </div>
              <Link
                href={`/admin/dossiers/${c.dossier_id}`}
                className="font-mono text-xs text-ink/55 underline underline-offset-2 hover:text-ink"
              >
                Dossier {c.dossier_id.slice(0, 8)}
              </Link>
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <MarkDoneButton id={c.id} />
            </div>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="rounded-card border border-line bg-paper-2 p-6 text-sm text-ink/55">
            Aucun rappel en attente.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Lien « Rappels » + compteur dans la nav admin**

Dans `apps/web/app/admin/layout.tsx` : importer le compteur, le charger, et ajouter le lien dans la `<nav>`. Ajouter l'import en tête :

```tsx
import { countPendingCallbacks } from "@/lib/admin/read";
```

Juste après `const { user } = await requireAdminPage();`, ajouter :

```tsx
  const pendingCallbacks = await countPendingCallbacks();
```

Dans la `<nav>`, après le lien `Courriers`, insérer :

```tsx
            <Link href="/admin/rappels" className="nb-pill nb-pill--dashed px-3 py-1.5 text-xs">
              Rappels{pendingCallbacks > 0 ? ` (${pendingCallbacks})` : ""}
            </Link>
```

- [ ] **Step 6: Vérifier le typecheck**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS.

- [ ] **Step 7: Vérification visuelle manuelle**

Connexion admin → la nav montre « Rappels » (+ compteur si une demande existe) → `/admin/rappels` liste la demande créée en Task 4 → « Marquer rappelé » la fait disparaître de la file.

- [ ] **Step 8: Commit**

```powershell
git add apps/web/lib/admin/read.ts apps/web/app/admin/actions.ts apps/web/app/admin/rappels/page.tsx apps/web/app/admin/rappels/MarkDoneButton.tsx apps/web/app/admin/layout.tsx
git commit -m "feat(admin): file des rappels /admin/rappels + markCallbackDone + nav"
```

---

### Task 6: e2e (demande → file admin → traité) + RLS

**Files:**
- Create: `apps/web/e2e/contact-rappel.spec.ts`
- Modify: `apps/web/e2e/rls-isolation.spec.ts` (un cas pour `callback_requests`)

**Interfaces:**
- Consumes: la feature complète (Tasks 1-5). Gate d'intégration final (cloud opt-in).

- [ ] **Step 1: e2e du parcours**

```ts
// apps/web/e2e/contact-rappel.spec.ts
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
```

- [ ] **Step 2: Cas RLS (isolation)**

Dans `apps/web/e2e/rls-isolation.spec.ts`, ajouter un test qui prouve qu'un client ne lit pas le rappel d'un autre. Suivre le pattern existant du fichier (deux clients A/B avec sessions). Ajouter ce test dans le `describe` existant (réutilise les helpers/fixtures déjà présents — adapter les noms aux variables réelles du fichier) :

```ts
test("un client ne lit pas les callback_requests d'un autre (RLS)", async () => {
  // Pré-requis : un dossier de A avec une demande de rappel, et une session client B.
  // (Réutiliser le harnais A/B déjà en place dans ce fichier.)
  const { data: aRow } = await admin
    .from("callback_requests")
    .insert({ dossier_id: dossierA, phone: "0600000000", subject: "secret A", preferred_slot: "ASAP", status: "PENDING" })
    .select("id")
    .single();
  expect(aRow).toBeTruthy();

  // B (client) tente de lire : RLS callback_select_own → 0 ligne.
  const { data: seen } = await clientBSupabase
    .from("callback_requests")
    .select("id")
    .eq("id", aRow!.id);
  expect(seen ?? []).toHaveLength(0);
});
```

> NB : `dossierA`, `clientBSupabase`, `admin` désignent les variables déjà définies dans `rls-isolation.spec.ts`. L'implémenteur lit le fichier et raccorde aux noms réels (ne pas inventer un nouveau harnais).

- [ ] **Step 3: Lancer l'e2e d'intégration (cloud opt-in)**

Run:
```powershell
pnpm --filter @troppaye/web e2e --grep "demande un rappel"
```
Expected: PASS. Si l'environnement cloud opt-in n'est pas armé (`E2E_ALLOW_NONLOCAL_URL`), faire les vérifs manuelles des Tasks 4-5 à la place et le noter.

- [ ] **Step 4: Commit**

```powershell
git add apps/web/e2e/contact-rappel.spec.ts apps/web/e2e/rls-isolation.spec.ts
git commit -m "test(e2e): demande de rappel (parcours + RLS d'isolation)"
```

---

## Self-Review

**Spec coverage (vs spec) :**
- §2 table `callback_requests` + RLS → Task 1. ✅
- §3 client (formulaire + action `requestCallback` + email outbox) → Tasks 2-4. ✅
- §4 admin (`/admin/rappels`, `markCallbackDone`, nav + compteur) → Task 5. ✅
- §5 `CONTACT_EMAIL` constante → Task 3. ✅
- §6 RGPD/RLS (owns_dossier, pas de log PII) → Task 1 (policies) + Task 3 (pas de log). ✅
- §7 tests (unitaire schéma, e2e, RLS) → Tasks 2 et 6. ✅
- §1 « WhatsApp gardé, Cal.com retiré » → Task 4 (WhatsApp conservé, Cal.com supprimé). ✅
- §8 hors scope (pas de PHONE_CALL auto, pas d'envoi réel) → respecté (queueEmail outbox seulement). ✅

**Placeholder scan :** le seul renvoi « adapter aux variables réelles » est dans Task 6 Step 2 (cas RLS greffé sur un harnais A/B existant que l'implémenteur doit lire) — c'est un raccordement délibéré, pas un placeholder de logique ; le code du test est fourni.

**Type consistency :** `CallbackInput`/`callbackSchema`/`CallbackSlot` (Task 2) ↔ `requestCallback(input: CallbackInput)` (Task 3) ↔ `requestCallback({...})` (Task 4) cohérents. `CallbackResult` (Task 3) ↔ usage `"error" in res` (Task 4). `CallbackRow`/`listPendingCallbacks`/`countPendingCallbacks`/`markCallbackDone` (Task 5) cohérents entre read/page/nav. `slotLabel` partagé Tasks 2/3/5.

**Scope :** une seule surface fonctionnelle (demande de rappel), un seul plan. Migration unique. Autonome et testable.
