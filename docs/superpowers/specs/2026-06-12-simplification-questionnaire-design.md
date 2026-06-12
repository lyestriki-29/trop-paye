# Spec — Simplification du questionnaire + fourchette + mini-tunnel dépôt

**Date** : 2026-06-12 · **Branche** : feat/refonte-phase2
**Exécution** : Codex 5.5 xhigh par tranches · **Revue** : Claude (diff + typecheck + tests)
**Décisions produit** : arbitrages Lyes 2026-06-12 (ce fil)
**Audit amont** : `docs/audit-2026-06-12-concurrence-et-calculs.md`

## Objectif
Réduire la friction du diagnostic (8 écrans → 5, boutons partout, « je ne sais
pas » systématique) SANS perdre de vérification, et transformer le verdict en
**fourchette honnête basse/haute** + mise en avant de la **baisse de loyer**.
Étalon confirmé par l'audit : les simulateurs officiels (Paris, Lille, DRIHL,
ANIL) tiennent en 4-9 questions quasi 100 % en choix fermés, zéro champ libre,
zéro compte. Aucun concurrent n'affiche de trop-perçu cumulé ni de fourchette :
double différenciateur.

## Principe directeur
La précision n'est plus un péage AVANT le verdict, c'est un jeu APRÈS. Tout ce
qui peut être estimé (replis moteur déjà codés : déduction trimestre IRL,
interpolation d'historique, barème de charges, dépôt en mois) nourrit une
**borne haute** ; ce qui est certain nourrit la **borne basse**. Les cartes
post-verdict « affinez » resserrent la fourchette.

---

## Partie 1 — Moteur : fourchette à deux scénarios

### Comportement
Aujourd'hui le moteur rend des montants uniques (`recoverableCents`,
`totalRecoverableCents`). On ajoute une évaluation **basse** et **haute** :

- **Scénario bas (prudent / « plancher sûr »)** : toute entrée estimée ou
  inconnue est neutralisée (ne rapporte rien). Ex. complément « je ne sais
  pas » → 0 ; charges au barème → on prend l'hypothèse la moins favorable au
  locataire ; historique interpolé → borne basse de l'interpolation.
- **Scénario haut (« potentiel »)** : les estimations sont appliquées
  (complément à 9 %, charges au barème, dépôt au nombre de mois déclaré…).

Le verdict expose alors une fourchette `[totalRecoverableLowCents,
totalRecoverableHighCents]`. Si bas == haut (aucune estimation en jeu),
l'UI affiche un montant unique, pas une fausse fourchette.

### Complément de loyer = source PRINCIPALE de fourchette (décision Lyes 2026-06-12)
Constat : **les locataires ne savent souvent pas s'ils ont un complément**, ni
si leur loyer saisi l'inclut. On ne peut donc pas leur demander un « loyer hors
complément » fiable. La fourchette absorbe cette incertitude, et **résout le
risque de double-comptage** (complément ↔ loyer de base) relevé en revue :

- **Borne basse (plancher garanti)** : le complément n'est **jamais** chiffré
  séparément (on suppose le loyer saisi « tout compris »). → zéro double-comptage,
  montant sûr quoi qu'il arrive.
- **Borne haute (potentiel)** : le complément est chiffré quand il est déclaré
  OUI **ou** NSP et que le contexte le rend illégal (F/G ou critère 3DS),
  montant déclaré sinon estimation 9 %.
- **L'équipe vérifie le bail réel ensuite** (back-office) et tranche entre les
  deux bornes. Le locataire incertain n'est jamais bloqué.

`toSnapshotRange` construit donc deux snapshots qui diffèrent sur
`rentSupplementDeclared` : `undefined` en bas, `true` en haut (quand OUI/NSP).
NON explicite → pas de complément dans les deux bornes.

### Forme retenue (à confirmer au plan, défaut recommandé)
**Deux passes sur le snapshot**, pas de réécriture des règles : l'agrégateur
construit deux `DossierSnapshot` (bas/haut) à partir d'un snapshot annoté des
champs estimés, appelle `evaluateAll` deux fois, et compose la fourchette.
Avantages : les règles restent pures et inchangées, chaque borne garde son
**audit trail complet** (on justifie les deux chiffres ligne à ligne, exigence
non négociable n°3). Le `VerdictGlobal` gagne `totalRecoverableLowCents` /
`totalRecoverableHighCents` (et idem par règle si besoin d'affichage détaillé).
La baisse de loyer (`totalFutureMonthlySavingCents`) existe déjà : on la
calcule sur le scénario **bas** (engagement prudent).

### Marqueur des entrées estimées
Le snapshot porte déjà `rentEstimated` et `rentReconstructedFromShare`. On
ajoute la notion d'estimation au complément et au dépôt-en-mois (cf. parties
3 et 4). Chaque entrée estimée est tracée dans la `ComputationTrace` (label +
todoVerifier) pour que la page « Méthode » et l'admin sachent quoi resserrer.

