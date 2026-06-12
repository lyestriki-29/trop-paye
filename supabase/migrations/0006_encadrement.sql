-- Encadrement des loyers — référentiel public (4e régime, distinct du gel F/G et
-- du bouclier). Source : opendata.paris.fr, dataset « logement-encadrement-des-
-- loyers » (ODbL). Le loyer de référence MAJORÉ (max) est le plafond légal €/m².
-- Géo-rattachement adresse → quartier par point-in-polygon CÔTÉ APPLICATIF
-- (pas de PostGIS dans ce schéma) ; les polygones sont stockés en jsonb.
-- Montants en centimes (int). Valeurs réglementaires non vérifiées (verified=false).

-- ---------- Quartiers (polygones) → secteur d'encadrement ----------
create table public.encadrement_zone (
  code_grand_quartier bigint primary key,   -- clé du dataset (ex. 7511038)
  nom_quartier text not null,
  id_secteur int not null,                  -- secteur d'encadrement (id_zone, 1..14)
  geometry jsonb not null,                  -- géométrie GeoJSON (Polygon) pour le point-in-polygon
  source text not null default 'opendata.paris.fr/logement-encadrement-des-loyers (ODbL)',
  created_at timestamptz not null default now()
);
create index idx_encadrement_zone_secteur on public.encadrement_zone(id_secteur);

-- ---------- Barème des loyers de référence ----------
-- Le dataset publie un barème par QUARTIER (80) ; on le garde tel quel (sans
-- perte) et le résolveur fait quartier → barème directement (le secteur reste en
-- métadonnée). Clé métier : (millésime, quartier, pièces, époque, meublé).
-- `max_cents` = loyer de référence majoré = plafond légal.
create table public.encadrement_reference (
  id bigint generated always as identity primary key,
  millesime int not null,                   -- annee du barème (2019..2025)
  code_grand_quartier bigint not null references public.encadrement_zone(code_grand_quartier),
  id_secteur int not null,                  -- secteur (id_zone), métadonnée
  rooms int not null,                       -- pièces (1..4 ; 4 = « 4 et plus »)
  construction_period text not null,        -- époque normalisée (BEFORE_1946|1946_1970|1971_1990|AFTER_1990)
  furnished boolean not null,               -- meublé
  ref_cents int not null,                   -- loyer de référence (centimes/m²)
  max_cents int not null,                   -- loyer de référence MAJORÉ = plafond (centimes/m²)
  min_cents int not null,                   -- loyer de référence minoré (centimes/m²)
  effective_from date not null,             -- date d'effet du barème (arrêté préfectoral)
  verified boolean not null default false,  -- TODO_VERIFIER tant que false [AVOCAT]
  source text not null default 'opendata.paris.fr/logement-encadrement-des-loyers (ODbL)',
  unique (millesime, code_grand_quartier, rooms, construction_period, furnished)
);
create index idx_encadrement_ref_lookup
  on public.encadrement_reference(code_grand_quartier, rooms, construction_period, furnished, effective_from);

-- ---------- RLS : lecture publique (données ouvertes), écriture service-role ----------
alter table public.encadrement_zone      enable row level security;
alter table public.encadrement_reference enable row level security;
create policy encadrement_zone_read on public.encadrement_zone
  for select to anon, authenticated using (true);
create policy encadrement_ref_read on public.encadrement_reference
  for select to anon, authenticated using (true);
