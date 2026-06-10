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

-- ---------- Règles juridiques versionnées ----------
insert into public.legal_rules (id, version, effective_from, effective_to, params) values
  ('DPE_FREEZE', '2022-08-24', '2022-08-24', null,
   '{"frozenClasses":["F","G"],"basis":"loi Climat art.159"}'::jsonb),
  ('IRL_SHIELD', '2022-2024', '2022-07-01', '2024-03-31',
   '{"maxVariationPct":3.5,"scope":"métropole"}'::jsonb),
  ('DEPOSIT_LATE', '1989-art22', '1989-07-06', null,
   '{"delayMonthsConforme":1,"delayMonthsNonConforme":2,"penaltyPctPerMonth":10}'::jsonb)
on conflict (id, version) do nothing;
