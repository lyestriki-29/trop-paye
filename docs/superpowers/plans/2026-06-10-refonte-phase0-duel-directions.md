# Phase 0 — Duel de directions artistiques : Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à Lyes d'arbitrer entre 3 directions artistiques complètes (home +
verdict animé + identité) dans `/design-lab/directions`, sans toucher au rendu du site live.

**Architecture:** Re-câblage des couleurs Tailwind sur des variables CSS (canaux RGB) pour
permettre le scoping par direction ; thèmes scopés par classe (`.theme-d1/2/3`) dans une
arborescence `/design-lab/directions/*` isolée ; 2 écrans témoins + 1 page identité par
direction. Tasks 3-5 indépendantes (fichiers disjoints) → **parallélisables**.

**Tech Stack:** Next.js 16 (App Router), Tailwind 3.4 (couleurs via `rgb(var() / <alpha-value>)`),
`motion` v12 (`motion/react`), `next/font/google`, TS strict.

**Spec:** `docs/superpowers/specs/2026-06-10-refonte-site-public-design.md` (Phase 0)
**Contraintes transverses (toutes tasks)** : copy **mot pour mot** depuis
`docs/copy-deck-troppaye.md` et `packages/shared/src/brand.ts` ; aucun style inline ;
TS strict sans `any` ; imports `@/...` ; max ~200 lignes/fichier (découper sinon) ;
`prefers-reduced-motion` respecté (hook `useReducedMotion` de motion/react → variante fondu
simple sans count-up) ; icônes Lucide uniquement ; aucune photo de stock / 3D / dégradé violet.

---

### Task 1: Re-câbler les couleurs Tailwind sur des variables CSS (canaux)

**Files:**
- Modify: `apps/web/app/globals.css:5-19`
- Modify: `apps/web/tailwind.config.ts:8-14`

- [ ] **Step 1 : Convertir `:root` en canaux RGB + ajouter `accent`**

Dans `globals.css`, remplacer le bloc `:root` et les règles `html` :

```css
:root {
  /* Canaux RGB (format requis par rgb(var() / <alpha-value>) côté Tailwind). */
  --color-ink: 17 25 43; /* #11192B */
  --color-paper: 251 251 248; /* #FBFBF8 */
  --color-paper-2: 241 241 236; /* #F1F1EC */
  --color-refund: 11 158 107; /* #0B9E6B */
  --color-refund-text: 8 122 82; /* #087A52 */
  --color-stamp: 200 50 43; /* #C8322B */
  --color-line: 217 217 209; /* #D9D9D1 */
  /* Accent par direction (D1 : rouge tampon). */
  --color-accent: 200 50 43;
}

html {
  background-color: rgb(var(--color-paper));
  color: rgb(var(--color-ink));
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2 : Pointer Tailwind sur les variables**

Dans `tailwind.config.ts`, remplacer le bloc `colors` :

```ts
colors: {
  ink: "rgb(var(--color-ink) / <alpha-value>)",
  paper: {
    DEFAULT: "rgb(var(--color-paper) / <alpha-value>)",
    2: "rgb(var(--color-paper-2) / <alpha-value>)",
  },
  refund: {
    DEFAULT: "rgb(var(--color-refund) / <alpha-value>)",
    text: "rgb(var(--color-refund-text) / <alpha-value>)",
  },
  stamp: "rgb(var(--color-stamp) / <alpha-value>)",
  line: "rgb(var(--color-line) / <alpha-value>)",
  accent: "rgb(var(--color-accent) / <alpha-value>)",
},
```

- [ ] **Step 3 : Vérifier (rendu strictement inchangé)**

Run: `pnpm typecheck && pnpm --filter @troppaye/web build`
Expected: verts. Contrôle visuel rapide de `/` (les modificateurs `text-ink/60` etc.
fonctionnent — c'est tout l'intérêt du format canaux).

- [ ] **Step 4 : Commit**

```bash
git add apps/web/app/globals.css apps/web/tailwind.config.ts
git commit -m "refactor(tokens): couleurs Tailwind via variables CSS (canaux) — rendu inchangé"
```

---

### Task 2: Infra du duel — thèmes scopés, polices D2/D3, comparateur

**Files:**
- Create: `apps/web/app/design-lab/directions/directions.css`
- Create: `apps/web/app/design-lab/directions/DirectionTheme.tsx`
- Create: `apps/web/app/design-lab/directions/layout.tsx`
- Create: `apps/web/app/design-lab/directions/page.tsx`

- [ ] **Step 1 : `directions.css` — les 3 thèmes (couleurs + polices)**

```css
/* Thèmes du duel P0 — scopés, zéro impact hors /design-lab/directions. */

