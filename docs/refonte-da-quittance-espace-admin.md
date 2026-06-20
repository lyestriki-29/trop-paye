# Refonte DA « Quittance » — Espace client + Admin

**Décision (Lyes, 2026-06-20)** : appliquer la **Direction 1 « Quittance / Reçu »** (déclinée du login B, déjà en prod sur `/login`) à **tout l'espace client ET l'admin**. Aucune DA sobre. Assume le retour sur « nb = public only » : on étend le scope `.nb` aux surfaces authentifiées.

> Aperçu validé : ex-routes `/login-preview` et `/espace-admin-preview` (supprimées). Le login `/login` est déjà refait en vrai (réf. `login/page.tsx` + `login-form.tsx`).

## 1. Spec DA Quittance (le vocabulaire)
- **Métaphore** : chaque écran est un **reçu / dossier** — réf mono en en-tête, filet plein, **code-barres + perforation** en pied.
- **Surfaces** : `.nb-card` (bord 3px `nb-ink` + ombre dure `6px 6px 0`), fond `paper`, scope `.nb` (fond crème + grille de points).
- **Typo** : titres **Archivo Black** capitales (`.nb h1/h2`), **labels en mono** (`.nb-mono`, IBM Plex Mono) uppercase tracking-widest, corps Space Grotesk.
- **Couleur** : accent **orange `#FF7A1A`** (CTA), **vert `refund #0FA968` réservé aux montants**, pastels (violet/menthe/ciel/pink) en touches, rouge `stamp` pour alertes/états (PAUSED, LOW, altéré).
- **Composants** : `nb-pill` / `nb-pill--ink` (CTA), `nb-field` (champs), `nb-tag` (badges mono), `v3-barcode`, `border-dashed` perforation, `Amount` (mono tabular vert si favorable).
- **Briques existantes à réutiliser** : `components/ui/QuittanceCard.tsx`, `components/ui/LogoNb.tsx`, `components/ui/Stamp.tsx`, `components/ui/StepBadge.tsx`, `components/Amount.tsx`.
- **Motion** : reveal léger au montage ; **`prefers-reduced-motion` respecté** (déjà géré globalement) ; focus visibles.

## 2. Ordre d'exécution (tranches verticales)

### Tranche 0 — Primitives & chrome partagés (À FAIRE EN PREMIER, tout en dépend)
- [ ] `components/ui/QuittanceCard.tsx` : généraliser en **carte-reçu réutilisable** (props : `ref`, `title`, `children`, `footerBarcode?`). Base de tous les écrans.
- [ ] `components/ui/Field.tsx` + `components/ui/Button.tsx` : variante `.nb` (ou prop) → `nb-field` / `nb-pill`. ⚠️ **Partagés avec le tunnel diagnostic** (déjà nb) → tester le tunnel après.
- [ ] `components/Amount.tsx` : vérifier mono tabular + vert `refund` si favorable (cohérence nb).
- [ ] `app/espace/layout.tsx` + `app/espace/[dossierId]/layout.tsx` : ajouter le scope **`.nb`** (fond crème + dots) + restyler le chrome.
- [ ] `app/admin/layout.tsx` : idem scope `.nb` + nav restylée.
- [ ] `components/espace/EspaceHeader.tsx` : header en DA quittance (LogoNb + réf dossier mono).
- [ ] `components/espace/WorkspaceTabs.tsx` : onglets en pilules nb / onglets de classeur.

### Tranche 1 — Espace CLIENT (commencer par la page témoin `espace/[dossierId]/page.tsx`)
Pages :
- [ ] `app/espace/page.tsx` — liste des dossiers → cartes-reçus.
- [ ] `app/espace/[dossierId]/page.tsx` — **aperçu (témoin)** : VerdictCard + KpiStrip + Timeline + Checklist en DA quittance, montant trop-perçu vert géant, CTA prochaine étape.
- [ ] `app/espace/[dossierId]/messages/page.tsx` — fil de messages en reçus.
- [ ] `app/espace/[dossierId]/pieces/page.tsx` — dropzone + rows pièces.
- [ ] `app/espace/[dossierId]/versement/page.tsx` — IBAN + suivi versement.
- [ ] `app/espace/[dossierId]/mandat/page.tsx` — panneau mandat.
- [ ] `app/espace/compte/page.tsx` + `ProfileForm.tsx` — formulaire en DA.

Composants espace (restyler) :
- [ ] `VerdictCard`, `KpiStrip`, `DossierTimeline`, `NextStepRail`, `StudyChecklist`,
- [ ] `ContactDialog`, `MandatePanel`, `MessageThread`, `NotificationsPanel`,
- [ ] `PayoutForm`, `PayoutTracker`, `PieceRow`, `PiecesDropzone`.

### Tranche 2 — ADMIN (témoin `admin/dossiers/[id]/page.tsx`)
Pages :
- [ ] `app/admin/page.tsx` — file de revue → liste en reçus.
- [ ] `app/admin/dossiers/[id]/page.tsx` + `AdminActions.tsx` — **fiche (témoin)** : récupérable, RuleCards, preuve de signature, séquence, fonds, actions.
- [ ] `app/admin/courriers/page.tsx` + `PostForm.tsx`.
- [ ] `app/admin/pipeline/page.tsx`, `app/admin/funnel/page.tsx`.
- [ ] `app/admin/articles/page.tsx` + `generate-form.tsx`.

## 3. Critères d'acceptation (à chaque tranche)
- [ ] `pnpm typecheck` + `pnpm lint` verts.
- [ ] **Les 20 e2e restent verts** (`pnpm e2e` en cloud via `E2E_ALLOW_NONLOCAL_URL`). ⚠️ NE PAS casser les sélecteurs des specs : `getByLabel`, `getByRole`, textes (« déposer bail + quittance », « IBAN », « liste d'attente », « Enregistrer le versement », onglets espace…). Re-run après chaque tranche.
- [ ] Montants en **vert**, labels **mono**, `prefers-reduced-motion` OK, focus visibles, contrastes AA.
- [ ] **Zéro changement de logique** : Server Actions, `withAuth`, chargement des données, RLS — intacts. Refonte VISUELLE uniquement.
- [ ] Scope `.nb` additif : **ne pas casser** le tunnel `/diagnostic` ni `/mandat` (primitives Field/Button partagées).

## 4. Gotchas
- `Field`/`Button` partagés tunnel↔espace : tester `/diagnostic` après la tranche 0.
- Le `.nb` sur layouts espace/admin = revient sur « nb = public only » (assumé, décision 2026-06-20).
- Le login `/login` est DÉJÀ fait (ne pas le refaire) — il sert de référence visuelle.
- Aperçu de référence : recréer une route jetable si besoin de comparer, puis la supprimer (ne pas ressusciter `design-lab`).