### Tests (rules-engine, Vitest, 100 %)
- Snapshot sans estimation → low == high (pas de fourchette).
- Snapshot avec complément NSP → low exclut le complément, high l'inclut à 9 %.
- Monotonie : high ≥ low pour chaque cas chiffré.
- Audit trail présent et non vide sur les deux bornes.
- Baisse de loyer = scénario bas.

---

## Partie 2 — Tunnel principal : 8 écrans → 5

Fusions (modéré, validé) :

| # | Écran | Contenu | Saisie clavier en cas nominal |
|---|---|---|---|
| 1 | Adresse | autocomplete IGN (inchangé) | l'adresse |
| 2 | Logement + DPE | meublé O/N, coloc O/N (+ nb si oui), DPE auto ADEME ou « je ne sais pas » | aucune |
| 3 | Loyer | loyer actuel + initial, HC/CC en boutons, dépôt versé en boutons 1/2/3 mois/autre/NSP, complément OUI/NON/NSP | les 2 montants |
| 4 | Bail | date signature (mois/année), clause révision O/N/NSP, « le loyer a-t-il augmenté ? » O/N/NSP (boutons par année si oui) | aucune |
| 5 | Récap → verdict | relecture (inchangé) | aucune |

Règles de conception :
- **Tout choix fermé porte « Je ne sais pas »** (étalon officiel) ; chaque NSP
  s'appuie sur le repli moteur déjà codé (déduction, interpolation, barème).
- Les écrans fusionnés réutilisent les steps existants comme sous-sections, pas
  de réécriture des champs (les composants DateField/MoneyField/ChoiceField et
  la validation zod restent les sources de vérité).
- Le brouillon localStorage et l'autosave 400 ms sont conservés.
- Aucune création de compte avant le verdict (inchangé, déjà le cas).

### Tests (web)
- Parcours nominal (appartement seul, non meublé, DPE connu) atteint le verdict
  en 5 écrans, 0 champ libre hors adresse + 2 montants.
- Chaque NSP produit un snapshot valide et un verdict non bloquant.
- Les validations bloquantes existantes restent vertes (régression schema).

---

## Partie 3 — Écran Loyer : dépôt en mois, complément simplifié

### Dépôt versé (plafond DEPOSIT_CAP, distinct du retard LOT 3)
Boutons **1 mois / 2 mois / 3 mois / autre (montant) / je ne sais pas**.
Conversion mois → centimes sur le **loyer initial hors charges**. En
colocation à la part (`rentBasis = "SHARE"`), pas de presets mois (le loyer
reconstruit est le total du logement) → montant exact ou NSP.

### Complément de loyer (révisé 2026-06-12 — décision Lyes)
Aujourd'hui : checklist 9 critères 3DS + montant, traité en **signal non
chiffré**. On le rend chiffrable, mais **uniquement quand il est récupérable
en droit** (Lyes : « seulement illégal, mais réfléchir à s'ils sont
justifiables : parfois ils n'ont pas lieu d'être »).

**Nouvelle règle moteur `COMPLEMENT_OVERCHARGE`** (versionnée au 24/08/2022,
`legalBasisStatus: AVOCAT_PENDING`, prescription 3 ans) :
- **Logement F/G, bail postérieur au 24/08/2022** → complément **interdit**
  (loi Climat) → récupérable **certain** → compte dans la **borne basse**.
- **Hors F/G mais non justifiable** (aucune caractéristique exceptionnelle de
  confort/localisation, ou critère 3DS rédhibitoire coché) → **contestable** →
  compte dans la **borne haute** seulement (potentiel, charge de preuve au
  bailleur).
- **Complément justifié** (atouts réels, hors F/G) → 0 chiffré, **signal**
  « à faire vérifier » conservé.
