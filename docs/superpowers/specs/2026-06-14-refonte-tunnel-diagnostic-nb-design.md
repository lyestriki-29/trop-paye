# Refonte du tunnel diagnostic — dévoilement guidé + DA néubrutaliste

> Spec validée le 2026-06-14. Branche : `feat/da-neubrutalist-public`.
> Compagnon visuel : maquettes dans `.superpowers/brainstorm/44934-1781395699/content/`
> (`flux-mecanique-v2.html`, `verdict-climax-v3.html`).

## 1. Objectif

Refondre le parcours diagnostic (`apps/web/app/diagnostic/`) pour :
1. coller à la nouvelle DA **néubrutaliste pastel** déjà déployée sur le site public ;
2. le rendre **plus fluide** : supprimer l'effet « liste de courses » en **révélant les
   champs progressivement** ;
3. être **force de proposition** (pré-remplissage, anticipation, micro-guidage),
   sans jamais casser la logique métier (zod / Server Actions / moteur pur).

## 2. Décisions validées (brainstorming 2026-06-14)

| Sujet | Décision |
|---|---|
| Modèle d'interaction | **Dévoilement guidé** : un seul pattern qui **remplace** le stepper ET la page-unique. |
| Périmètre | **Tunnel + écrans de résultat**, livrés en **2 phases** (A : tunnel ; B : verdict). |
| Force de proposition | Pré-remplir+confirmer · anticipation sans chiffre · micro-guidage. |
| Montant € pendant le tunnel | **Zéro €** avant le verdict. Jauge d'anticipation **non monétaire** ; le count-up € arrive au submit, sur la page verdict. |
| Fourchette verdict | Afficher **base → maximum** sous le total (déjà calculée par le moteur, `VerdictRange`). |
| Économie future | Affichée **dans l'encadré vert**, sous le total. |

## 3. Contraintes non négociables (rappel)

- **Principe n°3** : un montant n'apparaît qu'avec règle + base légale + calcul +
  **score de confiance**, dossier complet. ⇒ aucun euro pendant la saisie.
