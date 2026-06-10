# TropPayé — Annexe : typologie EXHAUSTIVE des cas de récupération
### Tous les fondements permettant à un locataire de récupérer de l'argent, avec données requises et degré d'automatisation — v1.0, juin 2026

> Cette annexe complète le document « Structure du site & prérequis ». Elle remplace la liste de 5 modules par la cartographie complète des 11 cas, classés en 3 tiers selon leur automatisabilité. Chaque cas indique : la règle, les données nécessaires au moteur, le caractère binaire ou non de l'irrégularité, et le traitement (recouvrement autonome plateforme vs escalade partenaire).
> ⚠️ Les références légales et délais cités sont à faire vérifier et figer par l'avocat conseil — c'est la base de travail, pas un avis juridique.

---

## TIER 1 — Cas binaires, automatisables, recouvrement autonome (cœur du produit)

### 1. Augmentation sur passoire thermique (gel DPE F/G)
- **Règle** : depuis le 24/08/2022, aucune augmentation (révision en cours de bail, renouvellement, relocation) pour un logement classé F ou G ; complément de loyer également interdit. Base : loi Climat et résilience, art. 159 ; loi du 06/07/1989.
- **Récupérable** : tout montant payé au-delà du loyer gelé + baisse pour l'avenir.
- **Données moteur** : classe DPE (API ADEME par adresse, ou n° DPE saisi), historique des loyers (quittances), dates des augmentations.
- **Binaire** : OUI (classe F/G + augmentation post-08/2022 = irrégularité). Seule défense réelle du bailleur : un nouveau DPE meilleur après travaux → vérifiable dans la base ADEME.
- **Traitement** : recouvrement autonome.

### 2. Révision annuelle (IRL) irrégulière — 5 sous-cas
- **2a. Taux supérieur à l'IRL** : la révision ne peut excéder la variation de l'IRL du trimestre de référence du bail.
- **2b. Bouclier loyer non respecté** : variation plafonnée à 3,5 % (métropole) entre le T3 2022 et le T1 2024.
- **2c. Révision sans clause** : aucune révision possible si le bail ne contient pas de clause de révision.
- **2d. Rétroactivité illégale** : depuis la loi ALUR, la révision non appliquée dans l'année suivant sa date prend effet pour l'avenir seulement — tout « rappel » rétroactif facturé au locataire est indu.
- **2e. Mauvais indice de référence** (trimestre erroné, indice ILC/ICC appliqué par erreur).
- **Données moteur** : bail (clause de révision, trimestre de référence), série IRL INSEE, quittances/historique des loyers.
- **Binaire** : OUI — pur calcul arithmétique, le cas le plus automatisable de tous.
- **Traitement** : recouvrement autonome.

### 3. Relocation illégale en zone tendue
- **Règle** : dans les 28 agglomérations en zone tendue, le loyer d'un nouveau locataire ne peut dépasser le dernier loyer du locataire précédent (révisé IRL), sauf exceptions encadrées (travaux ≥ 1 an de loyer, loyer manifestement sous-évalué) ; le bail doit mentionner l'ancien loyer.
- **Données moteur** : commune (référentiel zones tendues), ancien loyer (mention obligatoire au bail — champ formulaire ; son absence est elle-même un signal), nouveau loyer, justification éventuelle de travaux.
- **Binaire** : OUI si l'ancien loyer est connu ; semi-binaire si le bailleur invoque une exception → escalade dans ce cas.
- **Traitement** : recouvrement autonome, escalade si exception invoquée.

