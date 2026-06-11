-- 0004_pilote_ops.sql — chantiers pilote (décisions Lyes 2026-06-11) :
-- bailleur destinataire des courriers, coordonnées de reversement chiffrées,
-- événements funnel first-party (zéro PII), circuit courrier papier « à poster »,
-- rétractation consommateur L221-18, paiement échelonné.

-- ---------- Bailleur + rétractation + échéancier ----------
alter table public.dossiers
  add column landlord_name text,
  add column landlord_address text,
  add column landlord_kind text check (landlord_kind in ('PARTICULIER', 'SCI', 'AGENCE')),
  -- L221-18 C. conso : sans demande d'exécution immédiate, le J0 attend signature + 14 j.
  add column immediate_execution boolean not null default false,
  -- Montant convenu avec le bailleur (accord partiel/échéancier) : WON quand Σ IN l'atteint.
  add column agreed_total_cents int;

-- ---------- Coordonnées de reversement (PII : table dédiée, pattern leads) ----------
create table public.payout_details (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  holder_name text not null,
  iban_encrypted text not null,            -- AES-256-GCM applicatif (PIECES_ENCRYPTION_KEY)
  created_at timestamptz not null default now()
);
-- 1 jeu de coordonnées par dossier : idempotence (re-saisie = remplacement applicatif).
create unique index idx_payout_dossier on public.payout_details(dossier_id);
alter table public.payout_details enable row level security;
-- Deny-all : AUCUNE policy. Lecture/écriture exclusivement via service_role (Server Action).

-- ---------- Événements funnel first-party (PRD §5) — zéro PII, zéro cookie tiers ----------
create table public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,                     -- diagnostic_demarre, verdict_affiche, email_capture…
  dossier_id uuid references public.dossiers(id) on delete set null,
  src text,                                -- attribution acquisition (?src=, cookie first-party)
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index idx_funnel_event_time on public.funnel_events(event, created_at);
alter table public.funnel_events enable row level security;
-- Deny-all : écrit en service_role depuis les Server Actions, lu par l'admin (service_role).

-- ---------- Circuit courrier papier (pilote : pas de LRE électronique) ----------
-- Le cron rend le courrier et le met en file TO_POST ; l'opérateur imprime, poste en
-- recommandé et saisit le n° de suivi — c'est CETTE saisie qui notifie le client.
alter table public.actions
  add column post_status text check (post_status in ('TO_POST', 'POSTED')),
  add column tracking_number text,
  add column posted_at timestamptz;
create index idx_actions_to_post on public.actions(post_status) where post_status = 'TO_POST';
