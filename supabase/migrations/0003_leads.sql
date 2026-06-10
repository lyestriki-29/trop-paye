-- 0003_leads.sql — capture email+téléphone avant verdict (spec refonte P2).
-- PII : table dédiée (PAS de colonnes sur dossiers), suppression en cascade.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  email text not null,
  phone text,                              -- optionnel au lancement
  consent_at timestamptz not null default now(),
  consent_text_version text not null,      -- version du texte affiché (traçabilité RGPD)
  purpose text not null,                   -- finalité déclarée (ex. 'envoi_resultat')
  created_at timestamptz not null default now()
);
-- 1 lead par dossier : idempotence (retry non destructif) + plafond d'écriture naturel.
create unique index idx_leads_dossier on public.leads(dossier_id);
alter table public.leads enable row level security;
-- Deny-all : AUCUNE policy. Lecture/écriture exclusivement via service_role (Server Action).
