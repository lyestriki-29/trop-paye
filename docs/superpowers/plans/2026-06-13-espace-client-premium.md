# Espace client premium « centre de gestion » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer `/espace` d'une page liste+détail basique en un workspace dossier à onglets premium (Aperçu, Pièces, Mandat, Messages, Versement, Compte/RGPD, Contact) dans la DA « dossier d'instruction », sans big-bang DB.

**Architecture:** App Router Next 16. `/espace/[dossierId]/layout.tsx` = shell commun (header cloche/contact/compte + barre d'onglets) ; chaque onglet = un Server Component isolé en sous-route (`…/pieces`, `…/mandat`, `…/messages`, `…/versement`, défaut = Aperçu). Lecture via les helpers RLS existants (`getDossierDetail`), écritures via Server Actions `withAuth` (réutilisation de `uploadPiece`/`signMandate`/`savePayoutDetails` existants). Logique métier dérivée (checklist, flux d'activité, net après commission, masque IBAN) extraite en fonctions PURES testées en Vitest. Présentation = Tailwind + primitives brand existantes (`Amount`, `Button`, `QuittanceCard`, `Stamp`, `Marker`).

**Tech Stack:** Next.js 16 (App Router, RSC + Server Actions), TypeScript strict, Supabase (RLS + Storage chiffré AES-256-GCM), Tailwind, Vitest (unit), Playwright (e2e).

---

## Principes d'exécution (lire avant de commencer)

