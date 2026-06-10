# Phase 1 — Système de design : Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promouvoir la charte v2 (« l'allié chaleureux qui montre la preuve comptable ») en
fondation du site réel : tokens v2 en `:root`, polices Outfit/Figtree/Spline Sans Mono à la
racine, composants de base traités charte v2, animation d'entrée hero en CSS pur — sans casser
les archives D1/D2/D3 du design-lab.

**Architecture:** Les valeurs du `.theme-d3` de `directions.css` MONTENT dans `:root`
(globals.css) et `packages/shared/src/tokens.ts` ; en miroir, les ANCIENNES valeurs v1 sont
FIGÉES explicitement dans `.theme-d1` (qui héritait de `:root` — sinon l'archive D1 vire à la
palette chaude). Même mécanique pour les polices : Outfit/Figtree à la racine, Bricolage/Public
Sans rechargées par le layout de `/design-lab/directions` et remappées dans `.theme-d1`.
Les composants neutres vivent dans `apps/web/components/ui/`.

**Tech Stack:** Next.js 16 (App Router), Tailwind 3.4 (couleurs `rgb(var() / <alpha-value>)`),
`next/font/google`, CSS keyframes pur (reveal hero), TS strict.

**Spec:** `docs/superpowers/specs/2026-06-10-refonte-site-public-design.md` (Phase 1)
**Charte:** `docs/charte-graphique-design-troppaye.md` (v2, §2 tokens, §4 motion, §5 densité)
**Contraintes transverses (toutes tasks)** : copy **mot pour mot** depuis
`docs/copy-deck-troppaye.md` (manque → `TODO_COPY`, sensible → `[AVOCAT]`) ; aucun style
inline ; TS strict sans `any` ; imports `@/...` ; max ~200 lignes/fichier ;
`prefers-reduced-motion` respecté ; jamais de couleur hex ni police littérale dans les
composants (tokens uniquement) ; `pnpm typecheck` après chaque modification.

---

### Task 1: Promotion des tokens v2 en `:root` + gel des valeurs v1 dans `.theme-d1`

**Files:**
- Modify: `apps/web/app/globals.css:5-16`
- Modify: `apps/web/app/design-lab/directions/directions.css:3-5`
- Modify: `packages/shared/src/tokens.ts:6-14`

- [ ] **Step 1 : `globals.css` — `:root` passe aux canaux v2 (palette chaude)**

Remplacer le bloc `:root` :

```css
:root {
  /* Canaux RGB (format requis par rgb(var() / <alpha-value>) côté Tailwind).
     Charte v2 « palette chaude » — arbitrage du 2026-06-10. */
  --color-ink: 42 33 24; /* #2A2118 */
  --color-paper: 255 254 251; /* #FFFEFB */
  --color-paper-2: 250 244 236; /* #FAF4EC */
  --color-refund: 12 143 99; /* #0C8F63 */
  --color-refund-text: 10 115 81; /* #0A7351 */
  --color-stamp: 214 69 69; /* #D64545 */
  --color-line: 234 225 214; /* #EAE1D6 */
  --color-accent: 255 216 77; /* #FFD84D — le surligneur jaune */
}
```

- [ ] **Step 2 : PIÈGE — figer les valeurs v1 dans `.theme-d1` (`directions.css`)**

`.theme-d1` hérite aujourd'hui de `:root` (v1). Après le Step 1, l'archive D1 hériterait de
la palette chaude → infidèle. Remplacer le bloc `.theme-d1` par les valeurs v1 EXPLICITES :

```css
.theme-d1 {
  /* Charte v1 « Document officiel » FIGÉE (avant promotion v2 en :root). */
  --color-ink: 17 25 43; /* #11192B */
  --color-paper: 251 251 248; /* #FBFBF8 */
  --color-paper-2: 241 241 236; /* #F1F1EC */
  --color-refund: 11 158 107; /* #0B9E6B */
  --color-refund-text: 8 122 82; /* #087A52 */
  --color-stamp: 200 50 43; /* #C8322B */
  --color-line: 217 217 209; /* #D9D9D1 */
  --color-accent: 200 50 43; /* accent D1 = rouge tampon */
}
```

Ne PAS toucher `.theme-d2` ; laisser `.theme-d3` tel quel (ses valeurs deviennent redondantes
avec `:root` mais l'explicite protège l'archive si `:root` rebouge).

