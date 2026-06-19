-- Seed LOCAL-ONLY : contenus de démonstration, appliqués par `supabase db reset`.
-- ⚠️ Les RÉFÉRENTIELS réglementaires (IRL, zones tendues, honoraires, règles
-- juridiques) ont été PROMUS dans 0008_seed_referentiels.sql, pour que
-- `supabase db push` les applique AUSSI au cloud (seed.sql n'est jamais poussé).
-- Ne pas les redupliquer ici.

-- ---------- Guides SEO de démonstration (P3) ----------
-- ⚠️ [AVOCAT] : contenus à relire avant publication réelle (information générale,
-- jamais de conseil personnalisé — le gabarit ajoute le disclaimer de marque).
insert into public.articles (slug, title, topic, keyword, status, excerpt, mdx, sources, author, published_at) values
(
  'augmentation-loyer-dpe-f-g-interdite',
  'Logement classé F ou G : toute augmentation de loyer est interdite',
  'dpe',
  'augmentation loyer dpe f g interdite',
  'PUBLISHED',
  'Depuis le 24 août 2022, le loyer des passoires thermiques (classes F et G) est gelé. Chaque augmentation appliquée depuis est récupérable.',
  $mdx$
## Ce que dit la loi

Depuis le **24 août 2022**, si votre logement est classé **F** ou **G** au diagnostic de
performance énergétique (DPE), votre propriétaire ne peut plus augmenter votre loyer.
Ni révision annuelle, ni hausse au renouvellement du bail, ni majoration entre deux
locataires : le loyer est gelé tant que le logement reste classé F ou G.

Cette règle vient de la loi Climat et résilience (article 159), qui modifie la loi du
6 juillet 1989 sur les rapports locatifs.

## Comment vérifier

1. **Trouvez votre classe DPE.** Elle figure sur votre bail, sur l'annonce de location,
   ou sur l'Observatoire DPE de l'ADEME (recherche par adresse ou par numéro à
   13 caractères).
2. **Repérez les augmentations.** Comparez vos quittances : toute hausse appliquée
   après le 24 août 2022 sur un logement F ou G est sans fondement.
3. **Comptez la différence.** Chaque mois payé au-dessus du loyer gelé est un
   trop-perçu. La loi limite la récupération aux 3 dernières années.

## Et si le propriétaire refait un DPE ?

Un nouveau DPE qui sort le logement des classes F/G (après travaux, par exemple) met
fin au gel **pour l'avenir**. Les sommes payées en trop pendant la période gelée
restent dues.
$mdx$,
  '[{"label":"Loi Climat et résilience, art. 159 — Légifrance","url":"https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957099"},{"label":"Observatoire DPE — ADEME","url":"https://observatoire-dpe-audit.ademe.fr/"}]'::jsonb,
  'TropPayé',
  '2026-06-11T08:00:00Z'
),
(
  'calcul-augmentation-loyer-irl',
  'Révision du loyer : comment vérifier le calcul IRL de votre propriétaire',
  'irl',
  'calcul augmentation loyer irl',
  'PUBLISHED',
  'La révision annuelle du loyer est plafonnée par l''indice de référence des loyers (IRL). Sans clause au bail, aucune augmentation n''est permise.',
  $mdx$
## La règle en deux phrases

Votre loyer ne peut être révisé **qu'une fois par an**, et seulement si votre bail
contient une **clause de révision**. La hausse est plafonnée par la variation de
l'**indice de référence des loyers (IRL)** publié chaque trimestre par l'INSEE
(loi du 6 juillet 1989, article 17-1).

## Le calcul, pas à pas

1. **Trouvez le trimestre de référence** dans la clause de révision de votre bail
   (souvent le trimestre de signature).
2. **Relevez les deux indices** : l'IRL de ce trimestre l'année de la révision, et
   celui de l'année précédente (site de l'INSEE).
3. **Appliquez la formule** : nouveau loyer maximum = loyer actuel × (IRL nouveau ÷ IRL
   précédent).

Si la hausse appliquée dépasse ce plafond, la différence est un trop-perçu,
récupérable sur les 3 dernières années.

## Deux cas particuliers

- **Pas de clause de révision au bail ?** Aucune augmentation n'est permise : toute
  hausse est intégralement récupérable.
- **Bouclier loyer 2022-2024.** Entre le 3ᵉ trimestre 2022 et le 1ᵉʳ trimestre 2024,
  la variation de l'IRL a été plafonnée à 3,5 % en métropole. Une révision supérieure
  sur cette période est irrégulière, même « conforme » à l'indice brut.
$mdx$,
  '[{"label":"Loi du 6 juillet 1989, art. 17-1 — Légifrance","url":"https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000028777456/"},{"label":"Indice de référence des loyers — INSEE","url":"https://www.insee.fr/fr/statistiques/serie/001515333"}]'::jsonb,
  'TropPayé',
  '2026-06-11T08:30:00Z'
)
on conflict (slug) do nothing;

-- ---------- Règles juridiques versionnées ----------
-- Promues dans 0008_seed_referentiels.sql (cf. en-tête de ce fichier).
