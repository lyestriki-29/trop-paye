# Tunnel diagnostic — Phase A (dévoilement guidé + DA nb) — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le stepper + la variante une-page du questionnaire par un **tunnel à dévoilement guidé** habillé en néubrutalisme, en réduisant la saisie clavier, sans changer le contrat `buildPayload`/zod/Server Action ni le moteur.

**Architecture:** Un **graphe de questions** déclaratif (chapitres → questions atomiques) pilote un **moteur de dévoilement** : l'état (question active, blocs confirmés, progression) est dérivé du `draft` + d'un curseur `activeId`. Les fonctions de dérivation sont **pures et testées** ; la validité de soumission **réutilise les `*Valid` existants** (non-régression garantie). Les champs sont restylés `.nb`. La cascade DPE pré-remplit surface + époque dès l'adresse.

**Tech Stack:** Next 16 (App Router, client components), TypeScript strict, Tailwind + scope CSS `.nb`, `motion/react`, Vitest. Spec : `docs/superpowers/specs/2026-06-14-refonte-tunnel-diagnostic-nb-design.md`.

---

## Contraintes permanentes (à respecter à chaque tâche)

- **Jamais de `any`** ; path aliases `@/...`. Fichiers ≤ ~200 lignes.
- `pnpm typecheck` ET `pnpm test` doivent rester verts après chaque tâche.
- Copy-deck §2 **verbatim** ; micro-copy neuve = commentaire `TODO_COPY` ; valeurs = `TODO_VERIFIER`.
- `prefers-reduced-motion` respecté sur toute animation.
- Commits ciblés (un par tâche), préfixe `feat(diagnostic):` / `refactor(diagnostic):` / `test(diagnostic):`.

## File Structure

**Créés :**
- `apps/web/app/diagnostic/questionnaire/question-graph.ts` — types `Question`/`Chapter`, le graphe, `canSubmit`.
- `apps/web/app/diagnostic/questionnaire/reveal-state.ts` — fns pures de dévoilement.
- `apps/web/app/diagnostic/questionnaire/reveal-state.test.ts`
- `apps/web/app/diagnostic/questionnaire/progress.ts` — `progress(graph, draft)`.
- `apps/web/app/diagnostic/questionnaire/progress.test.ts`
- `apps/web/app/diagnostic/questionnaire/GuidedTunnel.tsx` — orchestrateur (remplace `Questionnaire.tsx`).
- `apps/web/app/diagnostic/questionnaire/ui/ChapterRail.tsx`
- `apps/web/app/diagnostic/questionnaire/ui/ConfirmedBlock.tsx`
- `apps/web/app/diagnostic/questionnaire/ui/ActiveQuestion.tsx`
- `apps/web/app/diagnostic/questionnaire/ui/AnticipationBar.tsx`
- `apps/web/app/diagnostic/questionnaire/questions/*.tsx` — render fns atomiques par chapitre.
- `packages/rules-engine/src/construction.ts` (+ test) — `constructionPeriodFromYear`.

**Modifiés :**
- `apps/web/app/diagnostic/page.tsx` — retire `?vue=page`, enveloppe `.nb`, rend `GuidedTunnel`.
- `apps/web/app/diagnostic/questionnaire/fields.tsx` — habillage nb (API inchangée).
- `apps/web/app/diagnostic/questionnaire/use-diagnostic-form.ts` — `stepIndex` → `activeId` persisté.

**Supprimés (convergence — fin de tâche 11) :**
- `Questionnaire.tsx`, `QuestionnaireOnePage.tsx`, `tunnel-steps.ts`,
  `steps/HousingDpeStep.tsx`, `steps/LeaseDetailsStep.tsx` (wrappers de fusion remplacés par le graphe).

---

## Task 1: Classes CSS nb pour les champs

**Files:** Modify `apps/web/app/globals.css` (ajout sous le scope `.nb`, après les classes existantes `.nb-card`).

- [ ] **Step 1 : Ajouter les classes**. Coller dans `globals.css`, dans la zone scopée `.nb` :

