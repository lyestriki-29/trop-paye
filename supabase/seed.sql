-- Seed des référentiels. Valeurs VÉRIFIÉES le 2026-06-11 aux sources officielles
-- (INSEE BDM série 001515333, Légifrance, service-public.fr) — campagne de
-- vérification par agents web, sources citées par bloc. verified=true.

-- ---------- IRL (indice de référence des loyers) ----------
-- Série INSEE 001515333 (métropole), vérifiée trimestre par trimestre via l'API BDM
-- (https://bdm.insee.fr/series/sdmx/data/SERIES_BDM/001515333) le 2026-06-11.
-- Corrections vs seed initial : 2021-T2 = 131.12 (130.69 était la valeur du T1) ;
-- 2024-T2 = 145.17 (144.00 était faux). published_at = date de l'avis au JO.
-- ⚠️ Séries dérogatoires NON couvertes ici : Corse et outre-mer (bouclier 2,0 %/2,5 %)
-- ont leurs propres séries — à ajouter si des dossiers hors métropole arrivent.
-- Dernier trimestre publié au 2026-06-11 : 2026-T1 (le T2 paraît mi-juillet 2026).
insert into public.irl_index (quarter, value, verified, published_at) values
  ('2021-T2', 131.12, true, '2021-07-15'),
  ('2021-T3', 131.67, true, '2021-10-16'),
  ('2021-T4', 132.62, true, '2022-01-15'),
  ('2022-T1', 133.93, true, '2022-04-16'),
  ('2022-T2', 135.84, true, '2022-07-14'),
  ('2022-T3', 136.27, true, '2022-10-15'),
  ('2022-T4', 137.26, true, '2023-01-31'),
  ('2023-T1', 138.61, true, '2023-04-16'),
  ('2023-T2', 140.59, true, '2023-07-16'),
  ('2023-T3', 141.03, true, '2023-10-14'),
  ('2023-T4', 142.06, true, '2024-01-18'),
  ('2024-T1', 143.46, true, '2024-06-01'),
  ('2024-T2', 145.17, true, '2024-07-18'),
  ('2024-T3', 144.51, true, '2024-10-16'),
  ('2024-T4', 144.64, true, '2025-01-16'),
  ('2025-T1', 145.47, true, '2025-04-16'),
  ('2025-T2', 146.68, true, '2025-07-13'),
  ('2025-T3', 145.77, true, '2025-10-17'),
  ('2025-T4', 145.78, true, '2026-01-16'),
  ('2026-T1', 146.60, true, '2026-04-16')
on conflict (quarter) do update set
  value = excluded.value,
  verified = excluded.verified,
  published_at = excluded.published_at;

-- ---------- Communes en zone tendue (échantillon) ----------
-- Vérifié le 2026-06-11 : les 10 communes figurent dans la liste 1° (agglomérations
-- > 50 000 hab, art. 232 CGI) de l'annexe du décret 2013-392 consolidé
-- (https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000053155027).
-- ⚠️ Le décret 2023-822 a ajouté ~2 500 communes en liste 2° (effets FISCAUX) :
-- l'encadrement de l'évolution des loyers reste attaché à la liste 1° — ne seeder
-- ici QUE des communes de la liste 1°. effective_from 2022-08-01 = approximation
-- prudente d'entrée dans notre périmètre produit, pas la date du décret (2013).
insert into public.tense_zone_communes (insee_code, name, effective_from, verified) values
  ('75056', 'Paris', '2022-08-01', true),
  ('69123', 'Lyon', '2022-08-01', true),
  ('13055', 'Marseille', '2022-08-01', true),
  ('59350', 'Lille', '2022-08-01', true),
  ('33063', 'Bordeaux', '2022-08-01', true),
  ('34172', 'Montpellier', '2022-08-01', true),
  ('31555', 'Toulouse', '2022-08-01', true),
  ('44109', 'Nantes', '2022-08-01', true),
  ('93048', 'Montreuil', '2022-08-01', true),
  ('06088', 'Nice', '2022-08-01', true)
on conflict (insee_code) do update set verified = excluded.verified;

-- ---------- Zones d'honoraires ALUR (échantillon) ----------
-- Vérifié le 2026-06-11 : classements confirmés (décret 2014-890 art. 1-II ; Paris en
-- zone A bis = très tendue ; Lyon/Marseille en zone A = tendue). Plafonds confirmés :
-- 12/10/8 €/m² (+3 € EDL) du 15/09/2014 au 31/12/2025, puis RÉVISÉS au 01/01/2026 :
-- 12,10 / 10,09 / 8,07 €/m² (+3,03 € EDL) — arrêté du 17/07/2025 modifié le 13/11/2025
-- (https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051949607). Les MONTANTS vivent
-- dans le moteur le jour où le module honoraires est activé : porter les 2 fenêtres
-- effectiveFrom/effectiveTo. ⚠️ Zone A bis élargie par arrêté du 05/09/2025.
insert into public.fee_cap_zones (insee_code, zone, effective_from, verified) values
  ('75056', 'TRES_TENDUE', '2014-09-15', true),
  ('69123', 'TENDUE', '2014-09-15', true),
  ('13055', 'TENDUE', '2014-09-15', true)
on conflict (insee_code) do update set verified = excluded.verified;

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
-- Vérifié le 2026-06-11 (Légifrance + service-public.fr + INSEE) :
-- · DPE_FREEZE : art. 159 loi 2021-1104 — baux conclus/renouvelés/reconduits dès le
--   24/08/2022 en métropole (la date pivot est celle du BAIL, pas de la hausse) ;
--   outre-mer (art. 73) : 01/07/2024. Sortie du gel : nouveau DPE ≥ E, pour l'avenir.
--   https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957099
-- · IRL_SHIELD : art. 12 loi 2022-1158 — variation IRL plafonnée à 3,5 % métropole,
--   IRL T3 2022 → T1 2024 inclus (prolongé par la loi 2023-568 du 07/07/2023).
--   Corse 2,0 % (arrêté préfectoral) ; outre-mer 2,5 % — séries IRL distinctes.
--   https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000046186752
-- · DEPOSIT_LATE : art. 22 loi 89-462 (version ALUR) — 1 mois (EDL conforme) /
--   2 mois (non conforme) dès remise des clés ; majoration 10 % du loyer mensuel EN
--   PRINCIPAL par période mensuelle COMMENCÉE. Nuance non modélisée : provision 20 %
--   possible en immeuble collectif jusqu'à l'arrêté annuel des comptes.
--   https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000028806696/
insert into public.legal_rules (id, version, effective_from, effective_to, params) values
  ('DPE_FREEZE', '2022-08-24', '2022-08-24', null,
   '{"frozenClasses":["F","G"],"basis":"loi Climat art.159","pivot":"bail conclu/renouvelé/reconduit","effectiveFromOutreMer":"2024-07-01","verified":true}'::jsonb),
  ('IRL_SHIELD', '2022-2024', '2022-07-01', '2024-03-31',
   '{"maxVariationPct":3.5,"scope":"métropole","maxVariationPctCorse":2.0,"maxVariationPctOutreMer":2.5,"basis":"art.12 loi 2022-1158, prolongée loi 2023-568","verified":true}'::jsonb),
  ('DEPOSIT_LATE', '1989-art22', '1989-07-06', null,
   '{"delayMonthsConforme":1,"delayMonthsNonConforme":2,"penaltyPctPerMonth":10,"penaltyBase":"loyer mensuel en principal (hors charges)","perPeriod":"période mensuelle commencée","verified":true}'::jsonb)
on conflict (id, version) do update set params = excluded.params;