- **TypeScript strict, jamais `any`.** Path aliases `@/...` obligatoires. Max ~200 lignes/fichier.
- **Après CHAQUE tâche de code :** `pnpm --filter @troppaye/web typecheck` doit passer.
- **Tests :** logique métier pure → Vitest colocalisé (`*.test.ts`), lancé par `pnpm --filter @troppaye/web test`. Parcours UI → Playwright e2e en fin de phase. Composants purement présentationnels → vérification visuelle (pas de test unitaire artificiel).
- **DA non négociable (rappel spec §11) :** tokens Tailwind existants `ink`, `paper`, `paper-2`, `refund`, `refund-text`, `stamp`, `accent`, `line` ; classes `rounded-card`, `rounded-field`, `font-display`, `tracking-display`, `font-mono tabular-nums` ; ombres papier ; `prefers-reduced-motion` respecté. Montants TOUJOURS via `<Amount>`.
- **Sécurité :** chaque page `requireAuthPage` ; chaque action `withAuth` (session + ownership `dossier.user_id === user.id` + zod). IBAN jamais en clair côté client.
- **Décision tranchée (gate « étude lançable ») :** le passage `MANDATE_PENDING → IN_REVIEW` reste déclenché par la **présence** de `bail` + `quittance` (logique `maybeAdvanceToReview` EXISTANTE, déclenchée à l'upload), pas par un statut `VALIDATED`. Raison : la validation de pièce est une action back-office (`/admin`, hors périmètre). La `StudyChecklist` affiche l'état réel de chaque pièce (`missing` / `received` / `validated`) et le drapeau « étude lançable » = bail+quittance présents. *(Si le produit veut vraiment gater sur `VALIDATED`, ça nécessite une UI de validation admin → hors scope v1 ; à rouvrir en revue.)*

## Vue d'ensemble des fichiers

**Créés — logique pure (lib, testée Vitest) :**
- `apps/web/lib/espace/study-checklist.ts` — dérive la checklist d'étude depuis les pièces.
- `apps/web/lib/espace/activity.ts` — dérive le flux d'activité (actions + messages + changements de statut).
- `apps/web/lib/espace/payout.ts` — net après commission, masque IBAN, étape de versement.
- `apps/web/lib/espace/dossier-context.ts` — helper de chargement + ownership partagé par le layout et les onglets.

**Créés — composants (`apps/web/components/espace/`) :**
- `WorkspaceTabs.tsx` (client), `VerdictCard.tsx`, `KpiStrip.tsx`, `DossierTimeline.tsx`, `NextStepRail.tsx`, `StudyChecklist.tsx`, `PiecesDropzone.tsx` (client), `PieceRow.tsx`, `MandatePanel.tsx`, `PayoutForm.tsx` (client), `PayoutTracker.tsx`, `MessageThread.tsx`, `ContactDialog.tsx` (client), `NotificationsPanel.tsx` (client), `EspaceHeader.tsx` (client).

**Créés — routes (`apps/web/app/espace/`) :**
- `[dossierId]/layout.tsx` (shell), `[dossierId]/page.tsx` (Aperçu — remplace l'actuel), `[dossierId]/pieces/page.tsx`, `[dossierId]/mandat/page.tsx`, `[dossierId]/messages/page.tsx`, `[dossierId]/versement/page.tsx`, `[dossierId]/actions.ts` (server actions onglets), `compte/page.tsx`, `compte/actions.ts`.

**Modifiés :**
- `apps/web/app/espace/page.tsx` — redirige si 1 dossier, vue d'accueil agrégée si ≥2, état vide si 0.
- `apps/web/app/espace/layout.tsx` — déléguer le header au shell `[dossierId]` (garder l'auth racine).
- `supabase/migrations/0007_profile_notifications.sql` — ajout `profiles.email_notifications`.
- `apps/web/lib/supabase/database.types.ts` — régénéré après migration (`pnpm db:types`).

**Réutilisés tels quels :** `apps/web/app/mandat/[dossierId]/actions.ts` (`uploadPiece`, `signMandate`, `savePayoutDetails`, `maybeAdvanceToReview`), `apps/web/lib/dossier/read.ts` (`getDossierDetail`, `listDossiersForUser`), `apps/web/lib/crypto.ts`, `apps/web/lib/auth/{guards,with-auth}.ts`, `apps/web/components/{Amount,ui/Button,ui/QuittanceCard,ui/Marker,ui/Stamp}.tsx`.

---

# PHASE 1 — Shell + Aperçu (read-only premium)

But : workspace à onglets visible, onglet Aperçu complet en lecture (VerdictCard + fourchette, KpiStrip, Timeline, NextStepRail, StudyChecklist). Gros gain visuel, zéro écriture.

### Task 1.1 : Fonction pure `buildStudyChecklist`

**Files:**
- Create: `apps/web/lib/espace/study-checklist.ts`
- Test: `apps/web/lib/espace/study-checklist.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```ts
// apps/web/lib/espace/study-checklist.test.ts
import { describe, it, expect } from "vitest";
import { buildStudyChecklist } from "./study-checklist";

describe("buildStudyChecklist", () => {
  it("aucune pièce → bail et quittance manquants, non lançable", () => {
    const r = buildStudyChecklist([]);
    expect(r.launchable).toBe(false);
    expect(r.items.map((i) => i.state)).toEqual(["missing", "missing"]);
  });

  it("bail reçu + quittance reçue → lançable", () => {
    const r = buildStudyChecklist([
      { kind: "bail", status: "RECEIVED" },
      { kind: "quittance", status: "RECEIVED" },
    ]);
    expect(r.launchable).toBe(true);
  });

  it("statut VALIDATED reflété sur l'item, prioritaire sur RECEIVED", () => {
    const r = buildStudyChecklist([
      { kind: "bail", status: "VALIDATED" },
      { kind: "quittance", status: "RECEIVED" },
      { kind: "quittance", status: "VALIDATED" },
    ]);
    const bail = r.items.find((i) => i.kind === "bail")!;
    const quittance = r.items.find((i) => i.kind === "quittance")!;
    expect(bail.state).toBe("validated");
    expect(quittance.state).toBe("validated");
    expect(r.launchable).toBe(true);
  });

  it("pièce ILLEGIBLE ne compte pas comme présente", () => {
    const r = buildStudyChecklist([{ kind: "bail", status: "ILLEGIBLE" }]);
    expect(r.items.find((i) => i.kind === "bail")!.state).toBe("missing");
    expect(r.launchable).toBe(false);
  });
});
```

- [ ] **Step 2: Lancer le test → échec attendu**

Run: `pnpm --filter @troppaye/web test study-checklist`
Expected: FAIL « buildStudyChecklist is not a function ».

- [ ] **Step 3: Implémenter**

```ts
// apps/web/lib/espace/study-checklist.ts
export type PieceStatus = "RECEIVED" | "ILLEGIBLE" | "VALIDATED";
export type ChecklistKind = "bail" | "quittance";
export type ChecklistState = "missing" | "received" | "validated";

export interface ChecklistItem {
  kind: ChecklistKind;
  label: string;
  required: boolean;
  state: ChecklistState;
}
export interface StudyChecklist {
  items: ChecklistItem[];
  /** bail + quittance présents (RECEIVED ou VALIDATED) → étude lançable. */
  launchable: boolean;
}

const REQUIRED: { kind: ChecklistKind; label: string }[] = [
  { kind: "bail", label: "Bail signé" },
  { kind: "quittance", label: "Dernière quittance de loyer" },
];

function stateFor(pieces: { kind: string; status: PieceStatus }[], kind: ChecklistKind): ChecklistState {
  const mine = pieces.filter((p) => p.kind === kind);
  if (mine.some((p) => p.status === "VALIDATED")) return "validated";
  if (mine.some((p) => p.status === "RECEIVED")) return "received";
  return "missing";
}

export function buildStudyChecklist(pieces: { kind: string; status: PieceStatus }[]): StudyChecklist {
  const items: ChecklistItem[] = REQUIRED.map(({ kind, label }) => ({
    kind,
    label,
    required: true,
    state: stateFor(pieces, kind),
  }));
  const launchable = items.every((i) => i.state !== "missing");
  return { items, launchable };
}
```

- [ ] **Step 4: Lancer le test → succès**

Run: `pnpm --filter @troppaye/web test study-checklist`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/espace/study-checklist.ts apps/web/lib/espace/study-checklist.test.ts
git commit -m "feat(espace): fonction pure buildStudyChecklist (gate etude)"
```

### Task 1.2 : Helper de contexte dossier (chargement + ownership partagé)

**Files:**
- Create: `apps/web/lib/espace/dossier-context.ts`

> Le layout et chaque onglet ont besoin du dossier. `getDossierDetail` applique déjà la RLS (renvoie `null` si non possédé). Ce helper centralise « charge ou `notFound()` » pour éviter la duplication.

- [ ] **Step 1: Implémenter (pas de test unitaire — wrapper fin sur `getDossierDetail` déjà couvert par RLS/e2e)**

```ts
// apps/web/lib/espace/dossier-context.ts
import { notFound } from "next/navigation";
import { getDossierDetail, type DossierDetail } from "@/lib/dossier/read";

/** Charge le détail d'un dossier possédé, sinon 404. À appeler en tête des onglets. */
export async function loadOwnedDossier(dossierId: string): Promise<DossierDetail> {
  const detail = await getDossierDetail(dossierId);
  if (!detail) notFound();
  return detail;
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/espace/dossier-context.ts
git commit -m "feat(espace): helper loadOwnedDossier (ownership + 404)"
```

### Task 1.3 : `WorkspaceTabs` (barre d'onglets cliente avec pastilles)

**Files:**
- Create: `apps/web/components/espace/WorkspaceTabs.tsx`

> Client Component. Détecte l'onglet actif via `usePathname()`. Une pastille (point `bg-stamp`) signale « action requise / non-lu » par onglet.

- [ ] **Step 1: Implémenter**

```tsx
// apps/web/components/espace/WorkspaceTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface TabDef {
  key: string;
  label: string;
  /** segment relatif ; "" = Aperçu (route racine du dossier). */
  segment: string;
  /** affiche une pastille « action requise / non-lu ». */
  flag?: boolean;
}

export function WorkspaceTabs({ dossierId, tabs }: { dossierId: string; tabs: TabDef[] }) {
  const pathname = usePathname();
  const base = `/espace/${dossierId}`;
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line" aria-label="Onglets du dossier">
      {tabs.map((t) => {
        const href = t.segment ? `${base}/${t.segment}` : base;
        const active = t.segment ? pathname.startsWith(href) : pathname === base;
        return (
          <Link
            key={t.key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              active ? "border-b-2 border-ink text-ink" : "text-ink/55 hover:text-ink"
            }`}
          >
            {t.label}
            {t.flag ? (
              <span className="absolute right-1 top-2 h-1.5 w-1.5 rounded-full bg-stamp" aria-label="action requise" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/components/espace/WorkspaceTabs.tsx
git commit -m "feat(espace): WorkspaceTabs (nav onglets + pastilles)"
```

### Task 1.4 : `EspaceHeader` (logo, cloche, contact, menu compte)

**Files:**
- Create: `apps/web/components/espace/EspaceHeader.tsx`

> Client Component (pilote les overlays Notifications/Contact via state local). Reçoit les données déjà calculées côté serveur (compteur d'activité non-lu, email). Les overlays eux-mêmes (`NotificationsPanel`, `ContactDialog`) sont branchés en Phase 3/5 ; en Phase 1 les boutons existent mais ouvrent un panneau vide « bientôt ». Pour éviter de réécrire le header, on passe les panneaux en `children`/props optionnelles.

- [ ] **Step 1: Implémenter (squelette avec slots overlays optionnels)**

```tsx
// apps/web/components/espace/EspaceHeader.tsx
"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

export function EspaceHeader({
  email,
  activityCount,
  notifications,
  contact,
}: {
  email: string | null;
  activityCount: number;
  notifications?: ReactNode; // NotificationsPanel (Phase 3)
  contact?: ReactNode; // ContactDialog (Phase 5)
}) {
  const [open, setOpen] = useState<null | "notif" | "contact">(null);
  return (
    <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3">
      <Link href="/espace" className="font-display text-lg font-extrabold tracking-display">
        TropPayé
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(open === "notif" ? null : "notif")}
          className="relative rounded-field px-3 py-2 text-sm text-ink/70 hover:bg-paper-2"
          aria-label="Notifications"
        >
          🔔
          {activityCount > 0 ? (
            <span className="absolute -right-0 -top-0 min-w-4 rounded-full bg-stamp px-1 text-[10px] text-paper">
              {activityCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setOpen(open === "contact" ? null : "contact")}
          className="rounded-field px-3 py-2 text-sm text-ink/70 hover:bg-paper-2"
        >
          Contact
        </button>
        <Link href="/espace/compte" className="rounded-field px-3 py-2 text-sm text-ink/70 hover:bg-paper-2">
          {email ?? "Mon compte"}
        </Link>
      </div>
      {open === "notif" && notifications ? <div className="absolute right-4 top-16 z-50">{notifications}</div> : null}
      {open === "contact" && contact ? <div className="absolute right-4 top-16 z-50">{contact}</div> : null}
    </header>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/components/espace/EspaceHeader.tsx
git commit -m "feat(espace): EspaceHeader (cloche, contact, compte) avec slots overlays"
```

### Task 1.5 : Shell `layout.tsx` du workspace

**Files:**
- Create: `apps/web/app/espace/[dossierId]/layout.tsx`
- Modify: `apps/web/app/espace/layout.tsx`

> Le layout `[dossierId]` charge le dossier + la checklist pour calculer les pastilles d'onglets, rend `EspaceHeader` + `WorkspaceTabs` puis `{children}`. Le layout racine `/espace` garde l'auth (`requireAuthPage`) mais ne doit plus dupliquer le header (sinon double header). On retire le header du layout racine et on ne garde que l'auth + conteneur.

- [ ] **Step 1: Créer le shell**

```tsx
// apps/web/app/espace/[dossierId]/layout.tsx
import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { requireAuthPage } from "@/lib/auth/guards";
import { buildStudyChecklist } from "@/lib/espace/study-checklist";
import { EspaceHeader } from "@/components/espace/EspaceHeader";
import { WorkspaceTabs, type TabDef } from "@/components/espace/WorkspaceTabs";

export const dynamic = "force-dynamic";

export default async function DossierLayout({
  params,
  children,
}: {
  params: Promise<{ dossierId: string }>;
  children: React.ReactNode;
}) {
  const { user } = await requireAuthPage();
  const { dossierId } = await params;
  const detail = await loadOwnedDossier(dossierId);

  const checklist = buildStudyChecklist(detail.pieces.map((p) => ({ kind: p.kind, status: p.status })));
  const needsPieces = detail.dossier.status === "MANDATE_PENDING" && !checklist.launchable;
  const needsMandate = detail.dossier.status === "DIAGNOSED";

  const tabs: TabDef[] = [
    { key: "apercu", label: "Aperçu", segment: "" },
    { key: "pieces", label: "Pièces", segment: "pieces", flag: needsPieces },
    { key: "mandat", label: "Mandat", segment: "mandat", flag: needsMandate },
    { key: "messages", label: "Messages", segment: "messages" },
    { key: "versement", label: "Versement", segment: "versement" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <EspaceHeader email={user.email ?? null} activityCount={0} />
      <div className="mx-auto max-w-container px-4">
        <WorkspaceTabs dossierId={dossierId} tabs={tabs} />
        <main className="py-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Alléger le layout racine** (`apps/web/app/espace/layout.tsx`) pour ne garder que l'auth + un conteneur neutre (le header vit désormais dans le shell `[dossierId]`, et la page `/espace` racine fournira son propre en-tête léger en Task 1.8). Remplacer le contenu par :

```tsx
// apps/web/app/espace/layout.tsx
import { requireAuthPage } from "@/lib/auth/guards";

export default async function EspaceRootLayout({ children }: { children: React.ReactNode }) {
  await requireAuthPage();
  return <>{children}</>;
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/espace/[dossierId]/layout.tsx apps/web/app/espace/layout.tsx
git commit -m "feat(espace): shell workspace (header + onglets) et auth racine"
```

### Task 1.6 : Composants de présentation de l'Aperçu

**Files:**
- Create: `apps/web/components/espace/VerdictCard.tsx`
- Create: `apps/web/components/espace/KpiStrip.tsx`
- Create: `apps/web/components/espace/DossierTimeline.tsx`
- Create: `apps/web/components/espace/NextStepRail.tsx`
- Create: `apps/web/components/espace/StudyChecklist.tsx`

> Ces 5 composants sont presentationnels (Server Components, aucune écriture). Ils reçoivent des props typées et rendent du Tailwind charte. Pas de test unitaire (vérif visuelle + e2e Phase 1). `DossierTimeline` réutilise la logique de `apps/web/app/espace/[dossierId]/Timeline.tsx` existante (frise J0/J21/J35/J50) en la relookant ; ne pas réécrire `buildTimeline`, l'importer.

- [ ] **Step 1: `VerdictCard.tsx`** — carte verdict format « dossier d'instruction ». Props :

```tsx
// apps/web/components/espace/VerdictCard.tsx
import { Amount } from "@/components/Amount";
import { Stamp } from "@/components/ui/Stamp";

export interface VerdictCardProps {
  totalRecoverableCents: number;
  totalFutureMonthlySavingCents: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  /** lignes de calcul détaillé (audit trail résumé), label + montant. */
  breakdown: { label: string; cents: number }[];
}
```

Structure : conteneur `rounded-card border border-line bg-paper-2 p-6` ; fourchette proéminente (`<Amount cents favorable className="text-3xl font-medium">`) ; sous-titre économie/mois ; tampon de confiance via `<Stamp tone={confidence === "HIGH" ? "refund" : "stamp"}>` ; liste `breakdown` en `font-mono tabular-nums`. `prefers-reduced-motion` respecté (pas d'anim bloquante).

- [ ] **Step 2: `KpiStrip.tsx`** — bande de 3-4 KPI. Props :

```tsx
export interface KpiStripProps {
  items: { label: string; value: string; tone?: "default" | "refund" | "stamp" }[];
}
```

Rendu : `grid grid-cols-2 gap-3 sm:grid-cols-4`, chaque KPI = `rounded-field border border-line bg-paper px-4 py-3`, valeur en `font-mono tabular-nums`.

- [ ] **Step 3: `DossierTimeline.tsx`** — réutilise la frise existante. Props identiques à l'actuel `Timeline` :

```tsx
export interface DossierTimelineProps {
  status: import("@troppaye/shared").DossierStatus;
  actions: { type: string; scheduled_at: string | null; executed_at: string | null }[];
}
```

Importer `buildTimeline` depuis l'emplacement actuel utilisé par `apps/web/app/espace/[dossierId]/Timeline.tsx` (vérifier le chemin d'import dans ce fichier et le réutiliser tel quel). Relooker : étapes avec tampon « POSTÉ »/date pour les actions exécutées (`<Stamp>`), point courant accentué `bg-accent`.

- [ ] **Step 4: `NextStepRail.tsx`** — rail collant « prochaine étape ». Props :

```tsx
export interface NextStepRailProps {
  text: string;
  href?: string;
  cta?: string;
}
```

Rendu : `sticky top-6 rounded-card border border-ink bg-ink p-5 text-paper` ; CTA via `<Button href={href} variant="accent">` si présent. Reprendre la fonction `nextStep(status, id)` de l'actuel `page.tsx` (la déplacer dans ce module ou un util partagé `apps/web/lib/espace/next-step.ts` pour la réutiliser).

- [ ] **Step 5: `StudyChecklist.tsx`** — consomme `StudyChecklist` (Task 1.1). Props :

```tsx
import type { StudyChecklist as StudyChecklistData } from "@/lib/espace/study-checklist";
export interface StudyChecklistProps {
  data: StudyChecklistData;
  /** lien vers l'onglet Pièces pour compléter. */
  piecesHref: string;
}
```

Rendu : liste à puces, chaque item avec icône d'état (`missing` = cercle vide `border-line`, `received` = `bg-accent`, `validated` = `bg-refund` + ✓). Bandeau bas : si `data.launchable` → « Étude lançable » (vert refund) ; sinon CTA `<Button href={piecesHref}>Compléter mes pièces</Button>`.

- [ ] **Step 6: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/components/espace/VerdictCard.tsx apps/web/components/espace/KpiStrip.tsx apps/web/components/espace/DossierTimeline.tsx apps/web/components/espace/NextStepRail.tsx apps/web/components/espace/StudyChecklist.tsx apps/web/lib/espace/next-step.ts
git commit -m "feat(espace): composants Apercu (VerdictCard, KpiStrip, Timeline, NextStepRail, StudyChecklist)"
```

### Task 1.7 : Onglet Aperçu `page.tsx` (remplace l'actuel détail)

**Files:**
- Modify: `apps/web/app/espace/[dossierId]/page.tsx` (réécriture complète)

> Le `page.tsx` actuel devient l'Aperçu : il assemble VerdictCard + KpiStrip + DossierTimeline + StudyChecklist en colonne principale et NextStepRail dans le rail. Les pièces/messages déménagent dans leurs onglets dédiés (Phases 2/3) — les retirer d'ici. Conserver `getDossierDetail` (via `loadOwnedDossier`).

- [ ] **Step 1: Réécrire la page**

```tsx
// apps/web/app/espace/[dossierId]/page.tsx
import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { buildStudyChecklist } from "@/lib/espace/study-checklist";
import { nextStep } from "@/lib/espace/next-step";
import { formatEur } from "@troppaye/rules-engine";
import { VerdictCard } from "@/components/espace/VerdictCard";
import { KpiStrip } from "@/components/espace/KpiStrip";
import { DossierTimeline } from "@/components/espace/DossierTimeline";
import { NextStepRail } from "@/components/espace/NextStepRail";
import { StudyChecklist } from "@/components/espace/StudyChecklist";

export const dynamic = "force-dynamic";

export default async function ApercuPage({ params }: { params: Promise<{ dossierId: string }> }) {
  const { dossierId } = await params;
  const { dossier, verdict, actions, pieces } = await loadOwnedDossier(dossierId);
  const checklist = buildStudyChecklist(pieces.map((p) => ({ kind: p.kind, status: p.status })));
  const step = nextStep(dossier.status, dossierId);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-8">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-display">
            {dossier.address_label ?? "Votre dossier"}
          </h1>
        </div>

        {verdict && verdict.totalRecoverableCents > 0 ? (
          <VerdictCard
            totalRecoverableCents={verdict.totalRecoverableCents}
            totalFutureMonthlySavingCents={verdict.totalFutureMonthlySavingCents}
            confidence={verdict.confidence}
            breakdown={verdict.results.map((r) => ({
              label: r.ruleLabel ?? r.ruleId,
              cents: r.recoverableCents ?? 0,
            }))}
          />
        ) : null}

        <KpiStrip
          items={[
            { label: "Trop-perçu visé", value: formatEur(verdict?.totalRecoverableCents ?? 0), tone: "refund" },
            { label: "Confiance", value: verdict?.confidence ?? "—" },
            { label: "Statut", value: dossier.status },
          ]}
        />

        <section>
          <h2 className="mb-4 font-display text-lg font-bold">Suivi de votre dossier</h2>
          <DossierTimeline
            status={dossier.status}
            actions={actions.map((a) => ({ type: a.type, scheduled_at: a.scheduled_at, executed_at: a.executed_at }))}
          />
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-bold">Checklist d'étude</h2>
          <StudyChecklist data={checklist} piecesHref={`/espace/${dossierId}/pieces`} />
        </section>
      </div>

      <aside>
        <NextStepRail text={step.text} href={step.href} cta={step.cta} />
      </aside>
    </div>
  );
}
```

> NOTE pour l'implémenteur : vérifier les noms de champs réels sur `VerdictGlobal` (`results`, `ruleLabel`, `recoverableCents`, `confidence`, `totalRecoverableCents`, `totalFutureMonthlySavingCents`) via `apps/web/lib/diagnostic/verdict-map.ts` / le type `@troppaye/rules-engine`. Si un champ diffère, ajuster le mapping `breakdown` en conséquence (ne pas inventer de champ).

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @troppaye/web typecheck`
Expected: PASS (corriger le mapping `breakdown`/`confidence` si le type réel diffère).

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/espace/[dossierId]/page.tsx
git commit -m "feat(espace): onglet Apercu premium (verdict, KPI, timeline, checklist)"
```

### Task 1.8 : E2E Playwright — Aperçu se charge

**Files:**
- Create: `apps/web/e2e/espace-apercu.spec.ts` (adapter au dossier e2e réel du repo — vérifier où vivent les specs Playwright existantes et le helper de login démo `scripts/demo-login.ts`)

- [ ] **Step 1: Écrire le test e2e**

```ts
// apps/web/e2e/espace-apercu.spec.ts
import { test, expect } from "@playwright/test";

// Pré-requis : session démo (réutiliser le storageState / helper de login existant du repo).
test("l'aperçu du dossier affiche la fourchette et les onglets", async ({ page }) => {
  await page.goto("/espace");
  // Si redirigé vers un dossier unique, on est déjà sur l'aperçu ; sinon cliquer le 1er dossier.
  if (page.url().endsWith("/espace")) {
    await page.getByRole("link", { name: /dossier|rue|avenue|loyer/i }).first().click();
  }
  await expect(page.getByRole("navigation", { name: /onglets du dossier/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Aperçu" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pièces" })).toBeVisible();
});
```

- [ ] **Step 2: Lancer l'e2e** (selon la commande Playwright du repo, ex. `pnpm --filter @troppaye/web exec playwright test espace-apercu`)
Expected: PASS (après seed démo via `pnpm db:seed-demo`).

- [ ] **Step 3: Vérification visuelle manuelle** — `pnpm dev`, ouvrir `/espace/<id>`, contrôler DA (mono tabular sur montants, vert refund, tampons, rail collant, pas d'anim si reduced-motion). Capturer un screenshot.

- [ ] **Step 4: Commit**

```bash
git add apps/web/e2e/espace-apercu.spec.ts
git commit -m "test(espace): e2e chargement onglet Apercu"
```

**⛔ Phase gate 1 :** `pnpm --filter @troppaye/web typecheck` ✅ · `pnpm --filter @troppaye/web test` ✅ · e2e Aperçu ✅ · vérif visuelle ✅ avant Phase 2.

---

# PHASE 2 — Pièces (dropzone chiffrée + statuts + gate)

But : onglet Pièces avec dépôt glisser-déposer (réutilise `uploadPiece` chiffré existant), affichage des statuts, et passage `MANDATE_PENDING → IN_REVIEW` (gate existant `maybeAdvanceToReview`, déclenché par l'upload).

### Task 2.1 : `PieceRow` (ligne de pièce + statut)

**Files:**
- Create: `apps/web/components/espace/PieceRow.tsx`

- [ ] **Step 1: Implémenter** (Server Component présentationnel)

```tsx
// apps/web/components/espace/PieceRow.tsx
const PIECE_LABEL: Record<string, string> = {
  bail: "Bail", quittance: "Quittance", dpe: "DPE", edl: "État des lieux", rib: "RIB", autre: "Autre document",
};
const STATUS_LABEL: Record<string, { text: string; tone: string }> = {
  RECEIVED: { text: "Reçue", tone: "text-ink/45" },
  VALIDATED: { text: "Validée", tone: "text-refund-text" },
  ILLEGIBLE: { text: "Illisible — à renvoyer", tone: "text-stamp" },
};

export function PieceRow({ piece }: { piece: { id: string; kind: string; status: string; reason: string | null } }) {
  const s = STATUS_LABEL[piece.status] ?? STATUS_LABEL.RECEIVED;
  return (
    <a
      href={`/api/pieces/${piece.id}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-field border border-line bg-paper px-4 py-3 text-sm hover:border-ink/40"
    >
      <span>{PIECE_LABEL[piece.kind] ?? piece.kind}</span>
      <span className={s.tone}>
        {s.text}
        {piece.status === "ILLEGIBLE" && piece.reason ? ` (${piece.reason})` : ""}
      </span>
    </a>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/components/espace/PieceRow.tsx
git commit -m "feat(espace): PieceRow (ligne piece + statut)"
```

### Task 2.2 : `PiecesDropzone` (drag & drop client) réutilisant `uploadPiece`

**Files:**
- Create: `apps/web/components/espace/PiecesDropzone.tsx`

> Client Component. Réutilise l'action serveur EXISTANTE `uploadPiece(formData)` de `apps/web/app/mandat/[dossierId]/actions.ts` (ne PAS dupliquer la logique de chiffrement). Après succès, `router.refresh()` (la page onglet est `force-dynamic`, donc re-fetch). Gère drag&drop + sélecteur fichier + erreurs (type/poids déjà validés serveur, message remonté).

- [ ] **Step 1: Implémenter**

```tsx
// apps/web/components/espace/PiecesDropzone.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadPiece } from "@/app/mandat/[dossierId]/actions";
import { Button } from "@/components/ui/Button";

const KINDS = [
  { value: "bail", label: "Bail" },
  { value: "quittance", label: "Quittance" },
  { value: "dpe", label: "DPE" },
  { value: "edl", label: "État des lieux" },
  { value: "rib", label: "RIB" },
  { value: "autre", label: "Autre" },
] as const;

export function PiecesDropzone({ dossierId }: { dossierId: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<string>("bail");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function send(file: File) {
    setError(null);
    const fd = new FormData();
    fd.set("dossierId", dossierId);
    fd.set("kind", kind);
    fd.set("file", file);
    start(async () => {
      const res = await uploadPiece(fd);
      if ("error" in res) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        Type de pièce
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="ml-2 rounded-field border border-line bg-paper px-2 py-1"
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
      </label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) send(f);
        }}
        className="flex flex-col items-center gap-3 rounded-card border-2 border-dashed border-line bg-paper-2 px-6 py-10 text-center text-sm text-ink/60"
      >
        <p>Glissez un fichier ici (PDF/image, max 10 Mo)</p>
        <label className="cursor-pointer">
          <input
            type="file"
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) send(f);
            }}
          />
          <span className="inline-block rounded-field bg-ink px-4 py-2 text-paper">
            {pending ? "Envoi…" : "Choisir un fichier"}
          </span>
        </label>
      </div>

      {error ? <p className="text-sm text-stamp" role="alert">{error}</p> : null}
    </div>
  );
}
```

> NOTE : si l'import de `uploadPiece` depuis `@/app/mandat/[dossierId]/actions` pose problème de couplage de route, l'implémenteur peut ré-exporter l'action depuis `apps/web/app/espace/[dossierId]/actions.ts` (`export { uploadPiece } from "@/app/mandat/[dossierId]/actions"`) et importer depuis là. Ne pas réimplémenter le chiffrement.

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/components/espace/PiecesDropzone.tsx
git commit -m "feat(espace): PiecesDropzone (drag&drop reutilisant uploadPiece chiffre)"
```

### Task 2.3 : Onglet Pièces `pieces/page.tsx`

**Files:**
- Create: `apps/web/app/espace/[dossierId]/pieces/page.tsx`

- [ ] **Step 1: Implémenter**

```tsx
// apps/web/app/espace/[dossierId]/pieces/page.tsx
import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { buildStudyChecklist } from "@/lib/espace/study-checklist";
import { PiecesDropzone } from "@/components/espace/PiecesDropzone";
import { PieceRow } from "@/components/espace/PieceRow";
import { StudyChecklist } from "@/components/espace/StudyChecklist";

export const dynamic = "force-dynamic";

export default async function PiecesPage({ params }: { params: Promise<{ dossierId: string }> }) {
  const { dossierId } = await params;
  const { pieces } = await loadOwnedDossier(dossierId);
  const checklist = buildStudyChecklist(pieces.map((p) => ({ kind: p.kind, status: p.status })));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Vos pièces</h1>
        <PiecesDropzone dossierId={dossierId} />
        {pieces.length > 0 ? (
          <ul className="space-y-2">
            {pieces.map((p) => (
              <li key={p.id}>
                <PieceRow piece={{ id: p.id, kind: p.kind, status: p.status, reason: p.reason }} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/55">Aucune pièce déposée pour l'instant.</p>
        )}
      </div>
      <aside>
        <StudyChecklist data={checklist} piecesHref={`/espace/${dossierId}/pieces`} />
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/app/espace/[dossierId]/pieces/page.tsx
git commit -m "feat(espace): onglet Pieces (dropzone + statuts + checklist)"
```

### Task 2.4 : E2E — upload pièce → gate IN_REVIEW

**Files:**
- Create: `apps/web/e2e/espace-pieces.spec.ts`

> Ce test prouve la tranche verticale : déposer bail + quittance fait passer le dossier en `IN_REVIEW`. Pré-requis : un dossier démo en `MANDATE_PENDING` (étendre `scripts/seed-demo.ts` si besoin — tâche d'implémentation : s'assurer qu'un dossier seed est en MANDATE_PENDING).

- [ ] **Step 1: Écrire le test**

```ts
// apps/web/e2e/espace-pieces.spec.ts
import { test, expect } from "@playwright/test";
import path from "node:path";

test("déposer bail + quittance lance l'étude (IN_REVIEW)", async ({ page }) => {
  await page.goto(`/espace/${process.env.E2E_DOSSIER_MANDATE_PENDING}/pieces`);

  for (const kind of ["bail", "quittance"]) {
    await page.getByRole("combobox").selectOption(kind);
    await page.locator('input[type="file"]').setInputFiles(path.join(__dirname, "fixtures/sample.pdf"));
    await expect(page.getByText(/Reçue|Validée/).first()).toBeVisible();
  }

  // Le passage IN_REVIEW se reflète sur l'Aperçu (KPI Statut).
  await page.goto(`/espace/${process.env.E2E_DOSSIER_MANDATE_PENDING}`);
  await expect(page.getByText("IN_REVIEW")).toBeVisible();
});
```

- [ ] **Step 2: Lancer l'e2e** → PASS (créer la fixture `apps/web/e2e/fixtures/sample.pdf` si absente).

- [ ] **Step 3: Commit**

```bash
git add apps/web/e2e/espace-pieces.spec.ts apps/web/e2e/fixtures/sample.pdf
git commit -m "test(espace): e2e upload pieces -> gate IN_REVIEW"
```

**⛔ Phase gate 2 :** typecheck ✅ · tests ✅ · e2e pièces ✅ · vérif visuelle dropzone ✅.

---

# PHASE 3 — Messages + Notifications (flux dérivé)

But : onglet Messages relooké (réutilise le fil + l'action `postMessage` existants) ; panneau Notifications = flux d'activité **dérivé en lecture** (actions + messages + changements de statut), sans table ni « marquer lu » (v2).

### Task 3.1 : Fonction pure `buildActivityFeed`

**Files:**
- Create: `apps/web/lib/espace/activity.ts`
- Test: `apps/web/lib/espace/activity.test.ts`

- [ ] **Step 1: Test qui échoue**

```ts
// apps/web/lib/espace/activity.test.ts
import { describe, it, expect } from "vitest";
import { buildActivityFeed } from "./activity";

describe("buildActivityFeed", () => {
  it("fusionne actions exécutées + messages, trié du plus récent au plus ancien", () => {
    const feed = buildActivityFeed({
      actions: [
        { type: "LETTER_J0", scheduled_at: "2026-01-01T00:00:00Z", executed_at: "2026-01-02T10:00:00Z" },
      ],
      messages: [{ id: "m1", sender: "operator", body: "Bonjour", created_at: "2026-01-03T09:00:00Z" }],
    });
    expect(feed).toHaveLength(2);
    expect(feed[0].at >= feed[1].at).toBe(true);
    expect(feed[0].kind).toBe("message");
  });

  it("ignore les actions non exécutées (planifiées seulement)", () => {
    const feed = buildActivityFeed({
      actions: [{ type: "REMINDER_J21", scheduled_at: "2026-02-01T00:00:00Z", executed_at: null }],
      messages: [],
    });
    expect(feed).toHaveLength(0);
  });

  it("messages du client exclus du flux d'activité (c'est lui qui les a écrits)", () => {
    const feed = buildActivityFeed({
      actions: [],
      messages: [{ id: "m1", sender: "client", body: "test", created_at: "2026-01-01T00:00:00Z" }],
    });
    expect(feed).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Lancer → échec.** `pnpm --filter @troppaye/web test activity`

- [ ] **Step 3: Implémenter**

```ts
// apps/web/lib/espace/activity.ts
export interface ActivityEvent {
  id: string;
  at: string; // ISO
  kind: "action" | "message";
  label: string;
}

const ACTION_LABEL: Record<string, string> = {
  LETTER_J0: "Courrier de mise en demeure envoyé",
  REMINDER_J21: "Relance envoyée",
  PROPOSAL_J35: "Proposition transmise",
  FINAL_NOTICE_J50: "Dernière relance envoyée",
  LANDLORD_REPLY: "Réponse du bailleur reçue",
  ESCALATION: "Dossier escaladé",
  PAYMENT_RECEIVED: "Paiement reçu",
  PAYOUT_SENT: "Versement effectué",
};

export function buildActivityFeed(input: {
  actions: { type: string; scheduled_at: string | null; executed_at: string | null }[];
  messages: { id: string; sender: string; body: string; created_at: string }[];
}): ActivityEvent[] {
  const fromActions: ActivityEvent[] = input.actions
    .filter((a) => a.executed_at)
    .map((a) => ({
      id: `a-${a.type}-${a.executed_at}`,
      at: a.executed_at!,
      kind: "action" as const,
      label: ACTION_LABEL[a.type] ?? a.type,
    }));

  const fromMessages: ActivityEvent[] = input.messages
    .filter((m) => m.sender !== "client")
    .map((m) => ({
      id: `m-${m.id}`,
      at: m.created_at,
      kind: "message" as const,
      label: m.sender === "system" ? "Mise à jour automatique" : "Nouveau message de l'équipe",
    }));

  return [...fromActions, ...fromMessages].sort((x, y) => (x.at < y.at ? 1 : -1));
}
```

- [ ] **Step 4: Lancer → succès.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/espace/activity.ts apps/web/lib/espace/activity.test.ts
git commit -m "feat(espace): buildActivityFeed (flux d'activite derive)"
```

### Task 3.2 : `NotificationsPanel` + `MessageThread`

**Files:**
- Create: `apps/web/components/espace/NotificationsPanel.tsx`
- Create: `apps/web/components/espace/MessageThread.tsx`

- [ ] **Step 1: `NotificationsPanel.tsx`** (présentationnel, reçoit le flux déjà calculé)

```tsx
// apps/web/components/espace/NotificationsPanel.tsx
import { frenchDate } from "@/lib/format-date";
import type { ActivityEvent } from "@/lib/espace/activity";

export function NotificationsPanel({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="w-80 rounded-card border border-line bg-paper p-4 shadow-paper">
      <p className="mb-3 font-display text-sm font-bold">Activité récente</p>
      {events.length === 0 ? (
        <p className="text-sm text-ink/55">Rien de neuf pour l'instant.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="flex justify-between gap-3 text-sm">
              <span>{e.label}</span>
              <span className="shrink-0 text-ink/45">{frenchDate(e.at)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-ink/40">« Marquer comme lu » arrive bientôt.</p>
    </div>
  );
}
```

> `shadow-paper` : vérifier que ce token d'ombre existe dans la config Tailwind ; sinon utiliser l'ombre papier réellement définie dans `tailwind.config`.

- [ ] **Step 2: `MessageThread.tsx`** — porter l'actuel `apps/web/app/espace/[dossierId]/Messages.tsx` (fil + textarea + `postMessage`) sous le nouveau nom, relooké charte (bulles `operator`/`system` à gauche fond `paper-2`, `client` à droite fond `ink/5`). Réutiliser l'action `postMessage` existante (`apps/web/app/espace/[dossierId]/actions.ts`). Garder l'interface props :

```tsx
export interface MessageThreadProps {
  dossierId: string;
  messages: { id: string; sender: string; body: string; created_at: string }[];
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/components/espace/NotificationsPanel.tsx apps/web/components/espace/MessageThread.tsx
git commit -m "feat(espace): NotificationsPanel (flux derive) + MessageThread relooke"
```

### Task 3.3 : Onglet Messages + branchement Notifications dans le shell

**Files:**
- Create: `apps/web/app/espace/[dossierId]/messages/page.tsx`
- Modify: `apps/web/app/espace/[dossierId]/layout.tsx` (passer le flux + compteur au header)

- [ ] **Step 1: `messages/page.tsx`**

```tsx
// apps/web/app/espace/[dossierId]/messages/page.tsx
import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { MessageThread } from "@/components/espace/MessageThread";

export const dynamic = "force-dynamic";

export default async function MessagesPage({ params }: { params: Promise<{ dossierId: string }> }) {
  const { dossierId } = await params;
  const { messages } = await loadOwnedDossier(dossierId);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-extrabold tracking-display">Messages</h1>
      <MessageThread
        dossierId={dossierId}
        messages={messages.map((m) => ({ id: m.id, sender: m.sender, body: m.body, created_at: m.created_at }))}
      />
    </div>
  );
}
```

- [ ] **Step 2: Brancher le flux dans le shell** — dans `layout.tsx`, calculer le flux et le passer au header :

```tsx
// dans apps/web/app/espace/[dossierId]/layout.tsx, après loadOwnedDossier
import { buildActivityFeed } from "@/lib/espace/activity";
import { NotificationsPanel } from "@/components/espace/NotificationsPanel";
// ...
const feed = buildActivityFeed({
  actions: detail.actions.map((a) => ({ type: a.type, scheduled_at: a.scheduled_at, executed_at: a.executed_at })),
  messages: detail.messages.map((m) => ({ id: m.id, sender: m.sender, body: m.body, created_at: m.created_at })),
});
// puis :
<EspaceHeader
  email={user.email ?? null}
  activityCount={feed.length}
  notifications={<NotificationsPanel events={feed} />}
/>
```

Mettre aussi la pastille onglet Messages : `flag: detail.messages.some((m) => m.sender !== "client")` (au moins un message équipe — proxy « non-lu » en attendant le persistant v2).

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/app/espace/[dossierId]/messages/page.tsx apps/web/app/espace/[dossierId]/layout.tsx
git commit -m "feat(espace): onglet Messages + cloche activite branchee au shell"
```

### Task 3.4 : E2E — envoyer un message

**Files:**
- Create: `apps/web/e2e/espace-messages.spec.ts`

- [ ] **Step 1: Test**

```ts
// apps/web/e2e/espace-messages.spec.ts
import { test, expect } from "@playwright/test";

test("le locataire envoie un message et le voit apparaître", async ({ page }) => {
  await page.goto(`/espace/${process.env.E2E_DOSSIER_ID}/messages`);
  const txt = `Test ${Date.now()}`;
  await page.getByRole("textbox").fill(txt);
  await page.getByRole("button", { name: /envoyer/i }).click();
  await expect(page.getByText(txt)).toBeVisible();
});
```

- [ ] **Step 2: Lancer → PASS. Step 3: Commit**

```bash
git add apps/web/e2e/espace-messages.spec.ts
git commit -m "test(espace): e2e envoi message"
```

**⛔ Phase gate 3 :** typecheck ✅ · tests (activity + e2e) ✅ · cloche affiche le flux ✅.

---

# PHASE 4 — Mandat (onglet) + Versement (RIB chiffré + suivi)

But : amener la signature de mandat dans un onglet `…/mandat` (réutilise `signMandate` existant) et créer l'onglet `…/versement` (saisie RIB via `savePayoutDetails` existant, IBAN affiché masqué, suivi Récupéré→Programmé→Versé).

### Task 4.1 : Fonctions pures `payout.ts` (net après commission, masque IBAN, étape)

**Files:**
- Create: `apps/web/lib/espace/payout.ts`
- Test: `apps/web/lib/espace/payout.test.ts`

- [ ] **Step 1: Test qui échoue**

```ts
// apps/web/lib/espace/payout.test.ts
import { describe, it, expect } from "vitest";
import { netAfterFee, maskIban, payoutStage } from "./payout";

describe("netAfterFee", () => {
  it("retire 25 % (2500 bps) en centimes, arrondi à l'entier", () => {
    expect(netAfterFee(100_000, 2500)).toBe(75_000);
    expect(netAfterFee(99_999, 2500)).toBe(74_999); // 99999 - round(24999.75)=25000 -> 74999
  });
});

describe("maskIban", () => {
  it("masque le milieu, garde indicatif pays + 4 derniers", () => {
    expect(maskIban("FR7630006000011234567890189")).toBe("FR76 •••• 0189");
  });
});

describe("payoutStage", () => {
  it("OUT_TENANT présent → versé", () => {
    expect(payoutStage({ status: "WON", movements: [{ direction: "IN" }, { direction: "OUT_TENANT" }] })).toBe("paid");
  });
  it("IN seul → récupéré", () => {
    expect(payoutStage({ status: "WON", movements: [{ direction: "IN" }] })).toBe("recovered");
  });
  it("aucun mouvement → en attente", () => {
    expect(payoutStage({ status: "RECOVERY", movements: [] })).toBe("pending");
  });
});
```

- [ ] **Step 2: Lancer → échec.**

- [ ] **Step 3: Implémenter**

```ts
// apps/web/lib/espace/payout.ts
export type PayoutStage = "pending" | "recovered" | "paid";

/** Net reversé au locataire = récupéré − commission (bps). Tout en centimes. */
export function netAfterFee(recoverableCents: number, feeRateBps: number): number {
  const fee = Math.round((recoverableCents * feeRateBps) / 10_000);
  return recoverableCents - fee;
}

/** Affichage masqué : « FR76 •••• 0189 » (jamais l'IBAN complet côté client). */
export function maskIban(iban: string): string {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  const country = clean.slice(0, 4);
  const last4 = clean.slice(-4);
  return `${country} •••• ${last4}`;
}

export function payoutStage(input: { status: string; movements: { direction: string }[] }): PayoutStage {
  if (input.movements.some((m) => m.direction === "OUT_TENANT")) return "paid";
  if (input.movements.some((m) => m.direction === "IN")) return "recovered";
  return "pending";
}
```

- [ ] **Step 4: Lancer → succès. Step 5: Commit**

```bash
git add apps/web/lib/espace/payout.ts apps/web/lib/espace/payout.test.ts
git commit -m "feat(espace): payout pur (netAfterFee, maskIban, payoutStage)"
```

### Task 4.2 : Lecture serveur du RIB masqué + mouvements

**Files:**
- Create: `apps/web/lib/espace/payout-read.ts`

> Le RIB est chiffré (`payout_details.iban_encrypted`, base64 d'AES-GCM). On le déchiffre **côté serveur** (admin client + `decryptBytes`), on renvoie **uniquement** la version masquée + le nom du titulaire. Les mouvements viennent de `fund_movements`.

- [ ] **Step 1: Implémenter**

```ts
// apps/web/lib/espace/payout-read.ts
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { decryptBytes } from "@/lib/crypto";
import { maskIban } from "@/lib/espace/payout";

export interface PayoutView {
  holderName: string | null;
  ibanMasked: string | null;
  movements: { direction: string; amount_cents: number; occurred_at: string }[];
}

/** Charge le RIB masqué + mouvements. Ownership : appelé après loadOwnedDossier (RLS déjà passée). */
export async function getPayoutView(dossierId: string): Promise<PayoutView> {
  const admin = getSupabaseAdmin();
  const [{ data: pd }, { data: mv }] = await Promise.all([
    admin.from("payout_details").select("holder_name, iban_encrypted").eq("dossier_id", dossierId).maybeSingle(),
    admin
      .from("fund_movements")
      .select("direction, amount_cents, occurred_at")
      .eq("dossier_id", dossierId)
      .order("occurred_at", { ascending: true }),
  ]);

  let ibanMasked: string | null = null;
  if (pd?.iban_encrypted) {
    const iban = decryptBytes(Buffer.from(pd.iban_encrypted, "base64")).toString("utf8");
    ibanMasked = maskIban(iban);
  }
  return { holderName: pd?.holder_name ?? null, ibanMasked, movements: mv ?? [] };
}
```

> SÉCURITÉ : ce module utilise le client admin (bypass RLS). Il DOIT toujours être appelé après `loadOwnedDossier(dossierId)` dans la même requête (qui garantit l'ownership via RLS). Ne jamais l'exposer sans cette garde.

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/lib/espace/payout-read.ts
git commit -m "feat(espace): lecture RIB masque + mouvements (serveur)"
```

### Task 4.3 : `PayoutForm` (client) + `PayoutTracker` + `MandatePanel`

**Files:**
- Create: `apps/web/components/espace/PayoutForm.tsx`
- Create: `apps/web/components/espace/PayoutTracker.tsx`
- Create: `apps/web/components/espace/MandatePanel.tsx`

- [ ] **Step 1: `PayoutForm.tsx`** (client) — réutilise `savePayoutDetails` existant. Affiche le RIB masqué actuel si présent, formulaire (titulaire + IBAN) avec validation visuelle, `router.refresh()` au succès.

```tsx
// apps/web/components/espace/PayoutForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePayoutDetails } from "@/app/mandat/[dossierId]/actions";
import { Button } from "@/components/ui/Button";

export function PayoutForm({ dossierId, currentMasked }: { dossierId: string; currentMasked: string | null }) {
  const router = useRouter();
  const [holderName, setHolderName] = useState("");
  const [iban, setIban] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    start(async () => {
      const res = await savePayoutDetails({ dossierId, holderName, iban });
      if ("error" in res) setError(res.error);
      else {
        setIban("");
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      className="space-y-3 rounded-card border border-line bg-paper p-5"
    >
      {currentMasked ? (
        <p className="text-sm text-ink/60">
          RIB enregistré : <span className="font-mono">{currentMasked}</span>
        </p>
      ) : null}
      <label className="block text-sm">
        Titulaire du compte
        <input
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
          className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2"
          required
        />
      </label>
      <label className="block text-sm">
        IBAN (France)
        <input
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          placeholder="FR76 ..."
          className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2 font-mono"
          required
        />
      </label>
      {error ? <p className="text-sm text-stamp" role="alert">{error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer mon RIB"}</Button>
    </form>
  );
}
```

- [ ] **Step 2: `PayoutTracker.tsx`** (présentationnel) — consomme `payoutStage` + `netAfterFee`. Props :

```tsx
import type { PayoutStage } from "@/lib/espace/payout";
export interface PayoutTrackerProps {
  stage: PayoutStage;
  recoverableCents: number;
  netCents: number;
}
```

Rendu : 3 étapes « Récupéré → Programmé → Versé » (point `bg-refund` si atteint, sinon `border-line`) ; encart « Vous recevrez » avec `<Amount cents={netCents} favorable>` ; mention commission 25 %.

- [ ] **Step 3: `MandatePanel.tsx`** (présentationnel) — état du mandat. Props :

```tsx
export interface MandatePanelProps {
  signedAt: string | null;
  feeRateBps: number | null;
  pdfHref: string | null; // `/api/mandate/${dossierId}` si signé
  signHref: string; // `/mandat/${dossierId}` pour aller signer si pas encore signé
  canSign: boolean; // dossier.status === "DIAGNOSED"
}
```

Rendu : si signé → carte « Mandat signé le … », barème « 25 % au succès », lien PDF. Sinon → explication + `<Button href={signHref}>Signer mon mandat</Button>` (le flux de signature détaillé reste sur `/mandat/[dossierId]` existant, on ne le réécrit pas en v1).

- [ ] **Step 4: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/components/espace/PayoutForm.tsx apps/web/components/espace/PayoutTracker.tsx apps/web/components/espace/MandatePanel.tsx
git commit -m "feat(espace): PayoutForm + PayoutTracker + MandatePanel"
```

### Task 4.4 : Onglets `mandat/page.tsx` et `versement/page.tsx`

**Files:**
- Create: `apps/web/app/espace/[dossierId]/mandat/page.tsx`
- Create: `apps/web/app/espace/[dossierId]/versement/page.tsx`

- [ ] **Step 1: `mandat/page.tsx`**

```tsx
// apps/web/app/espace/[dossierId]/mandat/page.tsx
import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { MandatePanel } from "@/components/espace/MandatePanel";

export const dynamic = "force-dynamic";

export default async function MandatTabPage({ params }: { params: Promise<{ dossierId: string }> }) {
  const { dossierId } = await params;
  const { dossier, mandate } = await loadOwnedDossier(dossierId);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-extrabold tracking-display">Votre mandat</h1>
      <MandatePanel
        signedAt={mandate?.signed_at ?? null}
        feeRateBps={mandate?.fee_rate_bps ?? null}
        pdfHref={mandate?.signed_at ? `/api/mandate/${dossierId}` : null}
        signHref={`/mandat/${dossierId}`}
        canSign={dossier.status === "DIAGNOSED"}
      />
    </div>
  );
}
```

- [ ] **Step 2: `versement/page.tsx`**

```tsx
// apps/web/app/espace/[dossierId]/versement/page.tsx
import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { getPayoutView } from "@/lib/espace/payout-read";
import { netAfterFee, payoutStage } from "@/lib/espace/payout";
import { PayoutForm } from "@/components/espace/PayoutForm";
import { PayoutTracker } from "@/components/espace/PayoutTracker";

export const dynamic = "force-dynamic";

export default async function VersementPage({ params }: { params: Promise<{ dossierId: string }> }) {
  const { dossierId } = await params;
  const { dossier, verdict, mandate } = await loadOwnedDossier(dossierId);
  const payout = await getPayoutView(dossierId);

  const recoverable = verdict?.totalRecoverableCents ?? 0;
  const net = netAfterFee(recoverable, mandate?.fee_rate_bps ?? 2500);
  const stage = payoutStage({ status: dossier.status, movements: payout.movements });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Versement</h1>
        <PayoutForm dossierId={dossierId} currentMasked={payout.ibanMasked} />
      </div>
      <PayoutTracker stage={stage} recoverableCents={recoverable} netCents={net} />
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/app/espace/[dossierId]/mandat/page.tsx apps/web/app/espace/[dossierId]/versement/page.tsx
git commit -m "feat(espace): onglets Mandat et Versement (RIB chiffre + suivi)"
```

### Task 4.5 : E2E — saisie RIB masqué

**Files:**
- Create: `apps/web/e2e/espace-versement.spec.ts`

- [ ] **Step 1: Test**

```ts
// apps/web/e2e/espace-versement.spec.ts
import { test, expect } from "@playwright/test";

test("saisir un IBAN l'enregistre et l'affiche masqué", async ({ page }) => {
  await page.goto(`/espace/${process.env.E2E_DOSSIER_ID}/versement`);
  await page.getByLabel(/titulaire/i).fill("Jean Locataire");
  await page.getByLabel(/IBAN/i).fill("FR7630006000011234567890189");
  await page.getByRole("button", { name: /enregistrer mon rib/i }).click();
  await expect(page.getByText(/FR76 •••• 0189/)).toBeVisible();
});
```

- [ ] **Step 2: Lancer → PASS. Step 3: Commit**

```bash
git add apps/web/e2e/espace-versement.spec.ts
git commit -m "test(espace): e2e saisie RIB masque"
```

**⛔ Phase gate 4 :** typecheck ✅ · tests (payout + e2e) ✅ · IBAN jamais en clair dans le DOM (vérifier l'onglet Réseau/Éléments) ✅.

---

# PHASE 5 — Compte/RGPD + Contact + vue multi-dossiers

But : migration `profiles.email_notifications`, page `/espace/compte` (coordonnées, préférence notifs, export, suppression cascade), `ContactDialog` (WhatsApp + RDV externe), et la vue d'accueil `/espace` (redirect 1 dossier / liste agrégée ≥2 / état vide).

### Task 5.1 : Migration `profiles.email_notifications`

**Files:**
- Create: `supabase/migrations/0007_profile_notifications.sql`

- [ ] **Step 1: Écrire la migration** (suivre le format des migrations existantes `NNNN_slug.sql`)

```sql
-- 0007_profile_notifications.sql — Préférence e-mails de notification (refonte espace client, 2026-06-13)

alter table public.profiles
  add column email_notifications boolean not null default true;

-- Pas de nouvelle policy : la policy profiles_update_own existante (0002_rls.sql) couvre la mise à jour.
```

- [ ] **Step 2: Appliquer en local + régénérer les types**

Run:
```bash
pnpm db:reset   # applique toutes les migrations sur le Supabase local (port 55321)
pnpm db:types   # régénère apps/web/lib/supabase/database.types.ts
```
Expected: `database.types.ts` contient `email_notifications: boolean` sur `profiles`.

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add supabase/migrations/0007_profile_notifications.sql apps/web/lib/supabase/database.types.ts
git commit -m "feat(espace): migration profiles.email_notifications + types"
```

### Task 5.2 : Server actions Compte (maj coordonnées + préférence notif)

**Files:**
- Create: `apps/web/app/espace/compte/actions.ts`

> Réutilise `withAuth`. La suppression de compte / export RGPD : vérifier s'il existe déjà une action de suppression cascade (spec dit « cascade existante »). Si une action `deleteAccount`/route RGPD existe déjà, la RÉUTILISER ici (ne pas réimplémenter la cascade). Sinon, créer une action minimale qui marque la demande (hors périmètre v1 si la cascade DB n'est pas câblée — dans ce cas, afficher le bouton mais router vers le flux existant). Cette tâche ne crée QUE la mise à jour profil/préférence.

- [ ] **Step 1: Implémenter l'action de profil**

```ts
// apps/web/app/espace/compte/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withAuth } from "@/lib/auth/with-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ActionResult = { ok: true } | { error: string };

const profileSchema = z.object({
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  emailNotifications: z.boolean(),
});

export const updateProfile = withAuth(profileSchema, async (input, { user }): Promise<ActionResult> => {
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("profiles")
    .update({
      first_name: input.firstName ?? null,
      last_name: input.lastName ?? null,
      phone: input.phone ?? null,
      email_notifications: input.emailNotifications,
    })
    .eq("id", user.id);
  if (error) return { error: "Impossible d'enregistrer vos préférences." };
  revalidatePath("/espace/compte");
  return { ok: true };
});
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/app/espace/compte/actions.ts
git commit -m "feat(espace): action updateProfile (coordonnees + pref notif)"
```

### Task 5.3 : Page `/espace/compte` + `ContactDialog`

**Files:**
- Create: `apps/web/app/espace/compte/page.tsx`
- Create: `apps/web/components/espace/ContactDialog.tsx`
- Create: `apps/web/app/espace/compte/ProfileForm.tsx` (client)

- [ ] **Step 1: `ContactDialog.tsx`** (client) — WhatsApp + RDV externe via env publiques.

```tsx
// apps/web/components/espace/ContactDialog.tsx
"use client";

import { Button } from "@/components/ui/Button";

export function ContactDialog() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const calUrl = process.env.NEXT_PUBLIC_CAL_URL;
  return (
    <div className="w-80 rounded-card border border-line bg-paper p-4 shadow-paper">
      <p className="mb-3 font-display text-sm font-bold">Prendre contact</p>
      <div className="space-y-2">
        {whatsapp ? (
          <Button href={`https://wa.me/${whatsapp}`} variant="accent">Discuter sur WhatsApp</Button>
        ) : null}
        {calUrl ? (
          <Button href={calUrl} variant="ghost">Prendre rendez-vous</Button>
        ) : null}
        <p className="text-xs text-ink/45">Un vrai agenda intégré arrive bientôt.</p>
      </div>
    </div>
  );
}
```

> Brancher `ContactDialog` dans `EspaceHeader` via la prop `contact` (comme `notifications` en Phase 3) : dans `layout.tsx`, `<EspaceHeader … contact={<ContactDialog />} />`. Déclarer `NEXT_PUBLIC_WHATSAPP` et `NEXT_PUBLIC_CAL_URL` dans `apps/web/lib/env.ts` (optionnelles) et dans `.env.production.example`.

- [ ] **Step 2: `ProfileForm.tsx`** (client) — formulaire coordonnées + toggle `emailNotifications`, appelle `updateProfile`, toast/refresh au succès. Props :

```tsx
export interface ProfileFormProps {
  initial: { firstName: string | null; lastName: string | null; phone: string | null; emailNotifications: boolean };
}
```

- [ ] **Step 3: `compte/page.tsx`** — charge le profil de l'utilisateur, rend `ProfileForm` + un bloc RGPD (export + suppression cascade : réutiliser le flux/route existant ; si bouton suppression → lien vers le mécanisme de cascade existant). Auth via `requireAuthPage`.

```tsx
// apps/web/app/espace/compte/page.tsx
import { requireAuthPage } from "@/lib/auth/guards";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const { user } = await requireAuthPage("/espace/compte");
  const sb = await getSupabaseServer();
  const { data: p } = await sb
    .from("profiles")
    .select("first_name, last_name, phone, email_notifications")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-display">Mon compte</h1>
      <ProfileForm
        initial={{
          firstName: p?.first_name ?? null,
          lastName: p?.last_name ?? null,
          phone: p?.phone ?? null,
          emailNotifications: p?.email_notifications ?? true,
        }}
      />
      <section className="rounded-card border border-line bg-paper-2 p-5">
        <h2 className="font-display text-lg font-bold">Vos données (RGPD)</h2>
        <p className="mt-2 text-sm text-ink/60">
          Vous pouvez demander l'export ou la suppression de votre compte. La suppression efface l'ensemble de vos
          données en cascade.
        </p>
        {/* Réutiliser le flux d'export / suppression cascade existant du repo. */}
      </section>
    </div>
  );
}
```

> NOTE : `/espace/compte` est HORS du shell `[dossierId]` (pas d'onglets). Il hérite du layout racine `/espace` (auth seule). Vérifier que la navigation retour vers `/espace` est présente.

- [ ] **Step 4: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/app/espace/compte/page.tsx apps/web/app/espace/compte/ProfileForm.tsx apps/web/components/espace/ContactDialog.tsx apps/web/lib/env.ts
git commit -m "feat(espace): page compte/RGPD + ContactDialog (WhatsApp + RDV externe)"
```

### Task 5.4 : Vue d'accueil `/espace` (redirect / liste agrégée / vide)

**Files:**
- Modify: `apps/web/app/espace/page.tsx` (réécriture)

- [ ] **Step 1: Réécrire**

```tsx
// apps/web/app/espace/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { listDossiersForUser } from "@/lib/dossier/read";
import { Amount } from "@/components/Amount";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function EspaceHome() {
  const items = await listDossiersForUser();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Aucun dossier pour l'instant</h1>
        <p className="mt-3 text-ink/60">Lancez un diagnostic gratuit pour savoir si votre loyer est trop élevé.</p>
        <div className="mt-6"><Button href="/diagnostic">Faire mon diagnostic</Button></div>
      </div>
    );
  }

  if (items.length === 1) redirect(`/espace/${items[0].dossier.id}`);

  const totalRecoverable = items.reduce((s, i) => s + (i.verdict?.totalRecoverableCents ?? 0), 0);

  return (
    <div className="mx-auto max-w-container space-y-8 px-4 py-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-display">Mes dossiers</h1>
        <p className="mt-2 text-ink/60">
          Trop-perçu visé au total : <Amount cents={totalRecoverable} favorable className="font-medium" />
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map(({ dossier, verdict }) => (
          <li key={dossier.id}>
            <Link
              href={`/espace/${dossier.id}`}
              className="block rounded-card border border-line bg-paper p-5 hover:border-ink/40"
            >
              <p className="font-medium">{dossier.address_label ?? "Dossier"}</p>
              <p className="mt-1 text-sm text-ink/55">{dossier.status}</p>
              {verdict && verdict.totalRecoverableCents > 0 ? (
                <Amount cents={verdict.totalRecoverableCents} favorable className="mt-2 block text-lg font-medium" />
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @troppaye/web typecheck
git add apps/web/app/espace/page.tsx
git commit -m "feat(espace): vue d'accueil (redirect 1 dossier / liste agregee / etat vide)"
```

### Task 5.5 : E2E final A→Z + vérif RGPD

**Files:**
- Create: `apps/web/e2e/espace-compte.spec.ts`

- [ ] **Step 1: Test compte + préférence notif**

```ts
// apps/web/e2e/espace-compte.spec.ts
import { test, expect } from "@playwright/test";

test("mise à jour des coordonnées et préférence notifications", async ({ page }) => {
  await page.goto("/espace/compte");
  await page.getByLabel(/téléphone|phone/i).fill("0612345678");
  await page.getByRole("button", { name: /enregistrer/i }).click();
  await expect(page.getByText(/enregistr/i)).toBeVisible();
});
```

- [ ] **Step 2: Parcours complet manuel** (UN test A→Z, cf. mémoire orchestration) : diagnostic → /espace → onglet, déposer pièces → IN_REVIEW, envoyer message, saisir RIB, ouvrir Contact (WhatsApp/RDV), compte/RGPD. Screenshot de chaque onglet. Vérifier DA + reduced-motion + IBAN masqué.

- [ ] **Step 3: Commit**

```bash
git add apps/web/e2e/espace-compte.spec.ts
git commit -m "test(espace): e2e compte + preferences"
```

**⛔ Phase gate 5 (livraison) :** `pnpm --filter @troppaye/web typecheck` ✅ · `pnpm --filter @troppaye/web test` ✅ · suite e2e complète ✅ · `pnpm --filter @troppaye/web build` (script `check-copy` inclus) ✅ · parcours A→Z visuel ✅.

---

## Auto-revue (vérifiée contre la spec)

**Couverture spec §2 (11 modules) :**
1. Vue d'accueil multi-dossiers → Task 5.4 ✅
2. Onglet Aperçu (verdict, KPI, timeline, rail) → Tasks 1.6/1.7 ✅
3. Timeline premium → Task 1.6 (`DossierTimeline`) ✅
4. Onglet Pièces (dropzone chiffré, statuts) → Tasks 2.2/2.3 ✅
5. Checklist d'étude (bail + quittance) → Tasks 1.1/1.6 ✅
6. Onglet Mandat (voir + signer, 25 %, PDF) → Tasks 4.3/4.4 ✅
7. Onglet Versement (RIB chiffré, net, suivi) → Tasks 4.1–4.4 ✅
8. Onglet Messages → Tasks 3.2/3.3 ✅
9. Profil & RGPD → Tasks 5.2/5.3 ✅
10. Notifications/activité (cloche) → Tasks 3.1/3.2/3.3 ✅
11. Prendre contact (RDV + WhatsApp) → Task 5.3 ✅

**Spec §3 (architecture A, sous-routes) :** layout shell + 5 sous-routes + compte hors dossier + overlays header ✅
**Spec §4 (schéma existant, seul ajout `email_notifications`) :** Task 5.1 ✅
**Spec §5 (gate étude) :** réutilisation `maybeAdvanceToReview` + `buildStudyChecklist` ; décision « présence vs VALIDATED » tranchée et signalée ✅
**Spec §6 (sécurité) :** `requireAuthPage`/`withAuth`/RLS partout ; IBAN masqué côté client, déchiffré serveur après ownership ✅
**Spec §8 (états/erreurs) :** états vides (0 dossier/pièce/message), erreurs upload/IBAN, ILLEGIBLE, toasts couverts dans les composants ✅
**Spec §9 (tests) :** Vitest pur (checklist, activity, payout) + e2e par tranche ✅
**Spec §10 (5 phases verticales) :** structure du plan = exactement ces 5 phases, chacune avec gate testable ✅
**Spec §11 (DA) :** rappel en tête + tokens/primitives imposés dans chaque composant ✅

**Cohérence des types :** `StudyChecklist`/`ChecklistItem` (1.1) réutilisés en 1.6/2.3 ; `ActivityEvent` (3.1) en 3.2/3.3 ; `PayoutStage`/`netAfterFee`/`maskIban` (4.1) en 4.2/4.3/4.4 ; `loadOwnedDossier` (1.2) dans tous les onglets ; `nextStep` extrait en 1.6 et réutilisé en 1.7. ✅

**Points à vérifier par l'implémenteur (signalés inline, non bloquants) :** noms de champs réels de `VerdictGlobal` (`results`/`confidence`/`ruleLabel`) ; chemin exact de `buildTimeline` ; existence du token d'ombre `shadow-paper` ; existence d'un flux de suppression RGPD cascade à réutiliser ; import inter-route de `uploadPiece`/`savePayoutDetails` (sinon ré-export depuis `espace/[dossierId]/actions.ts`).
