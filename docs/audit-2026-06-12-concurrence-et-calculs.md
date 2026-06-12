# Audit concurrence + exactitude des calculs — 2026-06-12

Source : deep-research (108 agents, 26 sources, 25 affirmations vérifiées par
vote adversarial 3 juges : 22 confirmées, 3 réfutées). État du droit et des
outils au 12/06/2026. Complète, ne remplace pas, la validation [AVOCAT].

## 1. Nos règles vs droit vérifié

| Règle moteur | Verdict | Source primaire | Notes |
|---|---|---|---|
| DEPOSIT_LATE : pénalité 10 % du loyer mensuel HC par mois COMMENCÉ, délais 1 mois (EDL conforme) / 2 mois, plafond 1 mois HC non meublé | ✅ Exact | Legifrance art. 22 loi 89-462 (LEGIARTI000028806696) | ⚠️ CORRECTION À ENCODER : la majoration ne court pas si le locataire n'a pas transmis sa nouvelle adresse au bailleur |
| DPE_FREEZE : gel F/G post-24/08/2022 (nouvelle location, renouvellement, révision IRL, réévaluation) | ✅ Validé | ecologie.gouv.fr + Legifrance art. 17 + service-public F1314 | Contrats conclus/renouvelés/reconduits après le 24/08/2022 ; outre-mer 01/07/2024 ; meublés touristiques exclus |
| IRL_OVERCHARGE : clause de révision obligatoire | ✅ Validé | art. 17-1 loi 89-462 ; simulateur ANIL (1re question bloquante) | ⚠️ NON COUVERT : réactivité 1 an post-ALUR (révision rétroactive interdite) = trop-perçu potentiel en plus, à vérifier |
| Prescription 3 ans | ✅ Validé | art. 7-1 loi 89-462 | Un renouvellement rouvre une fenêtre ; borne aussi le surloyer d'encadrement |
| AGENCY_FEES_CAP : 12/10/8 €/m² + 3 €/m² EDL | ⚠️ Non vérifié par cette recherche | — | ⚠️ Signal CLCV : honoraires REVALORISÉS au 01/01/2026 → versionner les plafonds par date de signature (effectiveFrom/To) |
| Complément moyen 9 % du loyer | ❌ Aucune source (OLAP, observatoire : rien) | — | Reste une hypothèse maison TODO_VERIFIER + [AVOCAT], assumée « vendeur » (décision Lyes 2026-06-12) |
| Bouclier 3,5 %, interdiction G(2025)/F(2028), préavis réduit | Non couverts par les claims survivantes | — | À re-vérifier séparément |

## 2. Concurrence (claims vérifiées 3-0 sauf mention)

