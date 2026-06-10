-- TropPayé — schéma initial. Montants en centimes (int), dates ISO, fuseau Europe/Paris géré applicativement.

-- ---------- Enums ----------
create type dossier_status as enum (
  'DRAFT','DIAGNOSED','MANDATE_PENDING','IN_REVIEW','RECOVERY','ESCALATED','WON','LOST','CLOSED'
);
create type recovery_state as enum ('SCHEDULED','PAUSED','LOCKED');
create type dpe_source as enum ('ADEME_API','USER_INPUT','DOCUMENT');
create type rent_event_type as enum ('INITIAL','REVISION','RENEWAL','RELOCATION','REGULARISATION_CHARGES');
create type mandate_status as enum ('DRAFT','PENDING','SIGNED','CANCELLED');
create type piece_status as enum ('RECEIVED','ILLEGIBLE','VALIDATED');
create type action_type as enum (
  'LETTER_J0','REMINDER_J21','PROPOSAL_J35','FINAL_NOTICE_J50',
  'LANDLORD_REPLY','ESCALATION','PAYMENT_RECEIVED','PAYOUT_SENT'
);
create type article_status as enum ('DRAFT','REVIEW','PUBLISHED','ARCHIVED');
create type user_role as enum ('client','admin');

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Profils (1-1 avec auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crée automatiquement un profil à l'inscription.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
create trigger trg_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Dossiers ----------
create table public.dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  session_token text,                       -- diagnostic anonyme (cookie httpOnly signé)
  status dossier_status not null default 'DRAFT',
  recovery_state recovery_state not null default 'SCHEDULED',
  -- logement
  address_label text,
  ban_id text,
  insee_code text,
  surface_m2 numeric,
  rooms int,
  furnished boolean,
  construction_period text,
  -- bail
  lease_signed_at date,
  lease_renewed_at date,
  initial_rent_cents int,
  current_rent_cents int,
  charges_cents int,
  revision_clause boolean,
  revision_quarter text,
  previous_tenant_rent_cents int,
  deposit_cents int,
  -- DPE courant (historique détaillé dans dpe_records)
  dpe_number text,
  dpe_class text,
  dpe_date date,
  dpe_source dpe_source,
  -- snapshot exact passé au moteur (audit/rejouabilité)
  engine_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_dossiers_user on public.dossiers(user_id);
create index idx_dossiers_session on public.dossiers(session_token);
create index idx_dossiers_status on public.dossiers(status);
create trigger trg_dossiers_updated before update on public.dossiers
  for each row execute function public.set_updated_at();

-- ---------- DPE (historique temporel) ----------
create table public.dpe_records (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  class text not null,
  date date not null,
  surface_m2 numeric,
  numero text,
  source dpe_source not null,
  created_at timestamptz not null default now()
);
create index idx_dpe_dossier on public.dpe_records(dossier_id);

-- ---------- Historique des loyers ----------
create table public.rent_events (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  date date not null,
  type rent_event_type not null,
  rent_cents int not null,
  source text not null default 'déclaratif',
  created_at timestamptz not null default now()
);
create index idx_rent_dossier on public.rent_events(dossier_id);

-- ---------- Verdicts (VerdictGlobal sérialisé) ----------
create table public.verdicts (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  outcome text not null,
  confidence text not null,
  total_recoverable_cents int not null default 0,
  total_future_monthly_saving_cents int not null default 0,
  results jsonb not null,
  signals jsonb not null default '[]'::jsonb,
  as_of date not null,
  computed_at timestamptz not null default now()
);
create index idx_verdicts_dossier on public.verdicts(dossier_id);

-- ---------- Mandat ----------
create table public.mandates (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null unique references public.dossiers(id) on delete cascade,
  status mandate_status not null default 'DRAFT',
  fee_rate_bps int not null default 2500,
  signed_at timestamptz,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_mandates_updated before update on public.mandates
  for each row execute function public.set_updated_at();

-- ---------- Preuve de signature MAISON (eIDAS simple) ----------
create table public.signature_proofs (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  mandate_id uuid references public.mandates(id) on delete cascade,
  signer_name text not null,
  document_hash text not null,            -- sha256 du PDF figé
  proof_hmac text not null,               -- HMAC(SIGNATURE_SECRET, payload)
  ip text,
  user_agent text,
  consented_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index idx_sigproof_dossier on public.signature_proofs(dossier_id);

-- ---------- Pièces (stockage chiffré, bucket privé) ----------
create table public.pieces (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  kind text not null,                     -- bail, quittance, edl, dpe...
  storage_path text,
  status piece_status not null default 'RECEIVED',
  reason text,
  encrypted boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_pieces_dossier on public.pieces(dossier_id);
create trigger trg_pieces_updated before update on public.pieces
  for each row execute function public.set_updated_at();

-- ---------- Actions (pipeline de recouvrement) ----------
create table public.actions (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  type action_type not null,
  scheduled_at timestamptz,
  executed_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index idx_actions_dossier on public.actions(dossier_id);
create index idx_actions_due on public.actions(scheduled_at) where executed_at is null;

-- ---------- Mouvements de fonds (compte dédié R124) ----------
create table public.fund_movements (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  direction text not null check (direction in ('IN','OUT_TENANT','OUT_FEE')),
  amount_cents int not null,
  reference text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index idx_funds_dossier on public.fund_movements(dossier_id);

-- ---------- Messagerie ----------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  sender text not null check (sender in ('client','operator','system')),
  body text not null,
  created_at timestamptz not null default now()
);
create index idx_messages_dossier on public.messages(dossier_id);

-- ---------- Outbox emails (notifications simulées) ----------
create table public.outbox_emails (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  to_email text not null,
  subject text not null,
  body text not null,
  template text,
  status text not null default 'queued',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Journal d'accès (RGPD) ----------
create table public.access_logs (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete set null,
  actor_id uuid,
  action text not null,
  created_at timestamptz not null default now()
);

-- ---------- Référentiels (versionnés) ----------
create table public.irl_index (
  quarter text primary key,               -- "2024-T2"
  value numeric not null,
  verified boolean not null default false, -- TODO_VERIFIER tant que false
  published_at date
);
create table public.tense_zone_communes (
  insee_code text primary key,
  name text,
  effective_from date not null,
  effective_to date,
  verified boolean not null default false
);
create table public.fee_cap_zones (
  insee_code text primary key,
  zone text not null,                     -- TRES_TENDUE | TENDUE | NORMALE
  effective_from date not null,
  verified boolean not null default false
);
create table public.legal_rules (
  id text not null,
  version text not null,
  effective_from date not null,
  effective_to date,
  params jsonb not null default '{}'::jsonb,
  primary key (id, version)
);

-- ---------- Articles (blog / guides SEO) ----------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  topic text,                             -- dpe | irl | depot | encadrement...
  keyword text,
  status article_status not null default 'DRAFT',
  excerpt text,
  mdx text not null default '',
  sources jsonb not null default '[]'::jsonb,
  author text not null default 'auto',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_articles_status on public.articles(status);
create trigger trg_articles_updated before update on public.articles
  for each row execute function public.set_updated_at();
