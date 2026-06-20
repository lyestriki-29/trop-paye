-- ============================================================================
-- Référentiels réglementaires (promus depuis seed.sql → migration).
-- Raison : `supabase db push` applique les MIGRATIONS, jamais `seed.sql`. Tant
-- que ces données vivaient dans seed.sql, le cloud repartait avec les tables
-- VIDES (→ verdicts « il manque l'indice IRL »). En les portant ici, tout
-- environnement (local reset ET cloud push) les obtient automatiquement.
-- Idempotent (`on conflict do update`) : rejouable sans risque ; le cron IRL
-- prend le relais pour les trimestres publiés ensuite.
-- ⚠️ Les articles SEO de démo ([AVOCAT]) restent dans seed.sql : local-only.
-- ============================================================================

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
