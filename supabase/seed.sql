-- Seed des référentiels. ⚠️ TODO_VERIFIER : toutes les valeurs réglementaires
-- ci-dessous sont des placeholders à confirmer aux sources officielles
-- (INSEE série 001515333, décret zones tendues, arrêtés honoraires). verified=false.

-- ---------- IRL (indice de référence des loyers) ----------
-- Valeurs à confirmer sur INSEE (série 001515333). Backfill 2018→2021 à compléter.
insert into public.irl_index (quarter, value, verified, published_at) values
  ('2021-T2', 130.69, false, '2021-07-15'),
  ('2022-T2', 135.84, false, '2022-07-15'),
  ('2023-T2', 140.59, false, '2023-07-14'),
  ('2024-T2', 144.00, false, '2024-07-12'),
  ('2025-T1', 145.47, false, '2025-04-15'),
  ('2025-T2', 146.68, false, '2025-07-15'),
  ('2025-T3', 145.77, false, '2025-10-15'),
  ('2025-T4', 145.78, false, '2026-01-15'),
  ('2026-T1', 146.60, false, '2026-04-16')
on conflict (quarter) do nothing;

-- ---------- Communes en zone tendue (échantillon) ----------
-- ⚠️ TODO_VERIFIER : liste complète = décret zones tendues en vigueur.
insert into public.tense_zone_communes (insee_code, name, effective_from, verified) values
  ('75056', 'Paris', '2022-08-01', false),
  ('69123', 'Lyon', '2022-08-01', false),
  ('13055', 'Marseille', '2022-08-01', false),
  ('59350', 'Lille', '2022-08-01', false),
  ('33063', 'Bordeaux', '2022-08-01', false),
  ('34172', 'Montpellier', '2022-08-01', false),
  ('31555', 'Toulouse', '2022-08-01', false),
  ('44109', 'Nantes', '2022-08-01', false),
  ('93048', 'Montreuil', '2022-08-01', false),
  ('06088', 'Nice', '2022-08-01', false)
on conflict (insee_code) do nothing;

-- ---------- Zones d'honoraires ALUR (échantillon) ----------
-- ⚠️ TODO_VERIFIER : 12 €/m² très tendue, 10 € tendue, 8 € reste (+ 3 € EDL).
insert into public.fee_cap_zones (insee_code, zone, effective_from, verified) values
  ('75056', 'TRES_TENDUE', '2014-09-15', false),
  ('69123', 'TENDUE', '2014-09-15', false),
  ('13055', 'TENDUE', '2014-09-15', false)
on conflict (insee_code) do nothing;

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
insert into public.legal_rules (id, version, effective_from, effective_to, params) values
  ('DPE_FREEZE', '2022-08-24', '2022-08-24', null,
   '{"frozenClasses":["F","G"],"basis":"loi Climat art.159"}'::jsonb),
  ('IRL_SHIELD', '2022-2024', '2022-07-01', '2024-03-31',
   '{"maxVariationPct":3.5,"scope":"métropole"}'::jsonb),
  ('DEPOSIT_LATE', '1989-art22', '1989-07-06', null,
   '{"delayMonthsConforme":1,"delayMonthsNonConforme":2,"penaltyPctPerMonth":10}'::jsonb)
on conflict (id, version) do nothing;
