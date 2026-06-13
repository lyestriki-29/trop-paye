-- 0007_profile_notifications.sql — Préférence e-mails de notification (refonte espace client, 2026-06-13)

alter table public.profiles
  add column if not exists email_notifications boolean not null default true;

-- Pas de nouvelle policy : la policy profiles_update_own existante (0002_rls.sql) couvre la mise à jour.