.theme-d1 {
  /* Hérite de :root (charte v1) — accent = rouge tampon. */
}

.theme-d2 {
  /* « Relevé de compte » — data-fintech froide, preuve par les chiffres. */
  --color-ink: 13 18 32; /* #0D1220 */
  --color-paper: 255 255 255; /* #FFFFFF */
  --color-paper-2: 245 247 250; /* #F5F7FA */
  --color-refund: 0 179 116; /* #00B374 */
  --color-refund-text: 0 115 74; /* #00734A */
  --color-stamp: 229 72 77; /* #E5484D */
  --color-line: 226 230 238; /* #E2E6EE */
  --color-accent: 0 179 116; /* accent = le vert compteur */
  --font-display: var(--font-d2-display);
  --font-body: var(--font-d2-body);
  --font-mono: var(--font-d2-mono);
}

.theme-d3 {
  /* « De votre côté » — allié humain, chaleur maîtrisée. */
  --color-ink: 42 33 24; /* #2A2118 */
  --color-paper: 255 254 251; /* #FFFEFB */
  --color-paper-2: 250 244 236; /* #FAF4EC */
  --color-refund: 12 143 99; /* #0C8F63 */
  --color-refund-text: 10 115 81; /* #0A7351 */
  --color-stamp: 214 69 69; /* #D64545 */
  --color-line: 234 225 214; /* #EAE1D6 */
  --color-accent: 255 216 77; /* #FFD84D — le surligneur jaune */
  --font-display: var(--font-d3-display);
  --font-body: var(--font-d3-body);
  /* mono : hérite de Spline Sans Mono (continuité des montants) */
}
```

- [ ] **Step 2 : `DirectionTheme.tsx` — wrapper de scoping**

```tsx
import type { ReactNode } from "react";

const THEME_CLASS = { d1: "theme-d1", d2: "theme-d2", d3: "theme-d3" } as const;
export type DirectionId = keyof typeof THEME_CLASS;