```css
/* ── Tunnel diagnostic : champs nb (Phase A) ───────────────────────────── */
.nb-field {
  width: 100%;
  border: 2px solid rgb(var(--color-nb-ink));
  background: rgb(var(--color-paper));
  box-shadow: 3px 3px 0 rgb(var(--color-nb-ink));
  padding: 11px 14px;
  font-size: 15px;
  color: rgb(var(--color-nb-ink));
}
.nb-field:focus-visible { outline: 3px solid rgb(var(--color-accent)); outline-offset: 1px; }
.nb-pill {
  border: 2px solid rgb(var(--color-nb-ink));
  background: rgb(var(--color-paper));
  box-shadow: 3px 3px 0 rgb(var(--color-nb-ink));
  padding: 9px 18px; font-weight: 700; font-size: 14px;
  transition: transform .08s ease;
}
.nb-pill[aria-pressed="true"] { background: rgb(var(--color-accent)); }
.nb-pill--dashed { border-style: dashed; box-shadow: none; font-weight: 600; }
.nb-confirmed {
  border: 2px solid rgb(var(--color-nb-ink));
  background: rgb(var(--color-paper));
  box-shadow: 3px 3px 0 rgb(var(--color-nb-ink));
}
.nb-confirmed--prefill { background: #eafaf2; }
.nb-ghost { border: 2px dashed rgb(var(--color-nb-ink) / 0.4); }
@media (prefers-reduced-motion: reduce) { .nb-pill { transition: none; } }
```

- [ ] **Step 2 : Vérifier le build CSS.** Run: `pnpm --filter web typecheck` (pas d'erreur attendue ; CSS non typé mais on s'assure que rien ne casse). Charger `/design-lab/neubrutalist` plus tard pour l'œil.
- [ ] **Step 3 : Commit.**
```bash
git add apps/web/app/globals.css
git commit -m "feat(diagnostic): classes nb champs (field, pill, confirmed, ghost)"
```

## Task 2: Restyle `fields.tsx` en nb (API inchangée)

Les primitives gardent EXACTEMENT leur signature (aucun appelant ne change). Seules les classes Tailwind deviennent nb. `ChoiceField` → `.nb-pill`. Les inputs passent par `components/ui/Field` ; on lui ajoute une prop `variant?: "nb"` OU on remplace son `inputClassName`. **Décision : ajouter `inputClassName="nb-field"`** aux appels internes de `fields.tsx` (Text/Money/Date) et restyler `ChoiceField`/`MonthYearField` directement.

**Files:** Modify `apps/web/app/diagnostic/questionnaire/fields.tsx`. Lire `apps/web/components/ui/Field.tsx` d'abord pour confirmer `inputClassName` est bien appliqué (il l'est : `MoneyField` l'utilise déjà).