- **3 régimes distincts** : gel F/G ≠ bouclier 3,5 % ≠ décence (jamais chiffrée).
  La page verdict garde sa séparation actuelle (signaux d'orientation non chiffrés).
- **Logique intacte** : `buildPayload` produit exactement le même objet → le contrat
  `diagnosticSchema` / `submitDiagnostic` / `rules-engine` ne change pas.
- **Copy** : titres/aides du copy-deck §2 restent **verbatim**. Toute micro-copy
  nouvelle est marquée `TODO_COPY` / « brouillon ». `[AVOCAT]` jamais modifié.
- Montants en **Spline Sans Mono `tabular-nums`**, vert `refund` si en faveur du locataire.
- **`prefers-reduced-motion`** respecté sur toutes les transitions de dévoilement.
- RGPD : pas de log PII, adresse utilisée uniquement pour les données publiques.

## 4. Modèle d'interaction — dévoilement guidé

Réf. visuelle : `flux-mecanique-v2.html`.

- **Colonne vertébrale = 5 chapitres** : Adresse · Logement · Loyer · Bail · Récap.
  Rail de progression nb en haut (chapitre fait / en cours / à venir).
- **À l'intérieur d'un chapitre, les questions se dévoilent une par une.**
  - On répond → le bloc se **replie en « confirmé »** (carte nb compacte, **éditable
    d'un clic**) et la question suivante **glisse à l'écran** (fade + translate,
    désactivé en reduced-motion → fondu simple).
  - **Pilule / choix unique** → **avance automatique**.
  - **Champ libre** (surface, montants, date) → petit bouton **« Continuer »** (ou Enter).
- **Fantôme du suivant** : un placeholder discret annonce la question à venir.
- **Bandeau d'anticipation non monétaire** : « Plus que ~N infos avant votre
  estimation » + jauge `progress(draft)` (% de complétude). Aucun €.
- **Chapitre Récap** : tous les blocs confirmés, éditables ; bouton **« Voir mon
  résultat »** → `submit()` → redirection verdict (où tombe le count-up €).

### Modèle de données du graphe

`question-graph.ts` (remplace `tunnel-steps.ts`) :

```ts
interface Question {
  id: string;
  chapter: ChapterId;                       // "address" | "housing" | "rent" | "lease" | "recap"
  render: (p: StepProps) => ReactNode;      // réutilise les composants de champ existants
  isAnswered: (d: DiagnosticDraft) => boolean;
  revealWhen?: (d: DiagnosticDraft) => boolean; // dépendance conditionnelle (ex : coloc)
  autoAdvance?: boolean;                     // pilule = true ; champ libre = false
  summary?: (d: DiagnosticDraft) => string; // texte du bloc « confirmé » replié
  optional?: boolean;                       // facultatif (replis moteur)
}
interface Chapter { id: ChapterId; title: string; }
```

Le moteur de dévoilement dérive l'état (questions répondues / active / à venir) **du
`draft`**, pas d'un index d'étape figé → cohérent avec l'autosave et l'édition arrière.

### Cartographie des questions (backbone Phase A)

Dérivée des champs `DiagnosticDraft` et des steps actuels. Aucun champ retiré.

- **Adresse** : `address` (AddressAutocomplete IGN — auto-advance à la sélection).
- **Logement** : **DPE auto-fetch dès l'adresse** pré-remplit `dpe.class`/`dpe.date` +
  **`surfaceM2`** + **`constructionPeriod`** (blocs confirmés éditables, cf. §7bis) ·
  `furnished` (pilule) · `roomCount`/`roomCountUnknown` (pilule) · `isShared` → si oui :
  `tenantCount` (pas-à-pas), `rentBasis` · repli DPE manuel/« je ne sais pas »
  (`dpeUnknown`) si l'ADEME ne renvoie rien.
- **Loyer** (chapitre le plus dense, ex-`RentStep`) : si coloc → `rentBasis`
  (total / ma part) · `rentInputMode` (HC/CC) · `initialRentCents` (loyer de départ) ·
  `currentRentCents` (loyer actuel) → si CC : `chargesCents` (pré-rempli barème,
  `chargesEstimated`) · **dépôt de garantie** (`depositPaidMonths` boutons 1/2/3 ou
  « autre » → `depositPaidCents` ; coloc à la part → montant exact) · `rentSupplement`
  (oui/non/nsp) → si oui : `rentSupplementCents`, `rentSupplementExceptional`,
  `complementCriteria` (checklist 3DS, F/G coché d'office depuis le DPE).
- **Bail** : `leaseSignedAt` (MonthYear) · `revisionClause` →
  `revisionQuarter`/`revisionQuarterUnknown` · **historique des hausses**
  (`revisions` ou éditeur anniversaire `anniversaryRents`/`noIncreaseDates`, facultatif).
- **Récap** : synthèse + submit.

> Note : le dépôt de garantie est capté **dans le tunnel** (chapitre Loyer). Le
> `DepositModule` post-verdict est une surface distincte (booster), restylée en Phase B.
> Le chapitre Loyer est le plus dense (loyer ×2, charges, dépôt, complément + 3DS) :
> c'est là que la décomposition en questions atomiques demande le plus de soin.

## 5. Direction artistique nb

Réutilise le système `.nb` existant (`apps/web/app/globals.css`), **aucune couleur neuve** :

| Token | Valeur | Usage |
|---|---|---|
| `--color-ink` / `--color-nb-ink` | `#2A2118` | bords (2–3 px) + texte, brun-encre chaud |
| `--color-paper` | `#FFFEFB` | fond cartes |
| `--color-accent` (= `acid`) | `#FFD84D` | surligneur jaune, pilule active, bande CTA |
| `--color-violet` | `#CBBFEF` | en-têtes, badges d'étape |
| `--color-pink` | `#F4CDD9` | accents secondaires |
| `--color-refund` | `#0C8F63` | montants en faveur du locataire |

- Cartes : bord franc + **ombre dure décalée** (`box-shadow: 6px 6px 0`), cf. `.nb-card`.
- `/diagnostic` enveloppé dans le **scope `.nb`** (déjà prévu par le commentaire CSS).
- **Nouvelles primitives de champ nb** (n'existent pas encore) : `nb-field` / `nb-pill`
  (bord franc, ombre dure, accent sur l'état actif). Les composants `fields.tsx`
  (Text/Money/Date/MonthYear/Choice) reçoivent ces variantes.
- Tous les montants en **mono `tabular`**.

## 6. Architecture composant

**On NE touche pas :**
- `use-diagnostic-form.ts` (état, autosave, `submit`, **`buildPayload`**, anniversaires).
- `diagnosticSchema`, `submitDiagnostic` (withAuth), `packages/rules-engine`.
- Flux verdict : sélection des 4 états, `VerdictSequenceLive` (count-up), modules
  capture/boosters/dépôt.

**On remplace :**
- `tunnel-steps.ts` → `question-graph.ts` (questions atomiques).
- `Questionnaire.tsx` (stepper) → **moteur de dévoilement guidé** (blocs confirmés +
  actif + fantôme + rail + jauge). Découpé pour rester < ~200 lignes/fichier
  (moteur / rail+jauge / bloc confirmé / graphe).
- **Suppression** de `QuestionnaireOnePage.tsx`, du paramètre `?vue=page`
  (`page.tsx`) et de la prop `onePage` → convergence sur un seul pattern.

**On restyle sous `.nb` :**
- `fields.tsx` + (si besoin) `components/ui/Field`, `components/ui/Button` en variante nb.
- Composants d'étape (Address/Housing/Dpe/Rent/Lease/Revision/RevisionHistory/Recap)
  réorganisés en questions atomiques + habillage nb. La recherche DPE devient une
  sous-séquence du graphe.

## 7. Force de proposition — mécanique

- **Pré-remplir + confirmer** : DPE auto-récupéré (ADEME), charges au barème
  (`chargesEstimated`), trimestre de révision déduit → rendus comme **blocs
  « confirmés » pré-remplis**, corrigeables d'un clic. S'intègre nativement au dévoilement.
- **Anticipation sans chiffre** : `progress(draft)` (fonction pure, testée) alimente la
  jauge « plus que ~N infos ». Jamais de montant.
- **Micro-guidage** : aides courtes par question + chemins « je ne sais pas » partout
  (existants), raccourcis (pilules), restylés nb.

## 7bis. Réduction de la saisie clavier (validé 2026-06-14)

Objectif : **ne taper que ce que nous ne pouvons pas deviner**. De ~9 champs tapés
aujourd'hui → **2 incontournables** (loyer actuel + recherche d'adresse), parfois 3.

**Levier 1 — Cascade DPE (auto-remplir dès l'adresse).** La recherche DPE est
déclenchée **juste après l'adresse** ; l'API ADEME renvoie `surfaceM2` et
`anneeConstruction`. On pré-remplit, en blocs « confirmés » éditables :
- `dpe.class` + `dpe.date` (déjà) ;
- **`surfaceM2`** ← `dpe.surfaceM2` ;
- **`constructionPeriod`** ← mapping de `dpe.anneeConstruction` (fonction pure
  `constructionPeriodFromYear(year)` : <1946 / 1946-1970 / 1971-1990 / >1990).
- Reste à saisir dans « Logement » : **0 frappe** (meublé, pièces, coloc = pilules).
- Si plusieurs résultats DPE → une sélection (tap) ; un seul → auto-sélection ;
  échec/aucun → on retombe sur les pilules + saisie manuelle existantes.

**Levier 2 — Frappe → tap.**
- `tenantCount` : `TextField` numérique → **pas-à-pas / pilules** 2·3·4·5·6+.
- `revisionQuarter` : **pré-sélectionné** depuis le mois de signature
  (`quarterFromMonthISO(leaseSignedAt)`), `revisionQuarterUnknown` par défaut ;
  l'utilisateur ne touche que s'il diffère.
- Hausses annuelles : chip **« augmentation légale (IRL ≈ X €) »** en un tap, à côté
  de « Pas de hausse » et « Autre montant ». Le montant indexé vient d'un helper
  `irlIndexedRentCents(baseCents, fromQuarter, toQuarter, irlSeries)` ; il faut donc
  exposer les valeurs IRL au client (server action `getIrlSuggestion` ou valeurs
  passées au montage). **Dépendance à plomber** ; si trop lourd, le chip est
  dégradable en « Pas de hausse / Autre montant » sans bloquer la phase.

**Levier 3 — Raccourcis.**
- `initialRentCents` : pilule **« Identique — jamais augmenté »** qui recopie
  `currentRentCents`. Sinon saisie.
- `chargesCents` : déjà pré-rempli au barème (`estimateMonthlyChargesCents`).
- Numéro DPE : la recherche à l'adresse en fait un repli rare.

**Incompressible (on garde la saisie) :** `currentRentCents` (cœur), recherche
d'adresse (quelques lettres + tap), `initialRentCents` (souvent évité par le raccourci).

> Tous les pré-remplis restent **`TODO_VERIFIER`** : on **affiche** ce que renvoie le
> DPE / le barème / l'IRL, l'utilisateur **valide**. Jamais une valeur imposée silencieusement.

## 8. Page verdict (Phase B)

Réf. visuelle : `verdict-climax-v3.html`.

- `/diagnostic/[verdictId]` enveloppé `.nb` ; header + cartes + modules restylés nb.
- **Quittance** (carte bord franc, en-tête violet) qui se remplit ligne par ligne ;
  le count-up existant est conservé, habillage nb (surligneur, tampon).
- **Bloc vert à deux étages** : total récupérable (retenu) + **économie de loyer à
  venir** (`totalFutureMonthlySavingCents`, affiché seulement si > 0).
- **Fourchette** sous le total (carte nb) : base → **« jusqu'à » maximum**, barre
  base/max + légende « hypothèse complément de loyer, montant prudent par défaut,
  confirmé à l'instruction ». Affichée **seulement si `range.isRange`**.
- **Badge de confiance** (HIGH/MEDIUM/LOW) accolé au montant (principe n°3).
- États COMPLIANT / orientation / INSUFFICIENT_DATA : mêmes contenus, habillage nb ;
  les **signaux d'orientation restent non chiffrés** et séparés.
- Données chiffrées = **TODO_VERIFIER** (illustratives dans les maquettes).

## 9. Périmètre & phases

- **Phase A — Tunnel** : `question-graph.ts` + moteur de dévoilement + primitives nb +
  convergence (suppression one-page) + jauge `progress` + blocs pré-remplis confirmés.
  Livrable testable de bout en bout : adresse → submit → redirection verdict.
- **Phase B — Verdict** : scope `.nb` + restyle `VerdictView` & modules + count-up nb +
  fourchette + économie dans le vert.

Chaque phase = palier testable (typecheck + tests verts + smoke runtime par Lyes).

## 10. Tests & non-régression

- `buildPayload` identique ⇒ **76 tests `rules-engine` restent verts** + `pnpm typecheck`.
- **Nouveaux tests Vitest** (fonctions pures) : ordre de dévoilement du graphe,
  `isAnswered` / `revealWhen`, `progress(draft)`, `summary(draft)`.
- Playwright e2e **absent du repo** (mémoire) → non ajouté ici, noté en suite.
- Smoke runtime fait par **Lyes** (mémoire : ne pas lancer le navigateur soi-même).

## 11. Hors scope & risques

- **Hors scope** : refonte du copy juridique (réutiliser verbatim), ajout d'une suite
  e2e Playwright, back-office. Le `DepositModule` post-verdict est **restylé** en Phase B,
  pas refondu fonctionnellement.
- **Risque principal** : la décomposition en questions atomiques doit préserver
  **chaque champ et chaque `valid()`**. Mitigation : table de correspondance §4.5,
  `buildPayload` inchangé comme filet, tests de complétude.
- **Risque copy** : ne pas paraphraser le copy-deck §2 ; réutiliser les titres verbatim.
- `.superpowers/` à ajouter au `.gitignore`.
