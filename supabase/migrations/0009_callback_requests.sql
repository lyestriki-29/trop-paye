-- 0009_callback_requests.sql
-- Demandes de rappel (Contact espace client, 2026-06-20). RLS par dossier.

create table public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  phone text not null,
  subject text not null,
  preferred_slot text not null check (preferred_slot in ('ASAP','MORNING','AFTERNOON','EVENING')),
  status text not null default 'PENDING' check (status in ('PENDING','DONE')),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);
create index idx_callback_requests_dossier on public.callback_requests(dossier_id);
create index idx_callback_requests_pending on public.callback_requests(created_at) where status = 'PENDING';

alter table public.callback_requests enable row level security;

-- Le client lit/écrit uniquement les rappels de SES dossiers (anti-IDOR).
create policy callback_select_own on public.callback_requests for select to authenticated
  using (public.owns_dossier(dossier_id));
create policy callback_insert_own on public.callback_requests for insert to authenticated
  with check (public.owns_dossier(dossier_id));
-- Pas d'update/delete client : l'admin gère via service_role.
