# T2 — Diagnostic public + page verdict — Design

**Date** : 2026-06-10
**Tranche** : T2 (plan MVP `docs/superpowers/plans/2026-06-10-troppaye-mvp.md`)
**État amont** : couche données T2 déjà livrée (providers Géoplateforme + ADEME réels,
`diagnosticSchema` zod, `toSnapshot`, server actions `searchAddressAction` /
`lookupDpeAction` / `submitDiagnostic`, moteur durci). **Manque l'UI** (questionnaire +
page verdict) + 2 correctifs de fond.

## Décisions de cadrage (tranchées par le fondateur)

1. **Parcours verdict** : verdict chiffré affiché **immédiatement** après soumission,
   lecture par **cookie de session** (`tp_session`, mono-appareil). L'email est demandé
   plus tard (étape T3 « je veux récupérer »), PAS avant le verdict. → friction minimale,
   on montre la valeur d'abord.
2. **Détail loyers** : le questionnaire collecte loyer initial + loyer actuel (requis) et
   propose un **historique de révisions daté optionnel**. Si l'historique est fourni →
   verdict précis ; sinon repli sur initial/actuel (synthèse, confiance MEDIUM).
3. **Champs inconnus** : optionnels → le moteur renvoie `INSUFFICIENT_DATA` sur la règle
   concernée, la page verdict affiche `missingData` en **relance** (« ajoutez X pour
   chiffrer »). Maximise la complétion.

## Problèmes de fond à corriger (pré-requis de justesse)

### P1 — `currentRentCents` jamais propagé au moteur (bug de justesse confirmé)

`toSnapshot` mappe l'historique des loyers depuis `initialRentCents + revisions[]` mais
**ignore `currentRentCents`**. Or la règle IRL (`irl-overcharge.ts:60`) ne calcule un
trop-perçu **que si `rentHistory` contient au moins un événement `REVISION`**. Donc un
locataire qui paie aujourd'hui plus que permis mais ne saisit aucune révision datée
obtient « rien à signaler » **à tort**.

**Correctif** : garantir que `currentRentCents` apparaît comme **dernier événement de
loyer**. Si `currentRentCents` diffère du dernier loyer connu (initial, ou dernière
révision saisie), `toSnapshot` ajoute un événement `REVISION` synthétique :
- `rentCents = currentRentCents`
- `source = "déclaratif"` → la règle IRL en déduit naturellement une confiance `MEDIUM`
  (pas de quittance) — honnête.
- `date` = **anniversaire de bail le plus récent ≤ asOf** (proxy défendable de la date de
  révision réelle, inconnue). Si `leaseSignedAt` absent → repli sur `asOf`.

