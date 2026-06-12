# Recherche juridique — complément de loyer (2026-06-12)

Sources : service-public.gouv.fr (F34401), ANIL (analyses juridiques
encadrement zones tendues), Légifrance (dispositions complément de loyer),
DRIHL. État du droit juin 2026. **Ne remplace pas la validation [AVOCAT].**

## 1. Quand un complément est LÉGAL
Le logement doit avoir des caractéristiques de **localisation ou de confort** :
- **déterminantes** par comparaison avec les logements de même catégorie du
  même secteur géographique (rareté),
- **non déjà prises en compte** dans le loyer de référence (exclut le nombre de
  pièces et l'époque de construction),
- **non récupérables** par ailleurs (charges, travaux d'économie d'énergie).

Jurisprudence : il faut une particularité telle que le bien soit dans un
**cadre exceptionnel** (vue remarquable) et/ou avec des **équipements très
spécifiques / prestations haut de gamme** le distinguant de TOUS les
appartements de même catégorie du secteur. **Les seuls travaux de rénovation
ne suffisent jamais** (critère de rareté).

Seul exemple officiel cité : **« vue sur un monument historique »**.
Le montant ET les caractéristiques justifiant le complément **doivent figurer
au bail** ; à défaut, complément fragile.

Exemples plausibles (jurisprudence/pratique CDC, à valider [AVOCAT], NON
limitatifs) : vue exceptionnelle/panorama, terrasse ou très grand balcon,
jardin privatif, hauteur sous plafond exceptionnelle, prestations/matériaux
haut de gamme rares, exposition/luminosité exceptionnelle.

## 2. Quand un complément est INTERDIT (bail depuis le 18/08/2022)
Dès qu'**UNE seule** de ces 9 caractéristiques est présente (= nos critères
`COMPLEMENT_3DS_CRITERIA` déjà codés) :
1. Sanitaires sur le palier
2. Signes d'humidité sur certains murs
3. **DPE de classe F ou G**
4. Fenêtres laissant anormalement passer l'air (hors grille de ventilation)
5. Vis-à-vis à moins de 10 m
6. Infiltrations ou inondations provenant de l'extérieur
7. Problèmes d'évacuation d'eau au cours des 3 derniers mois
8. Installation électrique dégradée
9. Mauvaise exposition de la pièce principale

## 3. Charge de la preuve + deux délais (CRUCIAL pour la règle)
- **La preuve incombe au BAILLEUR** : c'est à lui de démontrer que le
  complément est justifié.
- **Contester le caractère justifié** (cas « hors F/G, abusif ») : saisine de
  la commission départementale de conciliation (CDC) **dans les 3 mois de la
  signature du bail** (préalable obligatoire), gratuite ; puis juge dans les
  3 mois suivant l'avis CDC. Passé ce délai → **forclusion probable**.
- **Récupérer un complément INTERDIT** (F/G, critère rédhibitoire) : somme
  versée indûment → action en **répétition de l'indu, prescription 3 ans**.
- Effet **rétroactif** à la date d'entrée en vigueur du bail (CDC ou juge).

## 4. Montant moyen — pas de source fiable
Aucune statistique publique du complément moyen (ni OLAP ni observatoire). Le
chiffre « ~35 % des nouveaux baux parisiens 2024 au-dessus du plafond » mesure
le **dépassement d'encadrement**, pas le complément. Notre **9 % reste une
hypothèse maison** (`TODO_VERIFIER`). Le rapport OLAP Paris 2024 (PDF) pourrait
contenir le vrai chiffre (à creuser si besoin).

## 5. Impact sur la règle COMPLEMENT_OVERCHARGE
- **Borne basse (certaine)** : complément sur logement **F/G** (ou critère
  rédhibitoire) → interdit → répétition 3 ans.
- **Borne haute (potentielle)** : complément **hors F/G + aucune
  caractéristique exceptionnelle déclarée** → contestable, MAIS forclos si bail
  > 3 mois → potentiel/signal, jamais promesse.
- **Justifié** (caractéristique exceptionnelle déclarée, hors F/G) → 0 chiffré,
  signal « à faire vérifier ».
- **Hook produit** : « si vous venez de signer, vous avez 3 mois pour contester
  le complément, agissez vite » — levier d'acquisition à part entière.
