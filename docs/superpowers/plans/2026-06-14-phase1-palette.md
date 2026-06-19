# Phase 1 — Palette « + de couleur » + bandes de section · Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) ou superpowers:executing-plans pour implémenter ce plan tâche par tâche.
> Étapes en cases à cocher (`- [ ]`).

**Goal:** Faire passer la DA `.nb` du pastel actuel à la palette « + de couleur » validée,
et donner à chaque section de la LP sa bande de couleur pleine, sans casser les composants
charte partagés.

**Architecture:** Additif et scopé `.nb`. On sature 3 tokens existants (`violet`→lavande,
`pink`→corail, `acid`→jaune) et on ajoute 4 tokens neufs (`menthe`, `ciel`, `orange`,
`vert`). On enregistre les nouveaux dans Tailwind, puis on pose les bandes via une classe
`bg-*` sur le `<section>` de chaque bloc. `refund` (montants) est inchangé.

**Tech Stack:** Next 16, Tailwind (tokens RGB en CSS vars `rgb(var(--x) / <alpha>)`), CSS Modules nb.

**Note méthode :** ces tâches sont du CSS / className → **pas de TDD** (aucun test unitaire
ne s'applique aux couleurs). Le filet est `pnpm typecheck` + `pnpm build` + **smoke visuel
par Lyes**. Référence palette : `docs/.../2026-06-14-tunnel-verdict-da-iteration.md` §4.

---

## Affectation des bandes (cible §4)
| Section | Composant / fichier | Bande |
|---|---|---|
| Hero | `sections-hero-nb.tsx` | lavande — **différé Phase 4** (hero reconstruite) |
| Résultats | `sections-resultats-nb.tsx:32` | **menthe** |
| Étapes | `sections-etapes-nb.tsx:50` | **ciel** |
| Régimes | `sections-regimes-nb.tsx:13` | **corail** (`bg-pink`) |
| Moteur | `sections-moteur-nb.tsx:50` | **noir** (inversion → `nb-dark text-cream`) |
| Confiance | `sections-preuves-nb.tsx:16` | **jaune** (inversion `nb-dark`→`bg-acid`, texte ink) |
| Témoignage | `sections-preuves-nb.tsx:52` | inchangé (papier — respiration entre 2 bandes) |
| Closing/CTA | `CtaFinalNb.tsx:10` | **orange** (`bg-orange`) |

> Les valeurs de bande sont un point de départ §4 : un **smoke visuel** (Task 9) valide
> lisibilité/contraste et peut amener un micro-ajustement (ex. menthe trop clair).

---

## Task 1 : Saturer + étendre les tokens `.nb` (globals.css)

**Files:**
- Modify: `apps/web/app/globals.css:21-25`

- [ ] **Step 1 : Remplacer le bloc de tokens nb**

Remplacer les lignes 21-25 (bloc `--color-cream … --color-acid`) par :

```css
  --color-cream: 250 244 236; /* = paper-2 : fond néubrutaliste chaud */
  --color-nb-ink: 36 29 21; /* #241D15 — encre nb plus dense (palette + de couleur) */
  /* Palette « + de couleur » (itération 2026-06-14 §4). Scopée `.nb`, additive. */
  --color-violet: 183 164 242; /* #B7A4F2 lavande */
  --color-pink: 255 138 160; /* #FF8AA0 corail */
  --color-acid: 255 206 46; /* #FFCE2E jaune */
  --color-menthe: 127 227 180; /* #7FE3B4 */
  --color-ciel: 134 210 245; /* #86D2F5 */
  --color-orange: 255 154 61; /* #FF9A3D */
  --color-vert: 15 169 104; /* #0FA968 vert d'accent (≠ refund #0C8F63, montants) */
```

- [ ] **Step 2 : Vérifier qu'aucune autre déclaration ne réécrit ces vars**

Run: `grep -n "color-violet\|color-pink\|color-acid\|color-menthe\|color-ciel\|color-orange\|color-vert" apps/web/app/globals.css`
Expected : seules les lignes du bloc ci-dessus définissent ces vars (les autres occurrences sont des `var(--color-…)` de consommation).

- [ ] **Step 3 : Commit** (groupé avec Task 2 — base palette)

(ne pas committer seul ; voir Task 2)

---

## Task 2 : Enregistrer les nouveaux tokens dans Tailwind

**Files:**
- Modify: `apps/web/tailwind.config.ts` (bloc `colors`, après la ligne `acid:` ~26)

- [ ] **Step 1 : Ajouter les 4 couleurs neuves**

Après la ligne `acid: "rgb(var(--color-acid) / <alpha-value>)",`, ajouter :

```ts
        menthe: "rgb(var(--color-menthe) / <alpha-value>)",
        ciel: "rgb(var(--color-ciel) / <alpha-value>)",
        orange: "rgb(var(--color-orange) / <alpha-value>)",
        vert: "rgb(var(--color-vert) / <alpha-value>)",
```

- [ ] **Step 2 : Typecheck**

Run: `pnpm typecheck`
Expected : PASS (aucune erreur TS introduite).

- [ ] **Step 3 : Commit (base palette)**

```bash
git add apps/web/app/globals.css apps/web/tailwind.config.ts
git commit -m "feat(da): palette nb + de couleur (tokens satures + menthe/ciel/orange/vert)"
```

---

## Task 3 : Bande Résultats (menthe)

**Files:**
- Modify: `apps/web/components/home/nb/sections-resultats-nb.tsx:32`

- [ ] **Step 1 : Ajouter `bg-menthe` au `<section>`**

Remplacer :
```tsx
    <section id="resultats" className="scroll-mt-24 border-b-3 border-nb-ink py-16 sm:py-24">
```
par :
```tsx
    <section id="resultats" className="scroll-mt-24 border-b-3 border-nb-ink bg-menthe py-16 sm:py-24">
```

---

## Task 4 : Bande Étapes (ciel)

**Files:**
- Modify: `apps/web/components/home/nb/sections-etapes-nb.tsx:50`

- [ ] **Step 1 : Ajouter `bg-ciel`**

Remplacer :
```tsx
    <section className="border-b-3 border-nb-ink py-16 sm:py-20">
```
par :
```tsx
    <section className="border-b-3 border-nb-ink bg-ciel py-16 sm:py-20">
```

---

## Task 5 : Bande Régimes (corail)

**Files:**
- Modify: `apps/web/components/home/nb/sections-regimes-nb.tsx:13`

- [ ] **Step 1 : Ajouter `bg-pink`** (le token `pink` porte désormais le corail)

Remplacer :
```tsx
    <section className="border-b-3 border-nb-ink py-16 sm:py-20">
```
par :
```tsx
    <section className="border-b-3 border-nb-ink bg-pink py-16 sm:py-20">
```

---

## Task 6 : Bande Moteur (noir — inversion)

**Files:**
- Modify: `apps/web/components/home/nb/sections-moteur-nb.tsx:50,53,56`

- [ ] **Step 1 : Passer la section en sombre**

Ligne 50, remplacer :
```tsx
    <section className="border-b-3 border-nb-ink py-16 sm:py-20">
```
par :
```tsx
    <section className="nb-dark border-b-3 border-nb-ink py-16 text-cream sm:py-20">
```

- [ ] **Step 2 : Inverser les 2 textes d'en-tête** (les cartes `nb-card` restent claires, elles ressortent sur le noir)

Ligne 53, remplacer `text-nb-ink/55` par `text-cream/45`.
Ligne 56, remplacer :
```tsx
          <h2 className="mt-3 max-w-3xl text-[clamp(28px,4.5vw,52px)]">
```
par :
```tsx
          <h2 className="mt-3 max-w-3xl text-[clamp(28px,4.5vw,52px)] text-cream">
```

> Le bloc `bg-paper` ligne 82 et les cartes restent volontairement clairs (contraste).

---

## Task 7 : Bande Confiance (jaune — inversion)

**Files:**
- Modify: `apps/web/components/home/nb/sections-preuves-nb.tsx:16,19,22,25,34`

- [ ] **Step 1 : Section sombre → jaune**

Ligne 16, remplacer :
```tsx
    <section className="nb-dark border-b-3 border-nb-ink py-16 text-cream sm:py-20">
```
par :
```tsx
    <section className="border-b-3 border-nb-ink bg-acid py-16 sm:py-20">
```

- [ ] **Step 2 : Re-passer les textes en encre** (le fond est clair maintenant)

- Ligne 19 : `text-cream/45` → `text-nb-ink/55`.
- Ligne 22 : `text-cream` → `text-nb-ink`.
- Ligne 25 : `text-cream/80` → `text-nb-ink/80`.
- Ligne 34 : `border-cream/20` → `border-nb-ink/20`.

> Si `stats` est non nul, vérifier au smoke que `CompteurPublic` reste lisible sur jaune
> (composant partagé — ne pas le modifier ; si illisible, l'entourer d'une carte en Phase 4).

---

## Task 8 : Bande Closing/CTA (orange)

**Files:**
- Modify: `apps/web/components/home/nb/CtaFinalNb.tsx:10`

- [ ] **Step 1 : Ajouter `bg-orange`** (override de `nb-band-final`)

Remplacer :
```tsx
    <section className="nb-band-final border-t-3 border-nb-ink py-16 sm:py-24">
```
par :
```tsx
    <section className="nb-band-final bg-orange border-t-3 border-nb-ink py-16 sm:py-24">
```

> `nb-band-final` fixe encore le texte/CTA en ink → reste lisible sur orange.

---

## Task 9 : Vérification + smoke + commit des bandes

- [ ] **Step 1 : Typecheck**

Run: `pnpm typecheck`
Expected : PASS.

- [ ] **Step 2 : Build (ISR home)**

Run: `pnpm build`
Expected : build OK, `/` généré sans erreur.

- [ ] **Step 3 : Smoke visuel par Lyes**

Lancer `pnpm dev`, ouvrir `/`. Vérifier (Lyes) :
- chaque bande pleine couleur présente (menthe, ciel, corail, noir, jaune, orange) ;
- contrastes lisibles (en-têtes moteur sur noir, confiance sur jaune) ;
- cartes/CTA charte partagés intacts (pas de régression hors `.nb`) ;
- alternance des couleurs agréable (témoignage en papier sert de respiration).
Noter tout ajustement de teinte souhaité.

- [ ] **Step 4 : Commit des bandes**

```bash
git add apps/web/components/home/nb/sections-resultats-nb.tsx \
  apps/web/components/home/nb/sections-etapes-nb.tsx \
  apps/web/components/home/nb/sections-regimes-nb.tsx \
  apps/web/components/home/nb/sections-moteur-nb.tsx \
  apps/web/components/home/nb/sections-preuves-nb.tsx \
  apps/web/components/home/nb/CtaFinalNb.tsx
git commit -m "feat(da): bandes de couleur pleine par section LP"
```

---

## Definition of Done (Phase 1)
- `pnpm typecheck` + `pnpm build` verts.
- Smoke LP validé par Lyes : 6 bandes posées, contrastes OK, charte partagée intacte.
- 2 commits (base palette ; bandes). Hero lavande reportée en Phase 4 (rework).
- Tokens `menthe/ciel/orange/vert` disponibles pour Phases 2-3 (tunnel, verdict).