La dérivation de date est **logique pure et testable** → elle vit dans le moteur
(`packages/rules-engine/src/internal/dates.ts`, fonction `mostRecentAnniversaryISO`),
testée en TDD (le moteur a la discipline 100 %). `toSnapshot` (web, sans suite de tests)
reste mince : il appelle le helper et ajoute l'événement. `toSnapshot` reçoit désormais
`asOf` en second paramètre (le seul appelant, `submitDiagnostic`, l'a déjà sous la main).

Estimation **conservatrice** assumée : un seul événement courant daté à l'anniversaire
récent sous-compte potentiellement la fenêtre de 3 ans → on l'affiche comme estimation
MEDIUM avec relance « ajoutez vos quittances pour affiner ». Pas de surestimation.

### P2 — Lecture anonyme du verdict bloquée par la RLS

La policy `verdicts_select_own` exige `auth.uid()` ; un diagnostic anonyme ne peut pas
relire son propre verdict. `submitDiagnostic` retourne `{ verdictId }` jamais consommé
(dead code).

**Correctif** : nouvelle fonction serveur `getVerdictForSession(verdictId)` (dans
`apps/web/lib/diagnostic/verdict-read.ts`) :
1. lit le `verdict` par id via **service_role** (bypass RLS, comme l'écriture) ;
2. lit le `dossier` parent (`dossier_id`) ;
3. compare `dossier.session_token` au cookie `tp_session` ; **ne retourne le verdict que
   si égalité**. Sinon `null` → la page fait `notFound()`.

C'est le même modèle de confiance que `submitDiagnostic` (anonyme par conception, gardé
par le cookie de session signé httpOnly). Exception assumée au principe « toute Server
Action = withAuth » : le diagnostic est public par nature ; la garde est le `session_token`,
pas `auth.uid()`.

## Architecture & flux

```
/diagnostic (questionnaire, client)
  Étape 1  Adresse        → searchAddressAction (debounce) → AddressSuggestion
  Étape 2  Logement       → surfaceM2, meublé
  Étape 3  DPE            → lookupDpeAction (n° ou adresse) → classe, ou « je ne sais pas »
  Étape 4  Bail           → leaseSignedAt
  Étape 5  Loyers         → initialRentCents, currentRentCents
  Étape 6  Révision       → clause (oui/non/?), trimestre de référence (optionnel)
  Étape 7  (optionnel)    → historique de révisions datées
  Étape 8  Récapitulatif  → submitDiagnostic
        │  (autosave localStorage à chaque étape ; restauré au montage ; purgé au succès)
        ▼
  submitDiagnostic → toSnapshot(asOf) → evaluateAll → insert dossier+verdict (service_role)
        │  retourne { verdictId }
        ▼
  router.push(/diagnostic/[verdictId])
        ▼
/diagnostic/[verdictId] (server component)
  getVerdictForSession(verdictId)  (service_role + check cookie tp_session)
        │  notFound() si pas de match
        ▼
  <VerdictView> : outcome + Stamp + total (count-up, reduced-motion) + cartes par règle
                  (audit trail) + bloc « pistes » (signals, NON chiffré) + CTA T3 (placeholder)
```

## Composants & fichiers

### Moteur (`packages/rules-engine`)
- `src/internal/dates.ts` : **+ `mostRecentAnniversaryISO(anchorISO, asOf)`** (pure).
- `src/internal/dates.test.ts` : + cas (anniversaire passé/futur dans l'année, 29 févr.,
  ancre postérieure à asOf, ancre = asOf).
- `src/labels.ts` (**nouveau, pur**) : `RULE_LABEL`, `OUTCOME_LABEL`, `formatEur(cents)` —
  **mutualisés** entre `cli/verdict.ts` et la page verdict web (fin du doublon CLAUDE.md).
  `cli/verdict.ts` est refactoré pour importer depuis `labels.ts`.

### Web — data (`apps/web/lib`)
- `diagnostic/schema.ts` : `toSnapshot(input, asOf)` → injection `currentRentCents` (P1).
- `diagnostic/verdict-read.ts` (**nouveau**) : `getVerdictForSession` (P2).
- `diagnostic/format.ts` (**nouveau**) : ré-export client-safe de `formatEur` +
  `<Amount cents favorable />` helpers de présentation (Spline Sans Mono, `.tabular`,
  couleur `refund` si favorable).

### Web — questionnaire (`apps/web/app/diagnostic`)
- `page.tsx` : remplace le placeholder, monte `<Questionnaire />`.
- `questionnaire/Questionnaire.tsx` (client) : orchestre les étapes + barre de progression.
- `questionnaire/use-diagnostic-form.ts` : état (`DiagnosticInput` partiel) + autosave
  localStorage + validation par étape (zod partiel).
- `questionnaire/steps/*.tsx` : `AddressStep`, `HousingStep`, `DpeStep`, `LeaseStep`,
  `RentStep`, `RevisionStep`, `RevisionHistoryStep` (optionnel), `RecapStep`.
- `questionnaire/fields/*.tsx` : `TextField`, `MoneyField` (saisie € → centimes),
  `DateField`, `ChoiceField` (oui/non/?), `AddressAutocomplete`. Réutilisent les classes
  du pattern existant (`login-form.tsx` : `rounded-field border-line bg-paper focus:…`).
- **Découpage strict < 200 lignes/fichier** (CLAUDE.md) : un fichier par étape/primitive.

### Web — page verdict (`apps/web/app/diagnostic/[verdictId]`)
- `page.tsx` (server) : `getVerdictForSession` → `notFound()` ou `<VerdictView>`.
- `VerdictView.tsx` : composition (outcome, total, cartes, signals, CTA).
- `VerdictHero.tsx` (client) : `Stamp` qui tombe (`motion` + `stampSpring`) + count-up du
  total, court-circuité par `useReducedMotion` (hook JS, car le CSS ne couvre pas le JS).
- `RuleCard.tsx` : une règle (libellé, montants, base légale, `computation.steps`,
  `actionDeadline`, `missingData` en relance, badge `todoVerifier`). Subsidiaire → affiché
  « déjà compté dans X », **jamais additionné**.
- `use-reduced-motion.ts` : hook `matchMedia('(prefers-reduced-motion: reduce)')`.
- `opengraph-image.tsx` (**stretch**) : OG statique via `next/og`.

### Séparation des 3 régimes (non négociable)
Les montants recouvrables (gel F/G + IRL) vivent dans les **cartes chiffrées**. Les
`signals[]` (décence / interdiction de louer G-2025/F-2028) vont dans un **bloc « pistes »
visuellement distinct**, sans euros, libellé « orientation, non chiffré ». Jamais de
fusion d'un signal avec un total.

### Convention `/design-lab`
Variantes du **hero verdict** (le morceau le plus sensible) produites sous
`apps/web/app/design-lab/` pour arbitrage par le fondateur. La version par défaut câblée
dans le flux réel est la recommandée ; les autres sont archivables.

## Séquence de build (tranches verticales, chacune démontrable)

- **Slice A — « le verdict s'affiche »** : P1 (helper moteur + tests TDD) + `labels.ts`
  mutualisés + P2 (`getVerdictForSession`) + page verdict serveur (sans animation). Démo :
  un diagnostic soumis affiche son verdict. Ferme le dead code `verdictId`.
- **Slice B — « le questionnaire »** : étapes + primitives + autosave + câblage
  `submitDiagnostic` → redirect. Démo : parcours complet `/diagnostic` → verdict.
- **Slice C — « la mise en scène »** : tampon + count-up + `useReducedMotion` + audit trail
  + bloc signals + variantes `/design-lab`. Démo : verdict fini.
- **Slice D — (stretch)** : OG image.

## Vérifications par palier
`pnpm --filter @troppaye/rules-engine test` (TDD vert) · `pnpm typecheck` (moteur + web) ·
`pnpm --filter @troppaye/web build`. Revue adversariale multi-agents avant clôture.
Vérification visuelle navigateur = faite par le fondateur (commande fournie).

## Hors scope T2 (assumé)
- Règle `DEPOSIT_LATE` : aucun champ dépôt collecté par ce questionnaire (moment différent,
  fin de bail). Reste `INSUFFICIENT_DATA`/non affichée. À traiter ultérieurement.
- Capture email, mandat, signature = T3.
- Chiffrement applicatif des pièces = tranche dédiée.

## Registre TODO_VERIFIER / [AVOCAT] touché
- Copie juridique de la page verdict : mentions « estimation informative, pas un conseil
  juridique » (déjà dans le CLI) reprises **telles quelles** ; aucun texte juridique
  improvisé. Montants réglementaires affichés portent le badge `todoVerifier`.