- **Aucun outil public ou privé identifié n'affiche le trop-perçu CUMULÉ
  récupérable, ni une fourchette basse/haute** (vérifié jusque dans les
  bundles JS de Lille et de l'ANIL). Notre fourchette 2 scénarios + cumul +
  commission au succès = différenciateur sans équivalent identifié
  (confiance medium : conclusion d'absence, périmètre incomplet).
- **DemanderJustice** : seul privé outillé documenté, dépôt de garantie
  uniquement, forfait 89,90 € payé d'avance (39,90 € amiable seul). Traction
  auto-déclarée 200 000 dossiers / 82 % de gain (vote 2-1, marketing
  probablement périmé).
- **Étalon UX officiel** (Paris, Lille, DRIHL, ANIL, service-public) :
  4 à 9 questions, quasi tout en choix fermés, échappatoire « je ne sais
  pas », zéro champ libre textuel, zéro compte pour simuler. Paris est le
  seul à afficher un dépassement précis en € (mensuel, jamais cumulé).
- Le vérificateur de Lille ne chiffre JAMAIS de restitution (vérifié dans le
  bundle Angular) et oriente vers les recours gratuits (amende bailleur
  jusqu'à 5 000 / 15 000 €).

## 3. Gisement manqué n°1 : surloyer d'encadrement

Dépassement type ~200 €/mois (exemple vérifié Paris : 1 300 € vs plafond
1 084 € → 216 €/mois), prescription 3 ans → gisement par dossier potentiellement
en milliers d'euros, poussé par toutes les villes, chiffré par personne.
Prérequis : datasets des loyers de référence par quartier ET par millésime
d'arrêté (trou parisien 28/11/2017 → 01/07/2019, annulation TA), application
du millésime en vigueur à la DATE DE SIGNATURE du bail (jamais la date du
jour). Inventaire data en cours (deep-research wf_9700972d-9cc).

## 4. Réfutées (ne pas réutiliser)

- « Le simulateur parisien demande ~6 champs » (réel : ~9 entrées).
- « Le résultat parisien = loyer maximal inscriptible » (réel : tableau avec
  montant de dépassement mensuel).
- La liste des villes encadrées avec dates (à re-sourcer, fait l'objet de
  l'inventaire data en cours).

## 5. Actions retenues

1. Mini-tunnel dépôt : + question bouton « avez-vous transmis votre nouvelle
   adresse au bailleur ? » (sinon pénalité exclue de la borne basse).
2. « Je ne sais pas » systématique sur tous les choix fermés (étalon officiel).
3. [AVOCAT]/backlog : revalorisation honoraires 01/01/2026 (versionner
   AGENCY_FEES_CAP), réactivité IRL 1 an, bouclier 3,5 %, G2025/F2028.
4. Lot « surloyer encadrement » : après la simplification, ingestion data en
   premier (inventaire ci-dessous).

## 6. Inventaire data encadrement (2026-06-12, partiellement vérifié)

Deep-research wf_9700972d-9cc : 8 claims confirmées (vote 3-0), synthèse
interrompue (limite session). Datasets ensuite sondés EN RÉEL côté Claude.

**9 territoires ELAN/3DS en vigueur (jusqu'au 25/11/2026)** :

| Territoire | Depuis | Dernier arrêté |
|---|---|---|
| Paris | 01/07/2019 | 16/06/2025 |
| Lille-Hellemmes-Lomme | 01/03/2020 | 29/01/2025 |
| Plaine Commune (EPT) | 01/06/2021 | 16/05/2025 |
| Lyon / Villeurbanne | 01/11/2021 | 22/10/2024 |
| Est Ensemble (EPT) | 01/12/2021 | 16/05/2025 |
| Montpellier | 01/07/2022 | 12/06/2025 |
| Bordeaux | 15/07/2022 | 20/06/2025 |
| Pays Basque (24 communes) | 25/11/2024 | — |
| Grenoble-Alpes Métropole | 20/01/2025 | — |

Structure commune : arrêté annuel, €/m² par secteur × pièces × époque ×
meublé, avec ref / majoré (+20 %) / minoré (−30 %).

**Paris — dataset PROUVÉ en réel** (détail complet en mémoire
`troppaye-encadrement-data-paris`) : `logement-encadrement-des-loyers`
sur opendata.paris.fr, ODbL, millésimes 2019-2025, géo-rattachement
`intersects(geo_shape, geom'POINT(lon lat)')` testé OK avec coordonnées IGN.
→ Territoire le plus prêt, commencer par lui.

**Trous parisiens à modéliser** : 28/11/2017→01/07/2019 (pré-ELAN) et
01/07/2020→30/06/2021 (millésime annulé, CAA Paris 02/10/2023, non
rétroactif). Bail signé dans une fenêtre = pas d'encadrement.

**Autres territoires** : datasets repérés sur data.gouv.fr (Lille + zonage,
Bordeaux secteurs, Montpellier, Lyon 2025-2026) — à sonder un par un.
Zone tendue : dataset `observatoire-habitat-communes-situees-en-zone-tendue`
(débloque aussi frais d'agence + préavis).

**Réfutés (ne pas réutiliser)** : « 14 secteurs / 80 quartiers » Paris,
« 9 communes » Plaine Commune, liste ministérielle à 5 territoires (périmée).

**À re-vérifier au reset de session** : schéma réel des datasets Lille/
Bordeaux/Montpellier/Lyon, périmètres communaux exacts, dataset complément
de loyer, prescription IRL « réactivité 1 an ».