### 4. Frais d'agence supérieurs aux plafonds ALUR
- **Règle** : les honoraires imputables au locataire sont plafonnés : 12 €/m² (zone très tendue), 10 €/m² (zone tendue), 8 €/m² (reste), + 3 €/m² pour l'état des lieux ; tout autre frais (dossier, rédaction de bail au-delà, « frais administratifs ») est indu.
- **Récupérable** : le dépassement, souvent 100-400 € — petit montant unitaire mais détection triviale et volume énorme.
- **Données moteur** : facture/quittance d'honoraires, surface, commune (référentiel des 3 zones).
- **Binaire** : OUI — calcul arithmétique.
- **Traitement** : recouvrement autonome (cible : l'agence, pas le bailleur — souvent plus rapide à payer, car régulée et soucieuse de sa carte professionnelle).

### 5. Dépôt de garantie non restitué ou amputé sans justificatif
- **Règle** : restitution sous 1 mois (état des lieux conforme) ou 2 mois (dégradations), retenues uniquement sur justificatifs (devis/factures) ; à défaut, **majoration de 10 % du loyer mensuel par mois de retard entamé**.
- **Récupérable** : dépôt + pénalités de retard (qui s'accumulent vite — souvent plusieurs centaines d'euros).
- **Données moteur** : dates (état des lieux de sortie, remise des clés, restitution éventuelle), montant du dépôt, justificatifs reçus ou non.
- **Binaire** : OUI sur le retard et l'absence de justificatifs ; semi-binaire sur la contestation des retenues elles-mêmes.
- **Traitement** : recouvrement autonome sur retard/pénalités ; escalade si litige sur l'état des lieux.
- **Note produit** : gisement national, indépendant de tout zonage, concerne TOUS les locataires sortants — excellent produit d'appel complémentaire au diagnostic « loyer ».

---

## TIER 2 — Cas semi-binaires : détection automatique + instruction outillée, escalade fréquente

### 6. Surface erronée (« loi Boutin location »)
- **Règle** : la surface habitable doit figurer au bail ; si la surface réelle est inférieure de plus de 5 %, le locataire peut obtenir une **diminution du loyer proportionnelle à l'écart** (art. 3-1, loi de 1989), avec effet depuis la demande (et restitution selon les cas). Délais d'action spécifiques (demande au bailleur, puis juge à défaut d'accord sous 2 mois — à figer avec l'avocat).
- **Récupérable** : différentiel de loyer — sur un loyer de 900 € avec 8 % d'écart, ~70 €/mois.
- **Données moteur** : surface au bail vs surface mesurée. Le site fournit un **guide de mesure pas à pas** (pièces, hauteur sous plafond ≥ 1,80 m, exclusions) + option diagnostiqueur partenaire pour certifier.
- **Binaire** : le calcul oui, la preuve non (mesure contestable) → certificat de mesurage recommandé avant courrier.
- **Traitement** : courrier autonome avec mesure certifiée ; escalade si contestation.

### 7. Charges locatives abusives — le gisement caché le plus massif
- **Règles** (décret n° 87-713, liste limitative des charges récupérables ; art. 23 loi 1989) :
  - **7a. Régularisation jamais effectuée** : provisions encaissées sans régularisation annuelle ni justificatifs → remboursement exigible (prescription 3 ans).
  - **7b. Charges non récupérables facturées** : gros entretien, honoraires de gestion, ravalement, mise aux normes... ne sont PAS imputables au locataire.
  - **7c. Décompte non justifié** : le bailleur doit transmettre le décompte par nature de charges et tenir les pièces à disposition ; à défaut la régularisation est contestable.
  - **7d. Forfait de charges abusif en meublé** (manifestement disproportionné).
- **Données moteur** : quittances (provisions), décomptes de régularisation (upload + OCR), type de bail.
- **Binaire** : 7a oui (provisions sans régularisation = détectable sur les seules quittances) ; 7b/7c nécessitent l'analyse du décompte → **assistant semi-automatique** : OCR du décompte + confrontation ligne à ligne à la liste du décret 87-713 + revue humaine.
- **Traitement** : recouvrement autonome sur 7a ; instruction outillée + escalade possible sur 7b/7c.
- **Note produit** : préjudice fréquent de 300 à 1 500 € sur 3 ans ; quasi aucun acteur ne le traite à l'échelle.

### 8. Complément de loyer abusif (zones encadrées)
- **Règle** : exige des caractéristiques de confort/localisation exceptionnelles ; interdit notamment si logement F/G, ou présentant certains défauts (sanitaires sur palier, signes d'humidité, DPE F/G, vis-à-vis < 10 m, etc. — critères loi 2022). **Délai de contestation : 3 mois après signature du bail** — le moteur doit alerter sur l'urgence.
- **Données moteur** : bail (montant du complément), DPE, questionnaire défauts.
- **Binaire** : NON (appréciation des « caractéristiques exceptionnelles ») sauf si DPE F/G (→ binaire, recouvrement autonome).
- **Traitement** : escalade partenaire rapide (délai court), sauf cas DPE.

### 9. Augmentation au renouvellement sans respect de la procédure
- **Règle** : pour augmenter un loyer « manifestement sous-évalué » au renouvellement, le bailleur doit notifier 6 mois avant l'échéance, avec références de loyers comparables ; à défaut, l'augmentation est inopposable et le bail se renouvelle aux conditions antérieures.
- **Données moteur** : date d'échéance du bail, date et forme de la notification reçue, contenu (références présentes ?).
- **Binaire** : OUI sur la procédure (délai, références) ; le fond (sous-évaluation) non.
- **Traitement** : recouvrement autonome si vice de procédure ; escalade sinon.

### 10. Dépassement du plafond d'encadrement (loyer de référence majoré)
- (Cas déjà au plan — rappelé ici pour exhaustivité.) Binaire une fois les arrêtés structurés ; territoires limités ; sort du dispositif à confirmer après le 23/11/2026. Traitement : recouvrement autonome.

---

## TIER 3 — Hors périmètre du recouvrement automatisé (orientation/partenaire uniquement)

### 11. Logement indécent ou insalubre
- Réduction de loyer possible mais uniquement négociée ou judiciaire, après mise en demeure et constats ; non binaire, fortement factuel. Le diagnostic peut le **détecter comme signal** (questionnaire) et orienter vers partenaire/ADIL, sans promesse chiffrée.

### Cas volontairement exclus
- Réparations payées à tort par le locataire (preuve difficile, dossier par dossier) ; requalification meublé/vide ; litiges de jouissance (troubles, travaux) ; baux commerciaux et professionnels (autre droit) ; locations saisonnières. Tous orientables vers partenaires mais hors moteur.

---

## Règles transversales que le moteur DOIT implémenter

1. **Prescriptions** — la fenêtre récupérable dépend du fondement :
   - action en répétition des loyers/charges trop versés : **3 ans** (art. 7-1, loi 1989) → le moteur calcule le trop-perçu sur la fenêtre glissante de 3 ans uniquement ;
   - contestation du complément de loyer : **3 mois** après signature ;
   - action en diminution pour surface : délais propres à l'art. 3-1 ;
   - encadrement : délais propres selon la voie (préfet / CDC / juge).
   → Chaque verdict affiche le montant récupérable **dans la fenêtre légale** et la date limite d'action (urgence = levier de conversion légitime).
2. **Versionnage temporel** : toute règle porte une date de début/fin d'applicabilité ; le droit applicable est celui de la date de signature/renouvellement/fait générateur.
3. **Cumul** : un même dossier peut combiner plusieurs fondements (ex. logement G : gel DPE + complément interdit + charges) → le moteur évalue TOUS les modules à chaque diagnostic et agrège le verdict.
4. **Hiérarchie de confiance** : chaque verdict porte un score (élevé = binaire documenté ; moyen = pièce manquante ; faible = appréciation) qui pilote le parcours (mandat direct / pièce demandée / orientation partenaire).
5. **Identification de la cible du recouvrement** : bailleur personne physique, SCI, agence (mandat de gestion) ou agence seule (frais) — le destinataire et le ton du courrier diffèrent.

## Impacts sur le site et le formulaire (compléments au doc structure)

- Diagnostic enrichi : ajout de 3 blocs optionnels « charges » (provisions + régularisations reçues ?), « entrée dans le logement » (frais d'agence payés, surface au bail) et « sortie » (dépôt de garantie, dates) — affichés progressivement pour ne pas alourdir le parcours initial de 2 minutes : le diagnostic cœur (DPE/IRL/relocation) d'abord, puis « voulez-vous aussi vérifier vos charges, vos frais d'agence, votre dépôt de garantie ? » après le premier verdict.
- Upload + OCR des décomptes de charges (Tier 2) — brique technique nouvelle à planifier (année 1 S2).
- Guide de mesure de surface interactif + réseau de diagnostiqueurs partenaires (mesurage certifié).
- Référentiels supplémentaires : zones d'honoraires ALUR (3 zones), liste du décret 87-713 structurée, dates/délais de prescription par fondement.

## Ordre de construction révisé des modules

| Vague | Modules | Justification |
|---|---|---|
| V1 (lancement) | 1. Gel DPE · 2. IRL (5 sous-cas) · 5. Dépôt de garantie | Binaires, nationaux, pérennes, données simples |
| V2 (+3 mois) | 3. Relocation zone tendue · 4. Frais d'agence | Binaires, référentiels légers |
| V3 (+6 mois) | 7a. Provisions sans régularisation · 9. Procédure de renouvellement | Binaires sur pièces simples |
| V4 (+9-12 mois) | 7b/7c. Analyse des décomptes (OCR) · 6. Surface · 10. Encadrement (si prolongé) | Briques lourdes ou dépendantes |
| Continu | 8. Complément (alerte 3 mois) · 11. Indécence (orientation) | Signaux + partenaires |
