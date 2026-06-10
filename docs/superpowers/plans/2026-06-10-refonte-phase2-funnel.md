# Phase 2 — Chemin de conversion : Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking. **Prérequis : Phase 1 mergée.**

**Goal:** Funnel complet en charte v2 : home réelle (sections v2 promues et enrichies §5),
tunnel diagnostic restylé avec états dégradés, capture email+téléphone AVANT verdict (table
`leads` deny-all), page verdict à 4 états avec séquence signature + prescription + partage OG
anonymisé, tunnel mandat restylé — mesuré (Lighthouse mobile ≥ 90, axe AA).

**Architecture:** La home = promotion des sections de
`apps/web/app/design-lab/directions/v2/home/*` vers `apps/web/components/home/*` (le design-lab
reste intact, mémoire du duel). La capture est une **porte sur la route verdict existante**
(`/diagnostic/[verdictId]` rend l'écran capture tant qu'aucun lead n'existe pour le dossier) :
pas de nouvelle URL, retry non destructif, deep-link sûr. L'écriture `leads` suit le pattern de
`app/diagnostic/actions.ts` : Server Action service-role qui valide le cookie `tp_session`
contre `dossiers.session_token` (cf. `lib/diagnostic/verdict-read.ts`). L'OG vit dans
`/api/og/[verdictId]` (next/og, polices statiques, couleurs JS de `@troppaye/shared` — v2
depuis P1).

**Tech Stack:** Next.js 16, Tailwind 3.4, motion v12, `next/og`, Supabase (migrations SQL +
service-role), zod, Playwright + `@axe-core/playwright`, TS strict.

**Spec:** `docs/superpowers/specs/2026-06-10-refonte-site-public-design.md` (Phase 2)
**Contraintes transverses (toutes tasks)** : copy **mot pour mot** du
`docs/copy-deck-troppaye.md` — tout manque → `TODO_COPY` (+ `[AVOCAT]` si sensible), jamais
d'improvisation ; montants en centimes, mono `tabular` ; pas de log de PII ; tokens uniquement,
aucun style inline ; max ~200 lignes/fichier ; `prefers-reduced-motion` partout ;
mocks signature/LRE/paiement inchangés ; chiffres publics réels ou rien ;
`pnpm typecheck` après chaque modification.

---

### Task 1: Variantes /design-lab — « comment ça marche » ×2 et barème/slider ×2 (BLOQUANT)

**Files:**
- Create: `apps/web/app/design-lab/sections/comment-ca-marche/page.tsx` (+ `variante-a.tsx`, `variante-b.tsx`)
- Create: `apps/web/app/design-lab/sections/bareme/page.tsx` (+ `variante-a.tsx`, `variante-b.tsx`)

Process charte §8 : 2 variantes comparables par section, arbitrage Lyes, promotion de la
retenue, archivage des autres dans `/design-lab/archive`. **Les Tasks 3 (section steps) et 8
(barème mandat) ne s'implémentent qu'après cet arbitrage.**

- [ ] **Step 1 : « Comment ça marche » ×2** — copy deck §1 verbatim (Vérifiez / Mandatez-nous /
Récupérez). Variante A : 3 cartes arrondies + icônes (l'existant v2, enrichi densité §5 — chaque
carte porte un artefact : mini-quittance, trait de signature, liasse billets stylisée aplats
ink/line). Variante B : frise horizontale numérotée 01/02/03 (kickers mono) avec filets
documentaires et un spécimen central. Données fictives, `DirectionTheme` non requis (tokens
racine = v2 depuis P1).
- [ ] **Step 2 : Barème/slider ×2** — copy deck §3 verbatim : « Si nous récupérons {X} € → vous
recevez {0,75X} €, notre commission est de {0,25X} €. » + rappel « Rien récupéré ? Rien payé.
Vous pouvez arrêter à tout moment. » (`[AVOCAT]` pour les conditions d'arrêt). Slider
`input[type=range]` (500 € → 5 000 €, pas 50 €), montants recalculés via
`brand.commissionRateBps`, mono `tabular`. Variante A : carte-quittance (lignes récupéré /
votre part `highlight` / commission, total `refund`). Variante B : double barre proportionnelle
75/25 + gros chiffres. Accessible (label, `aria-valuetext` en euros).
- [ ] **Step 3 : Vérifier + commit + ARBITRAGE**

Run: `pnpm typecheck && pnpm --filter @troppaye/web build` — verts.

```bash
git add apps/web/app/design-lab/sections
git commit -m "feat(design-lab): variantes comment-ca-marche x2 + bareme/slider x2 (arbitrage P2)"
```

**STOP : demander l'arbitrage de Lyes (1 variante par section) avant Tasks 3 et 8.**

---

### Task 2: Perf préalable — rendu statique des surfaces publiques

**Files:**
- Modify: `apps/web/next.config.ts` · Modify: `apps/web/app/page.tsx`

- [ ] **Step 1 :** La home ne doit dépendre d'aucune donnée par requête hors compteur. Le
compteur (Task 3) sera lu avec revalidation : `export const revalidate = 300` sur `app/page.tsx`
(ISR — statique + rafraîchi toutes les 5 min, AUCUNE donnée dossier sur cette surface). Ne PAS
activer `cacheComponents` globalement (commentaire `next.config.ts` : les surfaces dossiers
restent dynamiques).
- [ ] **Step 2 :** Vérifier : `pnpm --filter @troppaye/web build` → la route `/` apparaît
statique/ISR (`●`/`○`) dans la sortie de build, PAS `ƒ`.
- [ ] **Step 3 :** Commit `perf(home): rendu statique ISR de la home avant mesure Lighthouse`.

---

### Task 3: Home réelle — promotion des sections v2 enrichies (§5) + hero câblé

**Files:**
- Create: `apps/web/components/home/Hero.tsx`, `HeroAddress.tsx` (client), `Steps.tsx`,
  `Confiance.tsx`, `CompteurPublic.tsx` (client), `Passoires.tsx`, `Faq.tsx`, `CtaFinal.tsx`
- Create: `apps/web/lib/public-stats.ts`
- Modify: `apps/web/app/page.tsx` · Modify: `apps/web/app/diagnostic/questionnaire/AddressAutocomplete.tsx`

- [ ] **Step 1 : Promouvoir les sections v2** depuis
`app/design-lab/directions/v2/home/sections-*.tsx` vers `components/home/` (copie adaptée :
imports `@/components/ui/*` de P1 — `Button`, `QuittanceCard`, `Marker` extrait dans
`components/ui/Marker.tsx` —, plus de `DirectionTheme`, ids d'ancres `#comment-ca-marche`,
`#resultats`). Le design-lab v2 reste INTACT.
- [ ] **Step 2 : Enrichir selon charte §5 (chaque section porte un artefact riche)** :
hero → carte-quittance spécimen (pile + rotation + tampon filigrane « Spécimen ») ; steps →
variante arbitrée en Task 1, chaque carte avec son artefact ; confiance → compteur réel
count-up au scroll-into-view une fois (`CompteurPublic`, motion + `useReducedMotion`) ;
passoires → blocs F/G + citation sourcée loi Climat art. 159 (lien Légifrance, base légale du
moteur — pas de texte improvisé) ; FAQ → 2 extraits sûrs du deck verbatim ; CTA final → fond
`accent`, champ adresse re-câblé. Kickers mono numérotés, rythme plein/aéré alterné.
- [ ] **Step 3 : Hero « tape l'adresse » câblé sur le VRAI AddressAutocomplete.**
Dans `AddressAutocomplete.tsx`, ajouter des props optionnelles `appearance?: "form" | "hero"`
(hero : sans `FieldShell`, input pilule XL, label sr-only « Où habitez-vous ? » — copy deck §2)
et `placeholder?` (hero : « 12 rue de la République, Lyon », deck §2). Zéro changement de
logique (débounce, anti-réponse-périmée, `searchAddressAction`). Puis `HeroAddress.tsx` :

```tsx
"use client";
const DRAFT_KEY = "tp_diagnostic_draft_v1";
const STEP_KEY = "tp_diagnostic_step_v1";

function prefillDraft(address: AddressSuggestion) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const draft = raw ? (JSON.parse(raw) as Record<string, unknown>) : { revisions: [] };
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ revisions: [], ...draft, address }));
    localStorage.setItem(STEP_KEY, "1"); // le tunnel reprend à l'étape SUIVANTE
  } catch { /* localStorage indisponible : le tunnel repartira de l'étape adresse */ }
}
// onSelect={(a) => { prefillDraft(a); router.push("/diagnostic"); }}
```

`/diagnostic` en accès direct reste le parcours complet depuis l'étape adresse (comportement
actuel de `use-diagnostic-form.ts`, inchangé).
- [ ] **Step 4 : Compteur public réel ou ABSENT** — `lib/public-stats.ts` : service-role,
`sum` des `fund_movements` de reversement locataire + `count` des dossiers en recouvrement
(relire les enums exacts dans `supabase/migrations/0001_init.sql` avant d'écrire la requête).
Retour `null` si les deux valent 0 → `Confiance` rend le bloc SANS la ligne compteur (jamais de
chiffre inventé, pas de placeholder en prod). Format deck : « {montant} € récupérés pour les
locataires · {n} dossiers en cours ».
- [ ] **Step 5 : Assembler `app/page.tsx`** — SiteHeader, sections dans l'ordre spec (hero →
comment ça marche → confiance près du CTA → passoires → FAQ → CTA final), reveal-1/2/3 sur le
hero, SiteFooter. `revalidate = 300` conservé.
- [ ] **Step 6 : Vérifier + commit** — `pnpm typecheck && pnpm lint && pnpm --filter
@troppaye/web build` verts ; route `/` toujours statique/ISR ; parcours réel : taper une
adresse dans le hero → `/diagnostic` s'ouvre à l'étape 2 avec l'adresse remplie ; grep : aucun
hex/`style={{` dans `components/home/`.

```bash
git add apps/web/components/home apps/web/components/ui/Marker.tsx apps/web/lib/public-stats.ts apps/web/app/page.tsx apps/web/app/diagnostic/questionnaire/AddressAutocomplete.tsx
git commit -m "feat(home): home réelle v2 — hero tape-l'adresse câblé, sections enrichies, compteur réel ou absent"
```

---

### Task 4: Tunnel diagnostic restylé + états dégradés (PAS le chantier A)

**Files:**
- Modify: `apps/web/app/diagnostic/page.tsx`, `questionnaire/Questionnaire.tsx`,
  `questionnaire/fields.tsx`, `questionnaire/steps/AddressStep.tsx`, `steps/DpeStep.tsx`
- Modify: `apps/web/app/diagnostic/actions.ts` · Modify: `apps/web/lib/providers/geo.ts`, `lib/providers/dpe.ts`

Le chantier A (logique questionnaire, schéma, étapes) a sa spec séparée : ici on RESTYLE et on
pose les jonctions. Interdit de toucher `use-diagnostic-form.ts` (hors besoin avéré) et
`lib/diagnostic/schema.ts`.

- [ ] **Step 1 : Restyle une-question-par-écran** — chrome SiteHeader allégé (logo + « Étape X
sur Y ») ; barre de progression animée (transition width, charte §4 micro-interactions) ;
boutons pilule (`Button` P1 : Continuer `primary`, Retour `ghost`) ; champs sur `Field` P1
(focus ring 2 px) ; transition d'étape slide+fade (motion, reduced-motion → fondu). Ligne
bénéfice sous la progression : `TODO_COPY` (le deck ne couvre pas « plus que N questions avant
votre estimation » — gabarit posé, texte en TODO).
- [ ] **Step 2 : Microcopy deck mot pour mot** — aligner les titres/aides d'étapes sur le deck
§2 là où il couvre : adresse (« Où habitez-vous ? » + aide « Nous utilisons votre adresse
uniquement… »), confirmation DPE (« Est-ce bien votre logement ? », boutons « C'est bien lui /
Ce n'est pas lui »), DPE introuvable (titre+texte+option du deck), loyer (« Quel est votre
loyer hors charges ? » + aide « C'est le “loyer nu”… »), augmentations (« Votre loyer a-t-il
augmenté depuis votre arrivée ? », bouton « + Ajouter une augmentation »). Le reste inchangé.
- [ ] **Step 3 : État dégradé Géoplateforme IGN indisponible** — `completeAddress` doit
distinguer ÉCHEC (réseau/5xx) de « zéro résultat » : retour
`{ ok: true; suggestions: AddressSuggestion[] } | { ok: false }` propagé par
`searchAddressAction`. Sur `ok: false`, `AddressStep` bascule en SAISIE MANUELLE (champs
adresse + ville, `banId`/`inseeCode` absents — `diagnosticSchema` les accepte déjà optionnels),
bandeau `TODO_COPY`.
- [ ] **Step 4 : État dégradé ADEME indisponible** — même mécanique sur `lookupDpeAction` :
échec ≠ introuvable. Échec → « continuer sans DPE » avec message DISTINCT du « DPE
introuvable » du deck (`TODO_COPY`) ; introuvable → copy deck existante.
- [ ] **Step 5 : Vérifier + commit** — typecheck/build verts ; parcours complet manuel (adresse
réelle → verdict) ; simuler l'échec IGN (couper le réseau ou forcer l'URL provider) → saisie
manuelle fonctionne de bout en bout.

