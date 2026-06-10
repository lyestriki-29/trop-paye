# Spec — Améliorations du questionnaire de diagnostic

**Date** : 2026-06-10 · **Statut** : design validé (brainstorm avec Lyes) · **Précède** : refonte UI/UX (track séparé)

## Contexte & objectif

Retours de la première vérification visuelle du tunnel `/diagnostic` : quatre frictions qui
dégradent la qualité des saisies (donc des verdicts) et une confusion UX sur la sélection du
DPE. Objectif : fiabiliser l'entrée de données **sans toucher à la pureté du moteur** — toute
estimation est explicite, tracée dans l'audit trail, et plafonne la confiance.

## 1) Résultats DPE reconnaissables + confirmation de sélection

**Problème** : les candidats ADEME affichés (classe, date, surface) sont indistinguables entre
logements d'une même adresse ; après « Choisir », la liste disparaît sans confirmation visible.
Le choix EST stocké dans le brouillon — bug de **feedback**, pas de perte de donnée.

**Décisions** :
- `lib/providers/dpe.ts` : étendre `SELECT` avec `numero_etage_appartement`,
  `complement_adresse_logement`, `complement_adresse_batiment`, `nom_residence`,
  `type_batiment`, `annee_construction` (champs vérifiés dans le schéma ADEME
  `dpe03existant`). Étendre `DpeResult` (champs optionnels).
- `DpeStep` : libellé descriptif par résultat — ex. « **Classe E** · Appartement · 3ᵉ étage ·
  Bât. A · 45 m² · Résidence Les Tilleuls · établi le 04/05/2021 » (champs absents omis).
- Carte « **DPE sélectionné** » (remplace la liste après le choix) : classe + libellé fin +
  bouton « Changer » qui relance la recherche. `aria-live="polite"` sur la confirmation.
- La saisie manuelle et « Je ne connais pas mon DPE » restent inchangées.

## 2) Loyer « charges comprises » → hors charges estimé

**Problème** : le moteur exige le loyer hors charges (HC) ; beaucoup de locataires ne
connaissent que le charges comprises (CC).

**Décisions** (option validée : « demander les charges, sinon estimer ») :
- `RentStep` : sélecteur « Mes montants sont : **hors charges** / **charges comprises** »
  (`rentInputMode`). Les deux montants (départ + actuel) partagent le même mode.
- Si CC : champ « Charges mensuelles » (`chargesCents`) **pré-rempli** =
  `surfaceM2 × 2,50 €/m²/mois` (constante `CHARGES_ESTIMATE_EUR_PER_M2_CENTS = 250`,
  **TODO_VERIFIER** — à remplacer par une source documentée), modifiable.
  Mention : « Estimation — ajustez si vous connaissez le montant exact (quittance). »
- Conversion dans `toSnapshot` (le moteur ne voit que des HC) via helper **pur**
  `packages/rules-engine/src/internal/charges.ts` : `hcCents = ccCents − chargesCents` ;
  invalide si `chargesCents ≥ ccCents` (erreur bloquante côté UI + zod).
- Drapeau `chargesEstimated` (true si l'utilisateur n'a pas modifié la valeur pré-remplie)
  → `DossierSnapshot.rentEstimated?: boolean` → les règles chiffrées (IRL, gel DPE)
  **plafonnent la confiance à MEDIUM** + ligne d'audit « loyers HC estimés depuis CC ».

## 3) Trimestre IRL : « Je ne sais pas »

- `RevisionStep` : option « Je ne sais pas » → trimestre **déduit du mois de signature du
  bail** (janv–mars→T1, avr–juin→T2, juil–sept→T3, oct–déc→T4), stocké avec
  `revisionQuarterSource: "DEDUCED"` (vs `"BAIL"`), tracé dans l'audit de la règle IRL.
  Pas de double pénalité de confiance (saisie déjà déclarative).
- Sans date de bail : `revisionQuarter` reste vide (comportement actuel de la règle).

## 4) Historique des hausses par année anniversaire

**Problème** : l'éditeur libre (« + Ajouter une hausse ») est abstrait pour le locataire.

**Décisions** :
- Si `leaseSignedAt` connu : générer **une ligne par anniversaire du bail** (de N+1 jusqu'à
  aujourd'hui). Chaque ligne : montant € **ou** bouton « Pas de hausse cette année »
  (= aucun événement ajouté, le loyer précédent court toujours).
- Dates fixes (anniversaire exact) en v1 ; un cas atypique passe par le mode libre.
- Repli : sans date de bail → éditeur libre actuel conservé tel quel.
- `buildRentHistory` inchangé (les années « pas de hausse » ne produisent pas de REVISION).

## Données & schéma

- `use-diagnostic-form.ts` (brouillon) : + `rentInputMode?`, `chargesCents?`,
  `chargesEstimated?` — champs additifs, clé localStorage `tp_diagnostic_draft_v1` conservée.
- `lib/diagnostic/schema.ts` : zod étendu + conversion CC→HC dans `toSnapshot` ;
  refus `charges ≥ cc`.
- Moteur : `types.ts` + `rentEstimated?` ; règles IRL/gel DPE : plafond MEDIUM si drapeau.

## Tests (Vitest)

- `charges.test.ts` : conversion exacte (centimes), bornes (charges ≥ cc ⇒ invalide),
  estimation au m².
- Déduction du trimestre : table 12 mois → 4 trimestres.
- `toSnapshot` : propagation du drapeau + montants convertis.
- Non-régression `rent-history` (suite existante intacte).

## Hors scope

- Refonte UI/UX globale (track B dédié, brainstorm séparé).
- Barème de charges documenté (source réelle à valider — remplacera le placeholder 2,50 €/m²).
- DPE multiples / historique de DPE par logement.
