# Plan — Simplification questionnaire + fourchette + mini-tunnel dépôt

> **Pour l'exécutant (Codex 5.5 xhigh) :** implémenter tâche par tâche, TDD.
> Étapes en cases `- [ ]`. Après CHAQUE tâche : `pnpm typecheck` + `pnpm test`
> au vert, puis commit. Revue Claude entre les tranches. Règles repo non
> négociables : moteur PUR (zéro I/O), TS strict sans `any`, alias `@/`,
> centimes int, dates ISO, max ~200 lignes/fichier, jamais de texte juridique
> improvisé. Spec : `docs/superpowers/specs/2026-06-12-simplification-questionnaire-design.md`.

**Goal:** Réduire la friction du diagnostic (8→5 écrans, boutons, « je ne sais
pas »), afficher le verdict en fourchette basse/haute + baisse de loyer en
avant, et finir le mini-tunnel dépôt « logement quitté ».

**Architecture:** Le moteur reste pur ; la fourchette est une fonction
`evaluateRange` qui appelle `evaluateAll` sur deux `RuleInput` (bas/haut). La
couche web (`toSnapshot`) décide quels champs estimés neutraliser en borne
basse. L'UI réutilise les composants et la mécanique boosters existants.

**Tech Stack:** pnpm monorepo, Next.js 16 App Router, packages/rules-engine
(TS pur), Vitest, zod.

**Séquençage (tranches verticales, revue Claude à chaque palier) :**
1. Moteur fourchette (DÉTAILLÉE ci-dessous)
2. Écran Loyer : dépôt en mois + complément OUI/NON/NSP + `toSnapshotRange`
3. Fusion tunnel 5 écrans + « je ne sais pas »
4. Verdict : fourchette + baisse de loyer + cartes affiner
5. Mini-tunnel dépôt (adapter le code préexistant à la spec finale)

---

## TRANCHE 1 — Moteur : fourchette à deux passes