```bash
git commit -m "feat(diagnostic): restyle v2 une-question-par-écran + états dégradés IGN/ADEME"
```

---

### Task 5: Capture email+téléphone AVANT verdict (table `leads` + porte)

> **BLOQUANT COPY [AVOCAT] : ne PAS implémenter les Steps 4-5 tant que Lyes n'a pas mis à jour
> `docs/copy-deck-troppaye.md` avec la microcopy téléphone / finalité / consentement** (le deck
> §2 « Avant verdict » ne couvre que l'email). Vérifier le deck au démarrage de la task ; s'il
> n'est pas à jour : faire Steps 1-3 (DB + action, testables), puis STOP et signaler.

**Files:**
- Create: `supabase/migrations/0003_leads.sql`
- Create: `apps/web/lib/leads/schema.ts` · Create: `apps/web/lib/rate-limit.ts`
- Create: `apps/web/app/diagnostic/[verdictId]/capture-actions.ts`, `CaptureView.tsx`
- Modify: `apps/web/app/diagnostic/[verdictId]/page.tsx`

- [ ] **Step 1 : Migration (code complet)** — puis `pnpm db:reset && pnpm db:types` :

```sql
-- 0003_leads.sql — capture email+téléphone avant verdict (spec refonte P2).
-- PII : table dédiée (PAS de colonnes sur dossiers), suppression en cascade.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  email text not null,
  phone text,                              -- optionnel au lancement
  consent_at timestamptz not null default now(),
  consent_text_version text not null,      -- version du texte affiché (traçabilité RGPD)
  purpose text not null,                   -- finalité déclarée (ex. 'envoi_resultat')
  created_at timestamptz not null default now()
);
-- 1 lead par dossier : idempotence (retry non destructif) + plafond d'écriture naturel.
create unique index idx_leads_dossier on public.leads(dossier_id);
alter table public.leads enable row level security;
-- Deny-all : AUCUNE policy. Lecture/écriture exclusivement via service_role (Server Action).
```

- [ ] **Step 2 : Schéma zod + rate-limit (code exact)** — `lib/leads/schema.ts` :

```ts
import { z } from "zod";

/** Version du texte de consentement affiché — à figer avec le copy deck [AVOCAT]. */
export const LEAD_CONSENT_VERSION = "TODO_COPY-capture-v1";

export const leadSchema = z.object({
  verdictId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().regex(/^(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}$/)
    .optional().or(z.literal("").transform(() => undefined)),
  phoneConsent: z.boolean(),
});
export type LeadInput = z.infer<typeof leadSchema>;
```

Règle : `phone` fourni ⇒ `phoneConsent === true` (consentement séparé, refus sinon).
`lib/rate-limit.ts` : fenêtre glissante en mémoire (`Map<string, number[]>`,
`checkRateLimit(key, max, windowMs)` qui purge et compte) — suffisant pour l'instance
`standalone` unique ; JSDoc : à remplacer par un compteur Postgres si scale-out. Le backstop
dur reste l'index unique `leads(dossier_id)`.
- [ ] **Step 3 : Server Action `submitLead` (pattern `actions.ts` : service-role + session)** :

```ts
"use server";
// capture-actions.ts — squelette (gardes dans cet ordre, AUCUN log de PII)
export async function submitLead(raw: unknown): Promise<{ ok: true } | { error: string }> {
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return { error: "TODO_COPY — saisie invalide" };
  if (parsed.data.phone && !parsed.data.phoneConsent)
    return { error: "TODO_COPY [AVOCAT] — consentement téléphone requis" };
  const token = await getSessionToken();
  if (!token) return { error: "TODO_COPY — session expirée" };
  if (!checkRateLimit(`lead:${token}`, 5, 10 * 60_000))
    return { error: "TODO_COPY — trop de tentatives, réessayez plus tard" };
  // Ownership : verdict → dossier → session_token === cookie (cf. verdict-read.ts), puis
  // upsert service-role sur le conflit dossier_id (retry non destructif) : email,
  // phone ?? null, consent_text_version: LEAD_CONSENT_VERSION, purpose: "envoi_resultat".
  return { ok: true };
}
```

- [ ] **Step 4 : Porte sur la route verdict** — dans `[verdictId]/page.tsx` : après
`getVerdictForSession`, lire le lead du dossier (service-role). Pas de lead → rendre
`<CaptureView>` : **verdict partiel = statut SANS montant**, copy deck §2 verbatim : titre
« Votre estimation est prête », texte « Nous avons détecté {une irrégularité probable / un
dossier conforme}. Recevez le détail complet et conservez votre dossier : » (irrégulière si
`outcome === "IRREGULAR"`, conforme sinon — le cas conforme PASSE AUSSI par la capture),
placeholder `votre@email.fr`, CTA « Voir mon résultat », dessous « Pas de spam. Désinscription
en un clic. ». Email obligatoire ; téléphone optionnel + case de consentement séparée
(microcopy : deck mis à jour par Lyes, sinon STOP). `Field` P1, `Button` P1.
- [ ] **Step 5 : Échec de soumission → retry non destructif** — erreurs de `submitLead`
affichées sous le formulaire SANS perdre les valeurs saisies ; succès →
`router.refresh()` (la porte s'ouvre, le verdict se rend).
- [ ] **Step 6 : Vérifier + commit** — typecheck/build verts ; parcours : diagnostic → capture
→ verdict ; re-soumission → upsert (pas de doublon) ; cookie absent/étranger → refus ; spam →
rate-limit ; `select` anonyme sur `leads` via l'API Supabase → 0 ligne (deny-all).

```bash
git add supabase/migrations/0003_leads.sql apps/web/lib/leads apps/web/lib/rate-limit.ts "apps/web/app/diagnostic/[verdictId]"
git commit -m "feat(capture): porte email+téléphone avant verdict — table leads deny-all, action service-role, rate-limit"
```

---

### Task 6: Page verdict réelle — 4 états, séquence v2, prescription

**Files:**
- Modify: `apps/web/app/diagnostic/[verdictId]/VerdictView.tsx`, `page.tsx`
- Create: `apps/web/app/diagnostic/[verdictId]/VerdictSequenceLive.tsx` (client),
  `VerdictUnquantified.tsx`, `VerdictCompliant.tsx`, `VerdictInsufficient.tsx`
- Create: `apps/web/lib/diagnostic/prescription.ts` · Delete/absorb: `VerdictHero.tsx`

- [ ] **Step 1 : Routage des 4 états** dans `VerdictView` (mapping exact) :
1. `outcome === "IRREGULAR"` → **chiffré** : séquence signature.
2. `outcome === "COMPLIANT" && signals.length > 0` → **non chiffré (décence/interdiction de
   louer)** : orientation partenaire, SANS montant ni count-up, séquence dégradée = simple
   fade de carte ; textes `TODO_COPY [AVOCAT]` (jamais de chiffrage automatique — 3 régimes
   distincts, CLAUDE.md).
3. `outcome === "COMPLIANT"` (sans signaux) → **conforme** : copy deck verbatim (« Bonne
   nouvelle : rien à signaler. » + texte + veille + rebond dépôt de garantie).
4. `outcome === "INSUFFICIENT_DATA"` → **insuffisant** : explication + pièces à fournir
   (`missingData` agrégés des `results`), `TODO_COPY`.
- [ ] **Step 2 : Séquence signature (état 1)** — `VerdictSequenceLive` : adapter
`design-lab/directions/v2/verdict/VerdictSequence.tsx` aux données réelles : lignes =
`computation.steps` (celles avec `cents`) de la règle principale (premier `result` IRREGULAR
non subsidiaire), rendues en `QuittanceCard` ; en-tête réf = id dossier court. Ordre charte
§4 : carte se pose → lignes s'impriment (stagger 80 ms) → **surligneur `accent` balaie le
total** → count-up (1 s, 64 px, `refund`) → CTA pilule « Récupérer mes {X} € » (montant DANS
le bouton) → **tampon claque** (scale 1.4→1, −6°, spring `motionTokens.stampSpring`) — le
SEUL écran produit où le tampon est permis. Titre deck « Vous avez trop payé. », montants
« {X} € récupérables · + {Y} €/mois d'économie à venir », confiance élevée/moyenne (deck),
`brand.disclaimer` en pied. `useReducedMotion` → tout statique, montant affiché sans count-up.
- [ ] **Step 3 : Prescription (fenêtre glissante [AVOCAT])** — `lib/diagnostic/prescription.ts` :
date affichée = `min(actionDeadline)` des `results` IRREGULAR comptés = expiration du mois le
plus ancien encore récupérable (fenêtre glissante 3 ans, `PRESCRIPTION_YEARS`). Copy deck
verbatim : « La loi limite la récupération aux 3 dernières années : passé le {date}, les mois
les plus anciens ne seront plus récupérables. » Échéance > 1 an → même phrase en mention sobre
(pas de style alerte `stamp`) ; ≤ 1 an → mise en avant sobre. Présentation marquée `[AVOCAT]`
en commentaire. Tests unitaires du calcul (Vitest) si la logique dépasse le simple `min`.
- [ ] **Step 4 : Verdict introuvable/expiré → page dédiée** — `getVerdictForSession` null ET
pas de teaser (Task 7) → écran dédié (logo, explication `TODO_COPY`, CTA « Vérifier mon
loyer » → `/`) au lieu du `notFound()` générique.
- [ ] **Step 5 : Vérifier + commit** — typecheck/build verts ; 4 états contrôlés via
`pnpm db:seed-demo` (compléter le seed si un état manque) ; reduced-motion OK ; détail par
fondement (`RuleCard`) et signaux conservés sous la séquence.

```bash
git commit -m "feat(verdict): 4 états réels — séquence signature v2 (surligneur, count-up, tampon), prescription, page expirée"
```

---

### Task 7: Partage + OG anonymisée (`/api/og/[verdictId]`) + teaser public

**Files:**
- Create: `apps/web/app/api/og/[verdictId]/route.tsx` · Create: `apps/web/assets/fonts/` (TTF statiques)
- Create: `apps/web/lib/diagnostic/verdict-teaser.ts`
- Create: `apps/web/app/diagnostic/[verdictId]/ShareActions.tsx`, `TeaserView.tsx`
- Modify: `apps/web/app/diagnostic/[verdictId]/page.tsx`

- [ ] **Step 1 : Polices statiques PAR GRAISSE** — télécharger depuis Google Fonts (licence
OFL, committables) les fichiers **statiques** (PAS les variables : satori ne les lit pas) :
`Outfit-ExtraBold.ttf` (800), `SplineSansMono-Medium.ttf` (500) → `apps/web/assets/fonts/`.
- [ ] **Step 2 : Lecture teaser ANONYMISÉE** — `verdict-teaser.ts` : service-role, SANS session
(surface publique) : `{ outcome, amountCents | null, kindLabel | null, city | null }`.
`kindLabel` = libellé court du premier fondement IRREGULAR (réutiliser les labels de
`packages/rules-engine/src/labels.ts`, en ajouter si absents) ; `city` = ville seule extraite
de `address_label` (motif `/\b\d{5}\s+(.+)$/`) — **JAMAIS `address_label` brut** ni numéro/rue.
UUID validé en entrée (regex existante de `verdict-read.ts`).
- [ ] **Step 3 : Route OG (squelette exact)** — `next/og` (PAS `@vercel/og`), couleurs via les
constantes JS v2 de `@troppaye/shared` (satori ignore variables CSS et Tailwind) :

```tsx
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { colors } from "@troppaye/shared";
import { getVerdictTeaser } from "@/lib/diagnostic/verdict-teaser";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ verdictId: string }> }) {
  const { verdictId } = await ctx.params;
  const teaser = await getVerdictTeaser(verdictId);
  if (!teaser || teaser.amountCents === null) return new Response("Not found", { status: 404 });
  const dir = path.join(process.cwd(), "assets/fonts");
  const [outfit, mono] = await Promise.all([
    readFile(path.join(dir, "Outfit-ExtraBold.ttf")),
    readFile(path.join(dir, "SplineSansMono-Medium.ttf")),
  ]);
  return new ImageResponse(
    /* Gabarit charte §3 : logotype + montant mono surligné `accent` + tampon coin bas droit.
       Contenu : montant + kindLabel + city — JAMAIS l'adresse. Styles JSX inline OBLIGATOIRES
       ici (satori) : exception documentée à la règle « pas de styles inline ». */
    <div style={{ width: "100%", height: "100%", background: colors.paper, color: colors.ink }}>…</div>,
    { width: 1200, height: 630, fonts: [
      { name: "Outfit", data: outfit, weight: 800, style: "normal" },
      { name: "Spline Sans Mono", data: mono, weight: 500, style: "normal" },
    ] },
  );
}
```

- [ ] **Step 4 : Teaser public pour les tiers** — dans `[verdictId]/page.tsx` : session absente
ou non propriétaire MAIS verdict existant → `<TeaserView>` (montant/type/ville du teaser, CTA
« Vérifier mon loyer » → `/`, `TODO_COPY` pour l'accroche) — jamais les données du dossier ; le
verdict complet reste lié au cookie. + `generateMetadata` : `openGraph.images =
[/api/og/{verdictId}]` (uniquement si état chiffré).
- [ ] **Step 5 : Boutons de partage** — `ShareActions` (client) sur le verdict gagné : Web
Share API si dispo, sinon copie du lien (`navigator.clipboard`), libellés `TODO_COPY`.
- [ ] **Step 6 : Vérifier + commit** — `GET /api/og/<uuid-seed>` rend un PNG correct (palette
chaude, montant mono, AUCUNE adresse) ; navigation privée sur l'URL verdict → teaser ; UUID
inconnu → 404 (OG) / page dédiée (verdict).

```bash
git add "apps/web/app/api/og" apps/web/assets/fonts apps/web/lib/diagnostic/verdict-teaser.ts "apps/web/app/diagnostic/[verdictId]"
git commit -m "feat(partage): OG next/og anonymisée (polices statiques, tokens v2) + teaser public + Web Share"
```

---

### Task 8: Tunnel mandat restylé — barème slider, upload, confirmation frise

**Files:**
- Modify: `apps/web/app/mandat/[dossierId]/page.tsx`, `MandateForm.tsx`, `PiecesUpload.tsx`

- [ ] **Step 1 : Barème slider** — intégrer la variante ARBITRÉE en Task 1 dans `MandateForm`,
initialisée sur le `recoverableCents` réel du dossier ; copy deck §3 verbatim (+ rappel
`[AVOCAT]` conditions d'arrêt). Signature : mock maison inchangé, textes mandat deck §3
(« Dernière étape : votre mandat » … `[AVOCAT]`).
- [ ] **Step 2 : Upload** — copy deck §3 (« Vos documents », « Une photo lisible suffit. »,
items bail/quittances) ; statut par pièce (badge `refund` reçu / `ink/60` attendu / `stamp`
refusé) ; micro-animation « la pièce se classe » (motion, layout, reduced-motion → état final).
- [ ] **Step 3 : Confirmation** — copy deck §3 verbatim (« C'est parti. » + texte 48 h) +
`Frise` P1 initialisée (Dossier transmis ✓ → Vérification en cours `current` → étapes à venir,
libellés `TODO_COPY` alignés sur les états de `dossier-state-machine`).
- [ ] **Step 4 : Vérifier + commit** — typecheck/build verts ; tunnel complet sur un dossier
seedé (mandat → pièces → confirmation), mobile + desktop.

```bash
git commit -m "feat(mandat): restyle v2 — barème slider arbitré, upload par pièce, confirmation frise"
```

---

### Task 9: Critères de fin P2 (protocole exact de la spec)

**Files:**
- Modify: `apps/web/package.json` (scripts) · Create: `apps/web/tests/a11y.spec.ts`

- [ ] **Step 1 : Funnel complet cliquable** mobile (viewport 375px) + desktop, AVEC mocks
(signature/LRE/paiement, conformément au CLAUDE.md) : home → hero adresse → diagnostic →
capture → verdict → mandat → confirmation. Vérification manuelle + parcours Playwright existant
mis à jour si besoin.
- [ ] **Step 2 : Lighthouse mobile ≥ 90 sur la home en build PROD** — commande documentée dans
le repo, script `apps/web/package.json` :
`"lighthouse:home": "lighthouse http://localhost:3000 --form-factor=mobile --screenEmulation.mobile --only-categories=performance --output=html --output-path=lighthouse-home.html"`
(exécution : `pnpm --filter @troppaye/web build && pnpm --filter @troppaye/web start` puis
`pnpm dlx lighthouse@latest …` mêmes flags). Score < 90 → corriger (images, JS hero, polices)
avant de cocher.
- [ ] **Step 3 : axe AA sans violation** — devDep `@axe-core/playwright` ; `a11y.spec.ts`
balaye `/`, `/diagnostic`, l'écran capture, le verdict (4 états via seed), `/mandat/[id]` ;
`expect(violations).toEqual([])` en WCAG 2.1 AA. Contraste à surveiller : texte sur `accent`
toujours `ink` (charte §2).
- [ ] **Step 4 : OG validée dans les debuggers de partage** — opengraph.xyz + envoi WhatsApp
réel + carte X sur l'URL de preview : image rendue, montant lisible, AUCUNE adresse. Captures
archivées dans la PR.
- [ ] **Step 5 : Clôture** — `pnpm typecheck && pnpm lint && pnpm test && pnpm --filter
@troppaye/web build` verts ; liste des `TODO_COPY`/`[AVOCAT]` restants compilée et remise à
Lyes ; rappel déploiement : bascule EN BLOC du funnel (jamais ancien/nouveau mélangés en prod).

```bash
git add apps/web/package.json apps/web/tests
git commit -m "test(p2): protocole de fin — lighthouse home, axe AA funnel, OG debuggers"
```