- [ ] **Step 1 : `ChoiceField`** — remplacer le `className` du bouton par la version nb :
```tsx
className={`nb-pill ${c.value === value ? "" : ""} ${
  c.label.toLowerCase().includes("je ne sais") ? "nb-pill--dashed" : ""
} focus-visible:outline-none`}
```
(garder `aria-pressed={active}` ; l'état actif est porté par `.nb-pill[aria-pressed="true"]`).

- [ ] **Step 2 : Text/Money/Date** — ajouter `inputClassName="nb-field font-mono tabular"` (mono pour Money/Date, `nb-field` seul pour Text non-mono). `MonthYearField` : remplacer `SELECT_CLS` par `"nb-field"`.

- [ ] **Step 3 : Vérifier la non-régression.** Run: `pnpm test -- fields` si un test existe, sinon `pnpm --filter web typecheck`. Expected: PASS (aucune signature changée).

- [ ] **Step 4 : Commit.**
```bash
git add apps/web/app/diagnostic/questionnaire/fields.tsx
git commit -m "feat(diagnostic): habillage nb des primitives de champ"
```

## Task 3: Helper pur `constructionPeriodFromYear` (cascade DPE)

**Files:** Create `packages/rules-engine/src/construction.ts`, `packages/rules-engine/src/construction.test.ts`. Exporter depuis `packages/rules-engine/src/index.ts`.

- [ ] **Step 1 : Test (échoue).**
```ts
import { describe, it, expect } from "vitest";
import { constructionPeriodFromYear } from "./construction";

describe("constructionPeriodFromYear", () => {
  it("mappe les bornes", () => {
    expect(constructionPeriodFromYear(1900)).toBe("BEFORE_1946");
    expect(constructionPeriodFromYear(1945)).toBe("BEFORE_1946");
    expect(constructionPeriodFromYear(1946)).toBe("1946_1970");
    expect(constructionPeriodFromYear(1970)).toBe("1946_1970");
    expect(constructionPeriodFromYear(1971)).toBe("1971_1990");
    expect(constructionPeriodFromYear(1990)).toBe("1971_1990");
    expect(constructionPeriodFromYear(1991)).toBe("AFTER_1990");
    expect(constructionPeriodFromYear(2015)).toBe("AFTER_1990");
  });
  it("rejette l'invalide", () => {
    expect(constructionPeriodFromYear(undefined)).toBeUndefined();
    expect(constructionPeriodFromYear(0)).toBeUndefined();
    expect(constructionPeriodFromYear(3000)).toBeUndefined();
  });
});
```
- [ ] **Step 2 : Run** `pnpm --filter @troppaye/rules-engine test -- construction` → FAIL (module absent).
- [ ] **Step 3 : Implémentation.**
```ts
import type { ConstructionPeriod } from "./index";

/** Mappe une année de construction (ex. DPE ADEME) vers la fourchette d'encadrement.
 *  Retourne undefined si l'année est absente ou hors plage plausible (1700–année courante+1). */
export function constructionPeriodFromYear(year: number | undefined): ConstructionPeriod | undefined {
  if (year === undefined || !Number.isInteger(year) || year < 1700 || year > 2100) return undefined;
  if (year < 1946) return "BEFORE_1946";
  if (year <= 1970) return "1946_1970";
  if (year <= 1990) return "1971_1990";
  return "AFTER_1990";
}
```
- [ ] **Step 4 : Run** le test → PASS. Puis `pnpm test` complet → 76 (+nouveaux) verts.
- [ ] **Step 5 : Commit.**
```bash
git add packages/rules-engine/src/construction.ts packages/rules-engine/src/construction.test.ts packages/rules-engine/src/index.ts
git commit -m "feat(rules-engine): constructionPeriodFromYear pour cascade DPE"
```

## Task 4: Types du graphe + `canSubmit`

**Files:** Create `apps/web/app/diagnostic/questionnaire/question-graph.ts` (types + `canSubmit` d'abord ; le graphe complet en Task 8).

- [ ] **Step 1 : Types + canSubmit.**
```ts
import type { ReactNode } from "react";
import type { DiagnosticDraft, StepProps } from "./use-diagnostic-form";
import { addressValid } from "./steps/AddressStep";
import { housingValid } from "./steps/HousingStep";
import { dpeValid } from "./steps/DpeStep";
import { rentValid } from "./steps/RentStep";
import { revisionHistoryValid } from "./steps/RevisionHistoryStep";

export type ChapterId = "address" | "housing" | "rent" | "lease" | "recap";

export interface Question {
  id: string;
  chapter: ChapterId;
  /** Rendu du champ actif (réutilise les primitives/render fns). */
  render: (p: StepProps) => ReactNode;
  /** Répond-on à cette question ? Pilote repli + dévoilement (PAS la validité de submit). */
  isAnswered: (d: DiagnosticDraft) => boolean;
  /** La question s'applique-t-elle ? (ex. tenantCount seulement si coloc). */
  revealWhen?: (d: DiagnosticDraft) => boolean;
  /** Pilule/choix unique → avance auto ; champ libre → bouton « Continuer ». */
  autoAdvance?: boolean;
  /** Facultative : peut être « passée » sans être answered. */
  optional?: boolean;
  /** Texte du bloc confirmé replié. */
  summary: (d: DiagnosticDraft) => string;
  /** Bloc pré-rempli (cascade DPE, barème) → style vert + libellé « à vérifier ». */
  prefilled?: (d: DiagnosticDraft) => boolean;
}

export interface Chapter { id: ChapterId; title: string; }

export const CHAPTERS: Chapter[] = [
  { id: "address", title: "Adresse" },
  { id: "housing", title: "Logement" },
  { id: "rent", title: "Loyer" },
  { id: "lease", title: "Bail" },
  { id: "recap", title: "Récap" },
];

/** Gate de soumission = EXACTEMENT l'ancien `STEPS.every(s => s.valid)`.
 *  Réutilise les validateurs existants → non-régression garantie. */
export function canSubmit(d: DiagnosticDraft): boolean {
  return (
    addressValid(d) &&
    housingValid(d) &&
    dpeValid(d) &&
    rentValid(d) &&
    revisionHistoryValid(d)
  );
  // leaseValid/revisionValid/recapValid retournent toujours true (facultatifs) → omis.
}
```
- [ ] **Step 2 : Run** `pnpm --filter web typecheck` → PASS.
- [ ] **Step 3 : Commit** (le graphe `QUESTIONS` arrive en Task 8 ; ici types + canSubmit seuls).
```bash
git add apps/web/app/diagnostic/questionnaire/question-graph.ts
git commit -m "feat(diagnostic): types graphe de questions + canSubmit (reuse validators)"
```

## Task 5: `reveal-state.ts` (pur, TDD)

**Files:** Create `reveal-state.ts` + `reveal-state.test.ts`.

Sémantique : le dévoilement est dérivé de `(QUESTIONS, draft, activeId)`. `activeId` est un curseur UI (persisté).

- [ ] **Step 1 : Test (échoue).** Utiliser un mini-graphe de test (3 questions, une conditionnelle) :
```ts
import { describe, it, expect } from "vitest";
import { applicableQuestions, firstUnansweredId, nextQuestionId, revealOrder } from "./reveal-state";
import type { Question } from "./question-graph";
import type { DiagnosticDraft } from "./use-diagnostic-form";

const Q = (over: Partial<Question> & Pick<Question, "id">): Question => ({
  chapter: "housing", render: () => null, isAnswered: () => false,
  summary: () => "", ...over,
});
const G: Question[] = [
  Q({ id: "a", isAnswered: (d) => !!d.surfaceM2 }),
  Q({ id: "b", isAnswered: (d) => d.isShared !== undefined }),
  Q({ id: "c", isAnswered: (d) => !!d.tenantCount, revealWhen: (d) => d.isShared === true }),
];
const base: DiagnosticDraft = { revisions: [] };

describe("reveal-state", () => {
  it("filtre par revealWhen", () => {
    expect(applicableQuestions(G, base).map((q) => q.id)).toEqual(["a", "b"]);
    expect(applicableQuestions(G, { ...base, isShared: true }).map((q) => q.id)).toEqual(["a", "b", "c"]);
  });
  it("première question non répondue", () => {
    expect(firstUnansweredId(G, base)).toBe("a");
    expect(firstUnansweredId(G, { ...base, surfaceM2: 38 })).toBe("b");
  });
  it("question suivante applicable", () => {
    expect(nextQuestionId(G, { ...base, isShared: true }, "b")).toBe("c");
    expect(nextQuestionId(G, base, "b")).toBeNull();
  });
  it("revealOrder : confirmées jusqu'à l'active incluse", () => {
    const d = { ...base, surfaceM2: 38 };
    expect(revealOrder(G, d, "b").map((q) => q.id)).toEqual(["a", "b"]);
  });
});
```
- [ ] **Step 2 : Run** → FAIL (module absent).
- [ ] **Step 3 : Implémentation.**
```ts
import type { DiagnosticDraft } from "./use-diagnostic-form";
import type { Question } from "./question-graph";

const applies = (q: Question, d: DiagnosticDraft) => !q.revealWhen || q.revealWhen(d);

export function applicableQuestions(graph: Question[], d: DiagnosticDraft): Question[] {
  return graph.filter((q) => applies(q, d));
}
export function firstUnansweredId(graph: Question[], d: DiagnosticDraft): string | null {
  return applicableQuestions(graph, d).find((q) => !q.isAnswered(d))?.id ?? null;
}
export function nextQuestionId(graph: Question[], d: DiagnosticDraft, currentId: string): string | null {
  const app = applicableQuestions(graph, d);
  const i = app.findIndex((q) => q.id === currentId);
  return i >= 0 && i + 1 < app.length ? app[i + 1]!.id : null;
}
/** Blocs à afficher : toutes les applicables jusqu'à `activeId` inclus
 *  (les précédentes = confirmées repliées, la dernière = active). */
export function revealOrder(graph: Question[], d: DiagnosticDraft, activeId: string | null): Question[] {
  const app = applicableQuestions(graph, d);
  if (activeId === null) return app; // tout répondu → tout confirmé (récap)
  const i = app.findIndex((q) => q.id === activeId);
  return i >= 0 ? app.slice(0, i + 1) : app.slice(0, 1);
}
/** Chapitre : done si toutes ses questions applicables sont répondues. */
export function chapterStatus(
  graph: Question[], d: DiagnosticDraft, chapter: string, activeId: string | null,
): "done" | "current" | "todo" {
  const qs = applicableQuestions(graph, d).filter((q) => q.chapter === chapter);
  if (qs.length === 0) return "todo";
  if (qs.every((q) => q.isAnswered(d))) return "done";
  const activeChapter = graph.find((q) => q.id === activeId)?.chapter;
  return activeChapter === chapter ? "current" : "todo";
}
```
- [ ] **Step 4 : Run** → PASS. `pnpm test` complet vert.
- [ ] **Step 5 : Commit.**
```bash
git add apps/web/app/diagnostic/questionnaire/reveal-state.ts apps/web/app/diagnostic/questionnaire/reveal-state.test.ts
git commit -m "feat(diagnostic): reveal-state pur (applicable, next, revealOrder, chapterStatus)"
```

## Task 6: `progress.ts` (pur, TDD)

**Files:** Create `progress.ts` + `progress.test.ts`.

- [ ] **Step 1 : Test (échoue).**
```ts
import { describe, it, expect } from "vitest";
import { progress } from "./progress";
// réutilise le mini-graphe G du test reveal-state (copier la fabrique Q ici).
```
Assertions : 0 répondu → 0 ; toutes applicables répondues → 1 ; conditionnelle non applicable non comptée.

- [ ] **Step 2 : Run** → FAIL.
- [ ] **Step 3 : Implémentation.**
```ts
import type { DiagnosticDraft } from "./use-diagnostic-form";
import type { Question } from "./question-graph";
import { applicableQuestions } from "./reveal-state";

/** Fraction [0..1] de questions applicables (hors optionnelles non engagées) répondues.
 *  Alimente la jauge d'anticipation NON monétaire. */
export function progress(graph: Question[], d: DiagnosticDraft): number {
  const app = applicableQuestions(graph, d).filter((q) => !q.optional);
  if (app.length === 0) return 0;
  return app.filter((q) => q.isAnswered(d)).length / app.length;
}
```
- [ ] **Step 4 : Run** → PASS.
- [ ] **Step 5 : Commit.**
```bash
git add apps/web/app/diagnostic/questionnaire/progress.ts apps/web/app/diagnostic/questionnaire/progress.test.ts
git commit -m "feat(diagnostic): progress(draft) pour la jauge d'anticipation"
```

## Task 7: Render fns atomiques par chapitre

Chaque question reçoit une render fn courte. **Réutiliser les primitives `fields.tsx`** ; réimplémenter uniquement la logique `onChange` (copiée des steps lus). Un fichier par chapitre pour rester < ~200 lignes.

**Files:** Create `questions/address.tsx`, `questions/housing.tsx`, `questions/dpe.tsx`, `questions/rent.tsx`, `questions/lease.tsx`, `questions/recap.tsx`.

Détails non triviaux à coder (le reste = copie directe des `onChange` des steps déjà lus) :

- [ ] **Step 1 : `questions/housing.tsx` — stepper colocataires** (levier 2). Nouveau composant :
```tsx
"use client";
import type { StepProps } from "../use-diagnostic-form";
const TENANTS = [2, 3, 4, 5, 6] as const; // 6 = « 6 et + »
export function TenantCountQ({ draft, setField }: StepProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Nombre de colocataires">
      {TENANTS.map((n) => (
        <button key={n} type="button" className="nb-pill"
          aria-pressed={draft.tenantCount === n}
          onClick={() => setField("tenantCount", n)}>
          {n === 6 ? "6 et +" : n}
        </button>
      ))}
    </div>
  );
}
```
  Les autres render fns housing (`FurnishedQ`, `RoomsQ`) = extraction directe des `ChoiceField` de `HousingStep` (copier le bloc + son `onChange`). `SurfaceConfirmQ`/`ConstructionConfirmQ` : rendent un `TextField`/`ChoiceField` pré-rempli (la valeur vient de la cascade DPE, éditable).

- [ ] **Step 2 : `questions/dpe.tsx` — cascade pré-remplissage** (levier 1). Au montage du chapitre logement, si `draft.address` et DPE pas encore tenté, déclencher `lookupDpeAction({label})` ; sur succès à 1 résultat → auto-`pick` ; sur succès multi → afficher `DpeSearchResults` (réutilisé) ; sur `pick`, en plus de `setField("dpe", …)`, **pré-remplir** :
```tsx
if (d.surfaceM2 && draft.surfaceM2 === undefined) setField("surfaceM2", d.surfaceM2);
const cp = constructionPeriodFromYear(d.anneeConstruction);
if (cp && draft.constructionPeriod === undefined && !draft.constructionPeriodUnknown) {
  setField("constructionPeriod", cp);
}
```
  Réutiliser le reste de `DpeStep` (recherche par numéro, saisie manuelle, « je ne connais pas »).

- [ ] **Step 3 : `questions/rent.tsx` — raccourci « jamais augmenté »** (levier 3) :
```tsx
// sous le champ « loyer actuel », avant « loyer de départ » :
<button type="button" className="nb-pill nb-pill--dashed"
  aria-pressed={draft.initialRentCents !== undefined && draft.initialRentCents === draft.currentRentCents}
  onClick={() => setField("initialRentCents", draft.currentRentCents)}>
  Identique — jamais augmenté
</button>
```
  Les autres render fns rent (mode HC/CC, charges, dépôt pilules, complément + 3DS) = extraction directe de `RentStep` (déjà tap-based).

- [ ] **Step 4 : `questions/lease.tsx` — trimestre pré-sélectionné** (levier 2). Dans la render fn « clause de révision », initialiser `revisionQuarter` à `quarterFromMonthISO(leaseSignedAt)` si absent (sans écraser un choix utilisateur), `revisionQuarterUnknown` par défaut. Hausses : voir Task 12 (chip IRL) ; en attendant, réutiliser `AnniversaryRows`/`FreeRows`.

- [ ] **Step 5 : `questions/address.tsx`, `questions/recap.tsx`** = réutilisation directe d'`AddressStep` (render) et synthèse (liste de `ConfirmedBlock`).

- [ ] **Step 6 : Run** `pnpm --filter web typecheck` → PASS (les render fns sont typées `StepProps`).
- [ ] **Step 7 : Commit.**
```bash
git add apps/web/app/diagnostic/questionnaire/questions/
git commit -m "feat(diagnostic): render fns atomiques (stepper coloc, cascade DPE, raccourcis)"
```

## Task 8: Peupler `question-graph.ts`

**Files:** Modify `question-graph.ts` — ajouter `export const QUESTIONS: Question[]`.

- [ ] **Step 1 : Écrire le graphe complet.** Une entrée par question, dans l'ordre des chapitres (Adresse → Logement → Loyer → Bail → Récap). Chaque entrée : `id`, `chapter`, `render` (de Task 7), `isAnswered`, `revealWhen` (pour les conditionnelles : `tenantCount`/`rentBasis` si `isShared` ; `chargesCents` si CC ; complément détails si `rentSupplement==="OUI"`), `autoAdvance` (true pour pilules, false pour champs montant), `optional` (dépôt, hausses, complément-non), `summary`, `prefilled` (surface/époque issues du DPE). Exemple d'entrées :
```ts
export const QUESTIONS: Question[] = [
  { id: "address", chapter: "address", render: AddressQ, autoAdvance: true,
    isAnswered: (d) => (d.address?.label?.length ?? 0) >= 3,
    summary: (d) => d.address?.label ?? "" },
  { id: "dpe", chapter: "housing", render: DpeQ, autoAdvance: true,
    isAnswered: (d) => d.dpe != null || d.dpeUnknown === true,
    prefilled: (d) => d.dpe?.source === "ADEME_API",
    summary: (d) => d.dpeUnknown ? "DPE inconnu" : d.dpe ? `DPE ${d.dpe.class}` : "" },
  { id: "surface", chapter: "housing", render: SurfaceConfirmQ, autoAdvance: false, optional: true,
    isAnswered: (d) => d.surfaceM2 !== undefined,
    prefilled: (d) => d.dpe?.source === "ADEME_API" && d.surfaceM2 !== undefined,
    summary: (d) => d.surfaceM2 ? `${d.surfaceM2} m²` : "Surface non précisée" },
  { id: "furnished", chapter: "housing", render: FurnishedQ, autoAdvance: true,
    isAnswered: (d) => d.furnished !== undefined,
    summary: (d) => d.furnished ? "Meublé" : "Non meublé" },
  { id: "rooms", chapter: "housing", render: RoomsQ, autoAdvance: true,
    isAnswered: (d) => d.roomCount !== undefined || d.roomCountUnknown === true,
    summary: (d) => d.roomCountUnknown ? "Pièces : ?" : `${d.roomCount} pièce(s)` },
  { id: "construction", chapter: "housing", render: ConstructionConfirmQ, autoAdvance: true,
    isAnswered: (d) => d.constructionPeriod !== undefined || d.constructionPeriodUnknown === true,
    prefilled: (d) => d.dpe?.source === "ADEME_API" && d.constructionPeriod !== undefined,
    summary: (d) => /* libellé fourchette */ "" },
  { id: "shared", chapter: "housing", render: ColocQ, autoAdvance: true,
    isAnswered: (d) => d.isShared !== undefined,
    summary: (d) => d.isShared ? "Colocation" : "Pas de colocation" },
  { id: "tenantCount", chapter: "housing", render: TenantCountQ, autoAdvance: true,
    revealWhen: (d) => d.isShared === true,
    isAnswered: (d) => d.tenantCount !== undefined,
    summary: (d) => `${d.tenantCount} colocataires` },
  // … rent (rentBasis revealWhen isShared, mode, currentRent, initialRent, charges revealWhen CC,
  //     deposit optional, supplement, supplement-details revealWhen OUI) …
  // … lease (leaseSignedAt, revisionClause+quarter, hausses optional) …
  { id: "recap", chapter: "recap", render: RecapQ, autoAdvance: false,
    isAnswered: () => false, // jamais « répondu » : c'est l'écran final
    summary: () => "" },
];
```
  ⚠️ Couvrir TOUS les champs de la cartographie spec §4.5 (filet : `buildPayload` inchangé). `recap.isAnswered` = `false` pour qu'il reste l'actif terminal ; le bouton submit est gaté par `canSubmit`.

- [ ] **Step 2 : Run** `pnpm --filter web typecheck` → PASS.
- [ ] **Step 3 : Test de complétude** (`question-graph.test.ts`) : pour un draft « tout rempli » réaliste, `canSubmit` est `true` et `firstUnansweredId(QUESTIONS, draft) === "recap"`. Run → PASS.
- [ ] **Step 4 : Commit.**
```bash
git add apps/web/app/diagnostic/questionnaire/question-graph.ts apps/web/app/diagnostic/questionnaire/question-graph.test.ts
git commit -m "feat(diagnostic): graphe de questions complet + test de complétude"
```

## Task 9: Composants de présentation

**Files:** Create `ui/ChapterRail.tsx`, `ui/ConfirmedBlock.tsx`, `ui/ActiveQuestion.tsx`, `ui/AnticipationBar.tsx`. Référence visuelle : `flux-mecanique-v2.html`.

- [ ] **Step 1 : `ConfirmedBlock`** — bloc replié `.nb-confirmed` (+ `--prefill` si `prefilled`), libellé `summary`, bouton ✏️ → `onEdit`. Props : `{ label, value, prefilled?, onEdit }`.
- [ ] **Step 2 : `ActiveQuestion`** — carte active jaune, kicker chapitre, titre question, aide, `children` (le `render`), + bouton « Continuer » si `!autoAdvance`. Animation entrée fade+translate gardée par `useReducedMotion`.
- [ ] **Step 3 : `ChapterRail`** — 5 chapitres, état `done/current/todo` via `chapterStatus`, classes `.nb`.
- [ ] **Step 4 : `AnticipationBar`** — jauge `.nb` + « Plus que ~N infos avant votre estimation » (N = nb questions applicables non répondues). **Aucun €.**
- [ ] **Step 5 : Run** `pnpm --filter web typecheck` → PASS.
- [ ] **Step 6 : Commit.**
```bash
git add apps/web/app/diagnostic/questionnaire/ui/
git commit -m "feat(diagnostic): composants nb du tunnel (rail, confirmé, actif, anticipation)"
```

## Task 10: Orchestrateur `GuidedTunnel.tsx`

**Files:** Create `GuidedTunnel.tsx`. Modify `use-diagnostic-form.ts` (`stepIndex` → `activeId`).

- [ ] **Step 1 : Hook** — remplacer `stepIndex`/`setStepIndex` par `activeId: string | null` / `setActiveId`, persisté sous `tp_diagnostic_active_v1`. À l'hydratation, si brouillon : `activeId = firstUnansweredId(QUESTIONS, draft)`.
- [ ] **Step 2 : `GuidedTunnel`** — assemble : `TunnelHeader` (logo + « Étape X sur 5 » via `chapterStatus`), `ChapterRail`, la liste `revealOrder(QUESTIONS, draft, activeId)` rendue en `ConfirmedBlock` (sauf le dernier = `ActiveQuestion`), un `ghost` du suivant (`nextQuestionId`), `AnticipationBar`, et au chapitre recap le bouton submit gaté par `canSubmit`. Avance : `onAnswer` d'une question `autoAdvance` → `setActiveId(nextQuestionId(...))` ; bouton « Continuer » idem ; edit → `setActiveId(q.id)`.
```tsx
// cœur de l'avance auto : observer l'answer
function advanceFrom(id: string) {
  const next = nextQuestionId(QUESTIONS, draft, id);
  setActiveId(next); // null → recap actif
}
```
- [ ] **Step 3 : Run** `pnpm --filter web typecheck` → PASS.
- [ ] **Step 4 : Commit.**
```bash
git add apps/web/app/diagnostic/questionnaire/GuidedTunnel.tsx apps/web/app/diagnostic/questionnaire/use-diagnostic-form.ts
git commit -m "feat(diagnostic): orchestrateur GuidedTunnel + curseur activeId"
```

## Task 11: Bascule `page.tsx` + convergence (suppressions)

**Files:** Modify `page.tsx`. Delete `Questionnaire.tsx`, `QuestionnaireOnePage.tsx`, `tunnel-steps.ts`, `steps/HousingDpeStep.tsx`, `steps/LeaseDetailsStep.tsx`.

- [ ] **Step 1 : `page.tsx`** — retirer `searchParams.vue`, rendre `<div className="nb"><GuidedTunnel/></div>` (scope nb). Garder `after(() => trackEvent("diagnostic_demarre"))`.
- [ ] **Step 2 : Supprimer** les fichiers convergés. Vérifier qu'aucun import ne subsiste : `grep -rn "QuestionnaireOnePage\|tunnel-steps\|HousingDpeStep\|LeaseDetailsStep\|vue === \"page\"" apps/web`.
- [ ] **Step 3 : Run** `pnpm --filter web typecheck` → PASS (aucun import cassé). `pnpm test` → vert.
- [ ] **Step 4 : Commit.**
```bash
git add -A apps/web/app/diagnostic
git commit -m "refactor(diagnostic): bascule GuidedTunnel, suppression stepper + variante une-page"
```

## Task 12: Chip « augmentation légale IRL » (levier 2, dégradable)

**Files:** Modify `questions/lease.tsx`. Éventuellement Create `app/diagnostic/irl-actions.ts` (server action) si l'accès IRL client est nécessaire.

- [ ] **Step 1 : Décision d'accès données.** Vérifier comment l'IRL est déjà exposé (`grep -rn "001515333\|irl" apps/web/lib packages/rules-engine/src`). Si une fonction d'indexation pure existe et que la série peut être passée au client, l'utiliser ; sinon créer `getIrlSuggestionAction(baseCents, fromISO, toISO)` (server action, lit la table seedée, retourne le loyer indexé en centimes).
- [ ] **Step 2 : Chip** dans `AnniversaryRows` (ou sa version question) : à côté de « Pas de hausse », un `.nb-pill` « Augmentation légale (≈ {formatEUR}) » qui `setAmount(date, suggested)`. Si la suggestion est indisponible → ne pas afficher le chip (dégradation propre, les boutons « Pas de hausse » / saisie restent).
- [ ] **Step 3 : Run** typecheck + test → PASS.
- [ ] **Step 4 : Commit.**
```bash
git add apps/web/app/diagnostic
git commit -m "feat(diagnostic): suggestion IRL en un tap sur les hausses (dégradable)"
```

## Task 13: Vérification finale

- [ ] **Step 1 : Typecheck + tests.** Run: `pnpm typecheck && pnpm test`. Expected: 0 erreur TS, tous tests verts (76 existants + nouveaux).
- [ ] **Step 2 : Grep anti-régression.** `grep -rn "stepIndex\|onePage\|vue=page" apps/web/app/diagnostic` → aucun résultat.
- [ ] **Step 3 : Smoke runtime (par Lyes).** Fournir la commande, ne pas lancer le navigateur soi-même :
  - `pnpm dev` puis ouvrir `/diagnostic`, vérifier : dévoilement question par question, cascade DPE pré-remplit surface/époque, pilules avancent auto, dépôt/coloc/complément OK, récap éditable, submit → verdict.
- [ ] **Step 4 : Présenter les parties codées** (demande Lyes « une fois codé ») via le compagnon visuel ou captures.

---

## Self-Review (à remplir avant exécution)

- **Couverture spec** : §4 dévoilement → Tasks 5,9,10 ; §4.5 cartographie → Tasks 7,8 ; §5 DA nb → Tasks 1,2,9 ; §6 archi keep/replace → Tasks 4,11 ; §7 force de proposition → Tasks 7,8 ; §7bis réduction saisie → Tasks 3,7,12 ; §10 tests → Tasks 3,5,6,8,13. ✅ Pas de section orpheline.
- **Placeholders** : les `…` du graphe (Task 8 Step 1) listent explicitement les champs restants à coder, pas un TODO masqué ; le filet `buildPayload` + le test de complétude (Task 8 Step 3) attrapent un oubli.
- **Cohérence des types** : `Question`/`ChapterId`/`canSubmit` définis Task 4, consommés identiquement Tasks 5,6,8,10. `activeId: string | null` cohérent hook ↔ reveal-state ↔ GuidedTunnel.

## Notes de risque

- **Task 7/8 = le cœur du risque** (préserver chaque champ + validité). Mitigation : `buildPayload` inchangé, `canSubmit` réutilise les validateurs, test de complétude.
- **Task 12 (IRL)** : dépendance données ; dégradable sans bloquer la phase.
- **PR** : Phase A dépasse 150 lignes → la livrer en plusieurs commits (déjà découpés) voire 2 PR (Tasks 1-8 « moteur+champs », Tasks 9-13 « UI+bascule »).