- **Montant** : `rentSupplementCents` si connu ; sinon **estimation 9 % du
  loyer** comme proxy (borne haute), valeur `TODO_VERIFIER` (aucune source
  publique trouvée à l'audit). Toujours affiché « estimation », jamais promis.

**Question UI (décision Lyes 2026-06-12)** — on inverse la logique : au lieu de
demander OUI/NON sur le complément abstrait, on demande au locataire si son
logement a des **caractéristiques exceptionnelles** (ce qu'il sait juger), avec
**exemples** affichés. Détail juridique sourcé :
`docs/recherche-2026-06-12-complement-de-loyer.md`.

1. « Payez-vous un complément de loyer ? » OUI / NON / NSP.
2. Si OUI : « Votre logement a-t-il une de ces caractéristiques
   exceptionnelles ? » avec exemples (cases ou OUI/NON) :
   *vue exceptionnelle (monument, panorama), terrasse ou très grand balcon,
   jardin privatif, hauteur sous plafond exceptionnelle, prestations haut de
   gamme rares, exposition/luminosité exceptionnelle.* Libellé brouillon,
   exemples NON limitatifs, [AVOCAT].

Qualification (charge de preuve au bailleur) :
- **F/G ou critère 3DS rédhibitoire coché** → complément **interdit** →
  borne basse (répétition 3 ans).
- **Hors F/G + AUCUNE caractéristique exceptionnelle** → **contestable** →
  borne haute SI bail ≤ 3 mois (sinon forclusion probable → signal seul).
  ⚠️ garde-fou de date : la contestation du caractère justifié se prescrit à
  **3 mois après signature** (CDC), distinct de la répétition 3 ans du F/G.
- **Au moins une caractéristique exceptionnelle déclarée (hors F/G)** →
  probablement justifié → 0 chiffré, **signal** « à faire vérifier ».
- NSP au complément → borne basse 0, borne haute = estimation si F/G.

La checklist 3DS d'interdiction détaillée reste accessible en carte
post-verdict « affinez » pour confirmer l'interdiction.

⚠️ Cette règle ajoute une **tranche moteur dédiée** (Tranche 2bis) AVANT
l'écran loyer, car elle chiffre une répétition juridiquement sensible :
validation [AVOCAT] obligatoire avant prod.

### Tests
- Helper pur de conversion mois → centimes (loyer initial HC), coloc exclue.
- Complément OUI/NON/NSP → effet attendu sur low/high.
- 9 % tracé `TODO_VERIFIER` dans l'audit trail.

---

## Partie 4 — Verdict : fourchette + baisse de loyer en avant

Deux bénéfices affichés au même niveau hiérarchique (prolonge le commit
624afbd) :
- **« Récupérable : entre X € et Y € »** (Spline Sans Mono, tabular-nums, vert
  refund). Montant unique si low == high.
- **« Votre loyer baisse d'environ Z €/mois »** dès mise en conformité
  (`totalFutureMonthlySavingCents`, scénario bas), aussi visible que la
  récupération.

En dessous, cartes **« affinez pour resserrer la fourchette »** : checklist
3DS, date de bail exacte, historique réel, montant exact du dépôt, quittances
(plus tard). Chaque réponse resserre visiblement la fourchette. Réutilise la
mécanique boosters existante (merge remplaçant, re-`evaluateAll` serveur,
verdict versionné).

### Tests
- Verdict avec estimations → affiche une fourchette ; sans → montant unique.
- Baisse de loyer affichée quand > 0.
- `prefers-reduced-motion` respecté (compteurs).

---

## Partie 5 — Mini-tunnel dépôt « logement quitté » (LOT 3)

Reprend le plan `2026-06-12-lot3-mini-tunnel-depot.md`, **tout en boutons** :
- Date remise des clés en presets (« moins d'1 mois / 1 à 2 mois / 2 à 6 mois /
  plus de 6 mois », date exacte optionnelle pour resserrer).
- EDL conforme O / N / NSP.
- Dépôt 1 / 2 / 3 mois / autre.
- Remboursé NON / PARTIEL / TOTAL.
- **+ « Avez-vous transmis votre nouvelle adresse au bailleur ? » O/N/NSP**
  (correction audit : la pénalité 10 %/mois ne court pas sans nouvelle adresse,
  art. 22 ; sinon NON → pénalité exclue de la borne basse).
- **Colocation exclue** (le module ne se rend pas).
- L'imprécision de la date est absorbée par la fourchette (la pénalité
  10 %/mois donne naturellement une borne basse et une borne haute).

Le moteur `DEPOSIT_LATE` reste inchangé (validé exact par l'audit). Seule
nuance à encoder : l'exception « nouvelle adresse ».

---

## Séquençage d'implémentation (tranches verticales)
1. **Moteur fourchette** (types + agrégateur deux passes + tests) — testable
   hors ligne, fondation de tout le reste.
2. **Écran Loyer** (dépôt en mois + complément OUI/NON/NSP) + intégration
   fourchette dans toSnapshot.
3. **Fusion tunnel 5 écrans** + « je ne sais pas » systématiques.
4. **Verdict** (affichage fourchette + baisse de loyer en avant + cartes affiner).
5. **Mini-tunnel dépôt** (LOT 3 boutons + exception nouvelle adresse).

Chaque tranche : Codex exécute, Claude relit le diff + `pnpm typecheck` +
`pnpm test`, on ne passe à la suivante qu'au vert.

## Hors périmètre (lots séparés)
- **Surloyer encadrement** (gisement n°1 de l'audit, faisabilité Paris prouvée)
  : spec et ingestion dédiées après cette simplification.
- **[AVOCAT] / backlog** : revalorisation honoraires 01/01/2026 (versionner
  AGENCY_FEES_CAP), réactivité IRL 1 an, bouclier 3,5 %, interdiction G2025/
  F2028, source réelle du 9 % complément.

## Risques
- La fourchette « deux passes » suppose des bornes monotones par cas : à
  vérifier cas par cas dans les tests (un cas non monotone fausserait
  l'ordre low/high → garde-fou `low = min, high = max`).
- Le 9 % non sourcé est un pari produit : tracé TODO_VERIFIER + AVOCAT, à
  remplacer dès qu'une source existe. Ne jamais le présenter comme un droit.