**Principe :** le moteur ne sait pas « ce qui est estimé » ; il reçoit deux
inputs et compose une fourchette avec garde-fou `low = min, high = max` (sûreté
si un cas n'est pas monotone). La construction des deux snapshots est en
tranche 2 (`toSnapshotRange`, côté web).

### Task 1.1 : Type `VerdictRange`

**Files:**
- Modify: `packages/rules-engine/src/types.ts` (après `VerdictGlobal`, ~ligne 222)

- [ ] **Step 1 : Ajouter le type** (pas de test : déclaration de type pure)

```ts
/**
 * Fourchette de verdict : deux évaluations du même dossier — un scénario bas
 * (« plancher sûr », estimations neutralisées) et un scénario haut
 * (estimations appliquées). `totalRecoverableLowCents` ≤ `totalRecoverableHighCents`
 * par construction (garde-fou min/max). La baisse de loyer engagée est celle
 * du scénario bas. Si bas == haut, l'UI affiche un montant unique.
 */
export interface VerdictRange {
  low: VerdictGlobal;
  high: VerdictGlobal;
  totalRecoverableLowCents: number;
  totalRecoverableHighCents: number;
  /** Baisse de loyer mensuelle engagée (scénario bas, prudent). */
  futureMonthlySavingCents: number;
  /** true si une estimation sépare les deux bornes (afficher une fourchette). */
  isRange: boolean;
  asOf: string;
}
```

- [ ] **Step 2 : Vérifier la compilation**

Run: `pnpm --filter @troppaye/rules-engine typecheck` (ou `pnpm typecheck`)
Expected: PASS

- [ ] **Step 3 : Commit**

```bash
git add packages/rules-engine/src/types.ts
git commit -m "feat(moteur): type VerdictRange pour la fourchette basse/haute"
```

### Task 1.2 : Fonction `evaluateRange`

**Files:**
- Create: `packages/rules-engine/src/range.ts`
- Test: `packages/rules-engine/src/range.test.ts`
- Modify: `packages/rules-engine/src/index.ts` (export)

- [ ] **Step 1 : Écrire le test qui échoue**

```ts
import { describe, expect, it } from "vitest";
import { evaluateRange } from "./range";
import type { RuleInput } from "./types";

// Snapshot minimal : un retard de dépôt clair (chiffré HIGH, identique bas/haut).
const baseReferentials = { irl: [], shieldRatePct: 3.5 };
function depositInput(monthlyRentCents: number): RuleInput {
  return {
    asOf: "2026-06-12",
    referentials: baseReferentials,
    dossier: {
      dpeHistory: [],
      rentHistory: [{ date: "2024-01-01", type: "INITIAL", rentCents: monthlyRentCents, source: "déclaratif" }],
      deposit: {
        depositCents: monthlyRentCents,
        leaveDate: "2026-01-10",
        edlConforme: true,
        monthlyRentCents,
      },
    },
  };
}

describe("evaluateRange", () => {
  it("bas == haut quand les deux inputs sont identiques → pas de fourchette", () => {
    const input = depositInput(80000);
    const range = evaluateRange(input, input);
    expect(range.totalRecoverableLowCents).toBe(range.totalRecoverableHighCents);
    expect(range.isRange).toBe(false);
    expect(range.futureMonthlySavingCents).toBe(range.low.totalFutureMonthlySavingCents);
  });

  it("compose min/haut même si les inputs sont fournis à l'envers (garde-fou)", () => {
    const low = depositInput(80000); // dépôt plus petit → recouvrable plus faible
    const high = depositInput(120000);
    const swapped = evaluateRange(high, low); // volontairement inversés
    expect(swapped.totalRecoverableLowCents).toBeLessThanOrEqual(swapped.totalRecoverableHighCents);
    expect(swapped.isRange).toBe(true);
  });
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `pnpm --filter @troppaye/rules-engine test range`
Expected: FAIL (`evaluateRange is not a function`)

- [ ] **Step 3 : Implémenter**

```ts
import { evaluateAll } from "./aggregate";
import type { RuleInput, VerdictGlobal, VerdictRange } from "./types";

/**
 * Évalue le dossier sur deux scénarios (bas/haut) et compose la fourchette.
 * Garde-fou : `low = min`, `high = max` des deux totaux, indépendamment de
 * l'ordre des arguments (sûreté pour un cas non monotone). La baisse de loyer
 * retenue est celle du scénario qui porte le total recouvrable le plus bas
 * (engagement prudent). PUR : appelle `evaluateAll` deux fois, ne mute rien.
 */
export function evaluateRange(inputLow: RuleInput, inputHigh: RuleInput): VerdictRange {
  const a = evaluateAll(inputLow);
  const b = evaluateAll(inputHigh);
  const low: VerdictGlobal = a.totalRecoverableCents <= b.totalRecoverableCents ? a : b;
  const high: VerdictGlobal = low === a ? b : a;
  return {
    low,
    high,
    totalRecoverableLowCents: low.totalRecoverableCents,
    totalRecoverableHighCents: high.totalRecoverableCents,
    futureMonthlySavingCents: low.totalFutureMonthlySavingCents,
    isRange: low.totalRecoverableCents !== high.totalRecoverableCents,
    asOf: inputLow.asOf,
  };
}
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `pnpm --filter @troppaye/rules-engine test range`
Expected: PASS

- [ ] **Step 5 : Exporter depuis l'index**

Dans `packages/rules-engine/src/index.ts`, ajouter :
```ts
export { evaluateRange } from "./range";
export type { VerdictRange } from "./types";
```
(vérifier que `VerdictRange` n'est pas déjà ré-exporté via un `export *`).

- [ ] **Step 6 : Typecheck + tests complets**

Run: `pnpm typecheck && pnpm --filter @troppaye/rules-engine test`
Expected: PASS (106 tests moteur + nouveaux)

- [ ] **Step 7 : Commit**

```bash
git add packages/rules-engine/src/range.ts packages/rules-engine/src/range.test.ts packages/rules-engine/src/index.ts
git commit -m "feat(moteur): evaluateRange — fourchette basse/haute à deux passes"
```

### Task 1.3 : Cas monotonie sur un complément estimé

**Files:**
- Modify: `packages/rules-engine/src/range.test.ts`

- [ ] **Step 1 : Ajouter un test de fourchette réelle**

```ts
it("fourchette réelle : bas exclut une estimation que haut inclut", () => {
  // bas = dépôt à 0 (NSP neutralisé), haut = dépôt déclaré.
  const high = depositInput(100000);
  const low: RuleInput = {
    ...high,
    dossier: { ...high.dossier, deposit: undefined },
  };
  const range = evaluateRange(low, high);
  expect(range.totalRecoverableLowCents).toBeLessThan(range.totalRecoverableHighCents);
  expect(range.isRange).toBe(true);
  // Les deux bornes gardent leur audit trail.
  expect(range.high.results.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2 : Lancer, vérifier PASS** (pas de code à écrire, valide le comportement)

Run: `pnpm --filter @troppaye/rules-engine test range`
Expected: PASS

- [ ] **Step 3 : Commit**

```bash
git add packages/rules-engine/src/range.test.ts
git commit -m "test(moteur): evaluateRange fourchette réelle + audit trail des deux bornes"
```

**→ PALIER DE REVUE CLAUDE.** Ne pas démarrer la tranche 2 avant validation du
diff de la tranche 1 (API `evaluateRange`/`VerdictRange` figée).

---

## TRANCHE 2 — Écran Loyer : dépôt en mois, complément OUI/NON/NSP

**À affiner après la tranche 1** (dépend de l'API figée + relecture de
`schema.ts`/`toSnapshot` et des steps existants). Périmètre :

- **Fichiers** : `apps/web/lib/diagnostic/schema.ts` (nouveau `toSnapshotRange`
  produisant `{ low, high }` à partir d'un `DiagnosticInput` annoté ;
  `toSnapshot` actuel conservé pour compat), `RentStep.tsx`, `fields.tsx`,
  `use-diagnostic-form.ts`, tests `schema.test.ts`.
- **Dépôt** : ChoiceField 1/2/3 mois/autre/NSP ; conversion mois → centimes sur
  loyer initial HC ; coloc à la part → montant exact/NSP (pas de presets).
- **Complément** : OUI/NON/NSP. OUI → 9 % dans les deux bornes (TODO_VERIFIER,
  AVOCAT_PENDING) ; NSP → 0 bas / 9 % haut ; NON → 0. Checklist 3DS retirée de
  l'écran (déménage en post-verdict, tranche 4).
- **Critère** : `toSnapshotRange` produit deux snapshots ; tests sur les 3
  états du complément et la conversion dépôt mois→centimes (coloc exclue des
  presets).

## TRANCHE 3 — Fusion tunnel 5 écrans + « je ne sais pas »

- **Fichiers** : `Questionnaire.tsx` (réordonner/fusionner steps), nouveaux
  conteneurs `HousingDpeStep` (fusion Housing+Dpe) et `LeaseStep` étendu
  (signature + révision + historique), steps existants réutilisés en
  sous-sections, tests de parcours.
- **Critère** : parcours nominal en 5 écrans, chaque choix fermé porte « je ne
  sais pas », validations bloquantes existantes vertes (régression schema).

## TRANCHE 4 — Verdict : fourchette + baisse de loyer + cartes affiner

- **Fichiers** : `verdict-read.ts` (exposer la fourchette), `VerdictView.tsx`,
  `VerdictCompliant.tsx`/`VerdictIrregular*`, `Amount.tsx` (variante
  « X à Y »), la checklist 3DS en carte boosters, tests web.
- **Critère** : fourchette affichée quand `isRange`, montant unique sinon ;
  baisse de loyer aussi visible que la récupération ; `prefers-reduced-motion`.

## TRANCHE 5 — Mini-tunnel dépôt (adapter l'existant)

Code préexistant non commité à ADAPTER (ne pas récrire) :
`apps/web/lib/diagnostic/deposit-tunnel.ts` (+ `.test.ts`),
`apps/web/app/diagnostic/[verdictId]/DepositModule.tsx`, `deposit-actions.ts`,
`deposit-actions.test.ts`.

Écarts à combler vs spec finale :
- Dépôt en **mois** (boutons) au lieu du montant exact en centimes (aligner sur
  la tranche 2 : presets 1/2/3 mois + conversion).
- **+ question « nouvelle adresse transmise ? » O/N/NSP** → l'exception art. 22
  exclut la pénalité de la borne basse si NON (corriger aussi `DEPOSIT_LATE` si
  l'exception n'y est pas — vérifier `deposit-late.ts` ; si correction moteur,
  tests dédiés).
- **Date remise des clés en presets** de fourchette (absorbée par low/high).
- **Colocation exclue** (le module ne se rend pas ; schema/action refusent).
- **Critère** : tests merge + conversion mois + exception adresse + coloc
  refusée ; typecheck + tests verts.

---

## Self-review (couverture spec)
- Partie 1 spec (fourchette) → Tranche 1 ✓
- Partie 2 (5 écrans) → Tranche 3 ✓
- Partie 3 (dépôt mois + complément) → Tranche 2 ✓
- Partie 4 (verdict) → Tranche 4 ✓
- Partie 5 (mini-tunnel dépôt) → Tranche 5 ✓
- Baisse de loyer : déjà au moteur (`futureMonthlySavingCents`), exposée
  tranche 1 (range) + affichée tranche 4 ✓