/** Scope un thème du duel : re-ancre fond/texte/police sur les variables du thème. */
export function DirectionTheme({ dir, children }: { dir: DirectionId; children: ReactNode }) {
  return (
    <div className={`${THEME_CLASS[dir]} min-h-screen bg-paper font-body text-ink`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3 : `layout.tsx` — polices D2/D3 + import CSS + bandeau lab**

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { IBM_Plex_Mono, Inter, Inter_Tight, Figtree, Outfit } from "next/font/google";
import "./directions.css";

const d2Display = Inter_Tight({ subsets: ["latin"], variable: "--font-d2-display", weight: ["600", "700", "800"], display: "swap" });
const d2Body = Inter({ subsets: ["latin"], variable: "--font-d2-body", weight: ["400", "500", "600"], display: "swap" });
const d2Mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-d2-mono", weight: ["400", "500"], display: "swap" });
const d3Display = Outfit({ subsets: ["latin"], variable: "--font-d3-display", weight: ["600", "700", "800"], display: "swap" });
const d3Body = Figtree({ subsets: ["latin"], variable: "--font-d3-body", weight: ["400", "500", "600"], display: "swap" });

export default function DirectionsLayout({ children }: { children: ReactNode }) {
  const fontVars = `${d2Display.variable} ${d2Body.variable} ${d2Mono.variable} ${d3Display.variable} ${d3Body.variable}`;
  return (
    <div className={fontVars}>
      <nav className="border-b border-line bg-paper-2 px-6 py-2 text-xs text-ink/60">
        <Link href="/design-lab/directions" className="font-medium hover:underline">
          ← Duel P0 — index des directions
        </Link>
        <span className="ml-3">Surface de travail interne. Données fictives.</span>
      </nav>
      {children}
    </div>
  );
}
```

- [ ] **Step 4 : `page.tsx` — comparateur / index d'arbitrage**

Une carte par direction : nom, parti pris en 1 phrase, liens vers `home` / `verdict` /
`identite`. Partis pris (libellés exacts à afficher) :
- **D1 « Document officiel »** : « Le vocabulaire visuel de l'administration devient l'arme du
  locataire — quittance, filets, tampon. »
- **D2 « Relevé de compte »** : « La preuve par les chiffres — un produit financier de
  précision, montants mono en vedette, zéro métaphore papier. »
- **D3 « De votre côté »** : « L'allié chaleureux — gros boutons, langage humain, le surligneur
  jaune comme signature. »

Pied de page : « Arbitrage : choisir UNE direction. La gagnante devient la charte v2 ; les
perdantes partent dans /design-lab/archive. »

- [ ] **Step 5 : Vérifier + commit**

Run: `pnpm typecheck && pnpm --filter @troppaye/web build` — Expected: verts.

```bash
git add apps/web/app/design-lab/directions
git commit -m "feat(design-lab): infra duel de directions (thèmes scopés, polices, comparateur)"
```

---

### Tasks 3-5 : une direction = une task (PARALLÉLISABLES, fichiers disjoints)

**Files par direction `dX` ∈ {d1, d2, d3} :**
- Create: `apps/web/app/design-lab/directions/dX/home/page.tsx` (assemblage)
- Create: `apps/web/app/design-lab/directions/dX/home/sections-*.tsx` (composants, ≤200 l/fichier)
- Create: `apps/web/app/design-lab/directions/dX/verdict/page.tsx`
- Create: `apps/web/app/design-lab/directions/dX/verdict/VerdictSequence.tsx` (client)
- Create: `apps/web/app/design-lab/directions/dX/identite/page.tsx`
- Create: `apps/web/app/design-lab/directions/dX/identite/logos.tsx` (SVG inline)

Chaque page enveloppe son contenu dans `<DirectionTheme dir="dX">` et n'utilise QUE les
classes de tokens (`bg-paper`, `text-ink`, `text-refund`, `bg-accent`, `font-display`,
`rounded-card`…) — jamais de couleur littérale, jamais de police littérale.

#### Écran 1 — Home témoin (statique, sections dans cet ordre)

1. **Header** : logotype de la direction (proposition n°1 de la page identité) + baseline
   `brand.baseline` ; lien « Se connecter » factice.
2. **Hero « tape l'adresse »** : `brand.hero.title`, `brand.hero.subtitle` ; champ adresse
   **visuel** (input + bouton `brand.hero.cta`, placeholder copy deck :
   « 12 rue de la République, Lyon ») — non câblé, c'est un témoin ; réassurance
   `brand.hero.reassurance` jointe par « · » ; stat d'appui (copy deck) : « 1 logement loué
   sur 6 en France a un loyer illégal. Le vôtre ? » + « (lien source) ».
3. **Comment ça marche** — copy deck §1, mot pour mot (Vérifiez / Mandatez-nous / Récupérez).
4. **Confiance** — titre « Nous faisons appliquer la loi. Rien de plus. » + texte du deck ;
   compteur en placeholder : « — € récupérés pour les locataires · — dossiers en cours »
   + note « (compteur réel branché en P2) ».
5. **Passoires** — titre « Logement mal isolé ? Votre loyer est gelé depuis 2022. » + texte
   du deck + lien « Vérifier mon DPE ».
6. **FAQ (2 extraits sûrs)** — « Combien ça coûte ? » et « Combien de temps ça prend ? »
   (textes du deck, verbatim).
7. **CTA final** (reprend le champ adresse ou le bouton) + footer simplifié (baseline +
   « Mentions légales (squelette) »).

**Partis pris de composition par direction :**
- **D1** : grille « document » — filets 1px `line`, en-têtes mono en petites capitales
  (« RÉF. DOSSIER »), hero 2 colonnes (texte / carte-quittance spécimen annotée), étapes en
  cartes-quittance. Le tampon n'apparaît PAS sur la home (règle charte : verdict + réseaux).
- **D2** : data-first — hero centré, champ adresse en barre pleine largeur (max-w-xl), la
  stat « 1 sur 6 » traitée en très gros mono, « Comment ça marche » en 3 lignes de relevé
  numérotées (01/02/03), compteur stylé ticker, fonds `paper` purs + `paper-2` en zébrures.
- **D3** : chaleur — hero aligné gauche avec **surligneur `accent`** sous « trop payer »
  (span avec fond accent, pas d'inline style), boutons XL `rounded-badge`, étapes en 3 cartes
  arrondies avec icônes Lucide (`Search`, `PenLine`, `HandCoins`), interlignes généreux.

#### Écran 2 — Verdict témoin (séquence animée simplifiée, `motion/react`)

Scénario fixe : adresse « 12 rue des Lilas, 75011 Paris » · trop-perçu **1 437,00 €**
(`143700` cents) · économie future **72 €/mois** (`7200`) · confiance ÉLEVÉE · 3 lignes de
calcul fictives (« Loyer payé depuis le 01/09/2023 », « Plafond légal (gel DPE F/G) »,
« Différence mensuelle ») avec montants mono. Titre : « Vous avez trop payé. » (copy deck).
CTA : « Récupérer mes 1 437 € ». Mention `brand.disclaimer` en pied.

Séquences (chaque étape ~`delay` cumulé ; `useReducedMotion` → tout statique en fondu) :
- **D1** (charte §4) : carte fade+slide 12 px → lignes stagger 80 ms → **tampon TROP PAYÉ**
  scale 1.4→1, rotation −6°, spring stiffness 600 + secousse 1 px → count-up 0→1 437 € (1 s,
  ease-out, 64 px, `refund`) → CTA.
- **D2** : lignes de relevé qui « s'impriment » (stagger 70 ms, mono) → la ligne solde
  « TROP-PERÇU » flashe en fond `refund/10` → count-up du solde en `refund` → badge pill mono
  « +1 437,00 € » → CTA. Pas de tampon.
- **D3** : carte chaleureuse fade → phrase « Bonne nouvelle : la loi est de votre côté. »
  (note : libellé design-lab, `TODO_COPY` pour la prod) → le **surligneur `accent`** balaie le
  montant (width 0→100 %, 400 ms) → count-up → gros CTA `rounded-badge`.

Implémentation count-up : `animate` de motion sur une valeur 0→143700 avec rendu
`formatEuros(Math.round(v))` (utiliser l'utilitaire montant existant de
`packages/shared/src/money.ts` s'il expose un format ; sinon `Intl.NumberFormat("fr-FR")`
en local dans le composant).

#### Écran 3 — Identité

2 propositions de **logotype** (SVG inline, composants nommés `LogoA`/`LogoB`) + 1 **marque
secondaire** + aperçu favicon 32 px + **gabarit OG 1200×630** (aperçu HTML/CSS réduit dans la
page — logotype + « J'ai vérifié mon loyer : 1 437 € à récupérer » + marque secondaire ; le
vrai `next/og` arrive en P2), le tout sur fond `paper` ET fond `ink` :
- **D1** : logotypes Bricolage 800 (accent du « é » en `refund` ; variante avec soulignement
  filet) ; marque secondaire = tampon « TROP PAYÉ » double filet `stamp`, incliné −6°.
- **D2** : logotypes Inter Tight 800 (variante avec « ¢ » détourné / chiffre intégré) ;
  marque secondaire = chip mono « +TP » style écriture comptable `refund`.
- **D3** : logotypes Outfit 800 (variante avec surligneur `accent` sous « Payé ») ; marque
  secondaire = pastille « TP » arrondie fond `accent`, texte `ink`.

#### Steps (identiques pour chaque direction)

- [ ] **Step 1 : Construire les 6 fichiers** (contraintes ci-dessus + transverses du header)
- [ ] **Step 2 : Vérifier** — Run: `pnpm typecheck && pnpm --filter @troppaye/web build` ; verts.
- [ ] **Step 3 : Contrôle contraintes** — grep : aucun `#` hex ni `style={{` dans
  `apps/web/app/design-lab/directions/dX/` ; copy identique au deck (diff visuel).
- [ ] **Step 4 : Commit**

```bash
git add apps/web/app/design-lab/directions/dX
git commit -m "feat(design-lab): direction DX « nom » — home, verdict animé, identité"
```

---

### Task 6: Vérifications finales du duel

- [ ] **Step 1 :** `pnpm typecheck && pnpm lint && pnpm --filter @troppaye/web build` — verts.
- [ ] **Step 2 :** Contrôle d'isolation : `git diff main --stat` ne touche que
  `globals.css`, `tailwind.config.ts` et `app/design-lab/directions/**`.
- [ ] **Step 3 :** Vérif reduced-motion sur les 3 verdicts (OS « réduire les animations »).
- [ ] **Step 4 :** Commit final éventuel + message à Lyes : URL des 3 directions + critères
  d'arbitrage (lisibilité, caractère, cohérence avec le positionnement « sérieux mais pas
  corporate », envie de cliquer).

**Après arbitrage (hors plan) :** promotion de la gagnante en charte v2 (mise à jour du doc),
archivage des perdantes, puis plans P1-P4.