- [ ] **Step 3 : `tokens.ts` — constantes JS alignées v2 (consommées par l'OG P2 + Remotion P4)**

Remplacer le bloc `colors` (et adapter `cssVariables()` — non utilisé aujourd'hui, mais il doit
émettre les mêmes canaux que `globals.css`, accent inclus) :

```ts
export const colors = {
  ink: "#2A2118", // texte principal, fonds inversés — brun-noir chaud
  paper: "#FFFEFB", // fond principal — blanc à peine chaud (PAS crème)
  paper2: "#FAF4EC", // fonds de cartes, zones de formulaire
  refund: "#0C8F63", // LE vert de l'argent récupéré (gros montants, fonds sombres)
  refundText: "#0A7351", // variante AA du vert pour le texte courant sur fond clair
  stamp: "#D64545", // rouge tampon chaud — tampon, alertes prescription, erreurs
  line: "#EAE1D6", // filets, bordures 1 px
  accent: "#FFD84D", // le surligneur jaune — texte ink obligatoire par-dessus
} as const;
```

- [ ] **Step 4 : Vérifier**

Run: `pnpm typecheck && pnpm test && pnpm --filter @troppaye/web build` — verts.
Contrôle visuel : `/` rend la palette chaude (fond #FFFEFB, texte brun) ;
`/design-lab/directions/archive/d1/home` reste FIDÈLE v1 (encre bleu nuit #11192B, rouge
#C8322B) ; `/design-lab/directions/v2/home` inchangée.

- [ ] **Step 5 : Commit**

```bash
git add apps/web/app/globals.css apps/web/app/design-lab/directions/directions.css packages/shared/src/tokens.ts
git commit -m "feat(tokens): promotion charte v2 en :root + gel des valeurs v1 dans .theme-d1"
```

---

### Task 2: Polices racine Outfit/Figtree + remap Bricolage/Public Sans pour l'archive D1

**Files:**
- Modify: `apps/web/app/layout.tsx:1-30`
- Modify: `apps/web/app/design-lab/directions/layout.tsx`
- Modify: `apps/web/app/design-lab/directions/directions.css` (`.theme-d1`)
- Modify: `packages/shared/src/tokens.ts:18-22` (`fonts`)

- [ ] **Step 1 : `app/layout.tsx` — Outfit (display) + Figtree (body), Spline Sans Mono inchangé**

```tsx
import { Figtree, Outfit, Spline_Sans_Mono } from "next/font/google";

const display = Outfit({ subsets: ["latin"], variable: "--font-display", weight: ["600", "700", "800"], display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600"], display: "swap" });
// mono : Spline_Sans_Mono existant, NE PAS TOUCHER (poids 400/500, --font-mono).
```

Le reste du fichier (metadata, html lang="fr", className des 3 variables) est inchangé.

- [ ] **Step 2 : PIÈGE — l'archive D1 consommait Bricolage/Public Sans via les variables racine**

Après le Step 1, `--font-display` racine = Outfit → l'archive D1 changerait de voix. Même
mécanique que d2/d3 : dans `apps/web/app/design-lab/directions/layout.tsx`, charger
`Bricolage_Grotesque` + `Public_Sans` et les ajouter au `fontVars` :

```tsx
import { Bricolage_Grotesque, Public_Sans /* + imports existants */ } from "next/font/google";

const d1Display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-d1-display", weight: ["600", "700", "800"], display: "swap" });
const d1Body = Public_Sans({ subsets: ["latin"], variable: "--font-d1-body", weight: ["400", "500", "600"], display: "swap" });
// fontVars : ajouter `${d1Display.variable} ${d1Body.variable}` à la chaîne existante.
```

Et dans `directions.css`, ajouter au bloc `.theme-d1` (mono : hérite de Spline Sans Mono) :

```css
  --font-display: var(--font-d1-display);
  --font-body: var(--font-d1-body);
```

- [ ] **Step 3 : `tokens.ts` — bloc `fonts` aligné v2**

```ts
export const fonts = {
  display: "Outfit", // titres, hero, CTA (600/700/800) — géométrique chaleureuse
  body: "Figtree", // texte courant (400/500/600) — ronde, lisible, amicale
  mono: "Spline Sans Mono", // montants, dates, références, audit trail (400/500)
} as const;
```

- [ ] **Step 4 : Vérifier**

Run: `pnpm typecheck && pnpm --filter @troppaye/web build` — verts.
Contrôle visuel : `/` (titres en Outfit, corps en Figtree) ;
`/design-lab/directions/archive/d1/home` (titres restés en Bricolage Grotesque) ;
`/design-lab/directions/v2/home` (Outfit/Figtree, inchangée) ; montants partout en Spline Mono.

- [ ] **Step 5 : Commit**

```bash
git add apps/web/app/layout.tsx apps/web/app/design-lab/directions packages/shared/src/tokens.ts
git commit -m "feat(fonts): Outfit/Figtree à la racine, Bricolage/Public Sans figées sur l'archive D1"
```

---

### Task 3: Composants de base `components/ui/` + logotype v2 promu

**Files:**
- Create: `apps/web/components/ui/Button.tsx`
- Create: `apps/web/components/ui/Field.tsx`
- Create: `apps/web/components/ui/QuittanceCard.tsx`
- Create: `apps/web/components/ui/StepBadge.tsx`
- Create: `apps/web/components/ui/Frise.tsx`
- Create: `apps/web/components/ui/SiteHeader.tsx`
- Create: `apps/web/components/ui/SiteFooter.tsx`
- Modify: `apps/web/components/brand/Logo.tsx`

Composants **neutres** (traitement charte v2, aucun contenu métier codé en dur hors libellés
listés ici). Tokens uniquement. Référence visuelle : les écrans
`apps/web/app/design-lab/directions/v2/*` (qui restent INTACTS — on n'importe rien depuis
`design-lab` hors `identite/logos.tsx` copié, voir Step 8).

- [ ] **Step 1 : `Button.tsx` — pilule, 3 variantes (code exact)**

```tsx
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "accent" | "ghost";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-badge font-display font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper shadow-md hover:-translate-y-0.5 hover:shadow-lg",
  accent: "bg-accent text-ink shadow-md hover:-translate-y-0.5 hover:shadow-lg",
  ghost: "border border-line bg-paper text-ink hover:border-ink/30 hover:shadow-sm",
};
const SIZE = { md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" } as const;

interface CommonProps {
  variant?: ButtonVariant;
  size?: keyof typeof SIZE;
  children: ReactNode;
  className?: string;
}
type AsButton = CommonProps & ComponentPropsWithoutRef<"button"> & { href?: undefined };
type AsLink = CommonProps & { href: string };

export function Button(props: AsButton | AsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className ?? ""}`;
  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  const { variant: _v, size: _s, className: _c, ...rest } = props;
  return (
    <button type="button" {...rest} className={cls}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2 : `Field.tsx` — focus ring 2 px, label flottant (peer CSS pur)**

Input `rounded-field border border-line bg-paper px-4 pb-2.5 pt-5` + `placeholder=" "` ;
focus : `focus:border-ink focus:ring-2 focus:ring-ink/15`. Label absolu
`left-4 top-3.5 text-ink/50` qui remonte (`top-1.5 text-xs`) sur
`peer-focus` et `peer-[:not(:placeholder-shown)]`. Props : `id`, `label`, `hint?`, `error?`
(texte `text-stamp`), et spread `ComponentPropsWithoutRef<"input">`. Pas de `any`.

- [ ] **Step 3 : `QuittanceCard.tsx` — LE composant signature (code exact)**

```tsx
import type { ReactNode } from "react";
import { formatEUR } from "@troppaye/shared";

export interface QuittanceRow {
  label: string;
  cents?: number;
  text?: string;
  /** Ligne surlignée `accent` (la ligne fautive / mise en évidence). */
  highlight?: boolean;
}

export interface QuittanceCardProps {
  reference: string; // ex. « Réf. dossier TP-2026-0117 »
  kind: string; // ex. « Quittance de loyer » / « Verdict »
  meta?: string; // ligne mono optionnelle (adresse, date)
  rows: ReadonlyArray<QuittanceRow>;
  total?: { label: string; cents: number };
  children?: ReactNode; // annotations, CTA, mentions
  className?: string;
}

export function QuittanceCard({ reference, kind, meta, rows, total, children, className }: QuittanceCardProps) {
  return (
    <section className={`overflow-hidden rounded-card border border-line bg-paper ${className ?? ""}`}>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-paper-2 px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-ink/55">
        <span>{reference}</span>
        <span>{kind}</span>
      </header>
      <div className="px-5 py-5">
        {meta ? <p className="font-mono text-xs text-ink/55">{meta}</p> : null}
        <dl className={meta ? "mt-4" : ""}>
          {rows.map((row) => (
            <div
              key={row.label}
              className={
                row.highlight
                  ? "-mx-2 flex items-baseline justify-between gap-6 rounded-field bg-accent px-2 py-2.5"
                  : "flex items-baseline justify-between gap-6 border-b border-dashed border-line py-2.5"
              }
            >
              <dt className={`text-sm ${row.highlight ? "font-medium text-ink" : "text-ink/70"}`}>
                {row.label}
              </dt>
              <dd className="tabular whitespace-nowrap font-mono text-sm text-ink">
                {row.cents !== undefined ? formatEUR(row.cents, { decimals: true }) : row.text}
              </dd>
            </div>
          ))}
        </dl>
        {total ? (
          <div className="mt-4 flex items-end justify-between gap-6 border-t-2 border-ink pt-4">
            <p className="text-sm font-medium text-ink/80">{total.label}</p>
            <p className="tabular whitespace-nowrap font-mono text-xl font-medium text-refund-text">
              {formatEUR(total.cents, { decimals: true })}
            </p>
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 4 : `StepBadge.tsx`** — pastille d'étape : rond `rounded-badge bg-accent text-ink`
(état courant), `bg-paper-2 text-ink/60` (à venir), `bg-refund text-paper` (fait) ; contenu =
numéro mono `01/02/03` ou icône. Props : `state: "done" | "current" | "todo"`, `children`.

- [ ] **Step 5 : `Frise.tsx`** — frise de progression (modèle « suivi de colis », charte §7) :
liste verticale d'étapes (`label`, `date?`, `state`) reliées par un filet `line` ; étape
courante marquée du surligneur `accent` (StepBadge `current`), étapes faites en `refund`.
Props : `steps: ReadonlyArray<{ label: string; detail?: string; state: ... }>`. Pur, sans I/O.

- [ ] **Step 6 : `SiteHeader.tsx`** — contenu (spec P1) : logotype (Logo, lien `/`) ; nav
desktop : « Comment ça marche » → `/#comment-ca-marche`, « Guides » → `/guides`,
« Résultats » → `/#resultats` (ancres home tant que les pages P3 n'existent pas — commentaire
`TODO P3 : pointer /comment-ca-marche et /resultats`) ; CTA `Button variant="accent"`
« Vérifier mon loyer » (copy deck) → `/diagnostic` ; lien « Se connecter » (`TODO_COPY`,
libellé hors deck — déjà acté en P0) → `/login`. Mobile : nav repliée derrière un bouton
hamburger accessible (`aria-expanded`), composant client minimal.

- [ ] **Step 7 : `SiteFooter.tsx`** — nav complète (mêmes liens + « Mentions légales » →
`/legal`, `TODO P3`) + squelette légal R124 mot pour mot du copy deck §5, marqué `[AVOCAT]` en
commentaire : « TropPayé est une marque de {RAISON SOCIALE}, société par actions simplifiée —
activité de recouvrement amiable de créances pour le compte d'autrui déclarée auprès du
procureur de la République de {ville} (art. R124-1 et s. CPCE) — assurance RC professionnelle
{assureur} — médiateur de la consommation : {organisme}. » Les `{placeholders}` restent tels
quels. Pastille TP (marque secondaire) + `brand.baseline`.

- [ ] **Step 8 : `Logo.tsx` — remplacement EN PLACE par le logotype v2 arbitré**

Remplacer le contenu de `apps/web/components/brand/Logo.tsx` par le wordmark v2 (copie du
`LogoA` SVG de `apps/web/app/design-lab/directions/v2/identite/logos.tsx` : Outfit 800 via
`font-display`, surligneur `accent` sous « Payé », `fill-current`) en gardant le nom exporté
`Logo` → tous les consommateurs (diagnostic, mandat, espace, guides, login) basculent d'un
coup, pas deux patterns. `Stamp.tsx` inchangé (déjà sur tokens : il prend le rouge chaud v2
tout seul) — règle d'usage v2 rappelée en JSDoc : verdict gagné + réseaux + OG UNIQUEMENT.

- [ ] **Step 9 : Vérifier + commit**

Run: `pnpm typecheck && pnpm lint && pnpm --filter @troppaye/web build` — verts.
Grep : aucun `#` hex ni `style={{` dans `apps/web/components/ui/`. Contrôle visuel du logo sur
`/login` et `/guides` (surligneur jaune sous « Payé »).

```bash
git add apps/web/components/ui apps/web/components/brand/Logo.tsx
git commit -m "feat(ui): composants de base charte v2 (Button, Field, QuittanceCard, StepBadge, Frise, Header/Footer) + logo v2"
```

---

### Task 4: Animation d'entrée hero — CSS keyframes pur dans `globals.css`

**Files:**
- Modify: `apps/web/app/globals.css` (fin de fichier)

- [ ] **Step 1 : Keyframes + classes utilitaires (code exact)**

Stagger total 0,6–0,9 s, une seule fois (animation CSS au chargement, jamais gatée sur
l'hydratation React — le LCP n'attend pas), `fill-mode: both` (état initial sans flash) :

```css
/* Reveal d'entrée du hero (charte v2 §4) — CSS pur, une fois, jamais gaté sur React. */
@keyframes tp-reveal {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
.reveal-1, .reveal-2, .reveal-3 { animation: tp-reveal 0.45s ease-out both; }
.reveal-2 { animation-delay: 0.18s; }
.reveal-3 { animation-delay: 0.36s; }
@media (prefers-reduced-motion: reduce) {
  /* Contenu visible immédiatement, sans translation. */
  .reveal-1, .reveal-2, .reveal-3 { animation: none; }
}
```

- [ ] **Step 2 : Vérifier + commit**

Run: `pnpm --filter @troppaye/web build` — vert. Contrôle visuel : recharger `/` (le reveal ne
s'appliquera qu'en Task 5) ; vérifier qu'aucun style global n'a bougé.

```bash
git add apps/web/app/globals.css
git commit -m "feat(motion): reveal d'entrée hero en CSS keyframes pur (.reveal-1/2/3, reduced-motion safe)"
```

---

### Task 5: MAJ de la home actuelle — SiteHeader/SiteFooter + reveal (cohérence minimale)

**Files:**
- Modify: `apps/web/app/page.tsx`

PAS la refonte (elle arrive en P2) : on aligne juste le chrome et on retire une violation v2.

- [ ] **Step 1 : Brancher le chrome** — remplacer le `<header>` local par `<SiteHeader />` et
ajouter `<SiteFooter />` ; le `<main>` garde le hero actuel (`brand.hero.*`, CTA → `/diagnostic`).
- [ ] **Step 2 : Retirer le `<Stamp />` du hero** — la charte v2 INTERDIT le tampon sur la home
(réservé verdict gagné + réseaux + OG). À la place : `QuittanceCard` spécimen minimal (mêmes
3 lignes fictives que `sections-specimen.tsx` v2 : « Loyer hors charges » 102 185 c /
« Plafond légal (gel DPE F/G) » 95 000 c / « Différence mensuelle » 7 185 c en `highlight`,
total « Trop-perçu sur la période » 143 700 c, libellés `TODO_COPY` hérités du témoin) —
première consommation réelle du composant signature.
- [ ] **Step 3 : Appliquer le reveal** — `.reveal-1` sur le h1, `.reveal-2` sur sous-titre+CTA,
`.reveal-3` sur la carte spécimen.
- [ ] **Step 4 : Vérifier + commit**

Run: `pnpm typecheck && pnpm --filter @troppaye/web build` — verts. Contrôle visuel `/` :
chrome v2, reveal une fois (puis plus rien au re-render), mode OS « réduire les animations » →
tout visible sans mouvement. Supprimer l'import `Stamp` mort.

```bash
git add apps/web/app/page.tsx
git commit -m "feat(home): chrome SiteHeader/SiteFooter + carte-quittance spécimen + reveal (pré-refonte P2)"
```

---

### Task 6: Vérifications finales de la phase

- [ ] **Step 1 :** `pnpm typecheck && pnpm lint && pnpm test && pnpm --filter @troppaye/web build` — verts.
- [ ] **Step 2 :** Matrice visuelle : `/` (v2), `/diagnostic` (tokens v2 hérités, logo v2),
`/design-lab/directions/v2/*` (inchangées), `/design-lab/directions/archive/d1/*` (palette ET
polices v1 fidèles), `archive/d2`, `archive/d3` (inchangées).
- [ ] **Step 3 :** `git diff main --stat` : uniquement `globals.css`, `directions.css`,
`layout.tsx` (racine + directions), `tokens.ts`, `components/ui/**`, `components/brand/Logo.tsx`,
`app/page.tsx`.
- [ ] **Step 4 :** Reduced-motion vérifié sur `/` et sur le verdict témoin v2.
- [ ] **Step 5 :** Mettre à jour la charte si un écart d'exécution est apparu (sinon rien) ;
signaler à Lyes que P2 peut démarrer.
