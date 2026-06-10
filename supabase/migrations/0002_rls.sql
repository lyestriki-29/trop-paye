-- RLS : isolation par utilisateur. Le back-office et le cron passent par la
-- clé service_role (bypass RLS) côté serveur uniquement. L'anonyme n'écrit
-- jamais en direct : tout passe par des Server Actions en service_role.

-- ---------- Activation RLS ----------
alter table public.profiles            enable row level security;
alter table public.dossiers            enable row level security;
alter table public.dpe_records         enable row level security;
alter table public.rent_events         enable row level security;
alter table public.verdicts            enable row level security;
alter table public.mandates            enable row level security;
alter table public.signature_proofs    enable row level security;
alter table public.pieces              enable row level security;
alter table public.actions             enable row level security;
alter table public.fund_movements      enable row level security;
alter table public.messages            enable row level security;
alter table public.outbox_emails       enable row level security;
alter table public.access_logs         enable row level security;
alter table public.irl_index           enable row level security;
alter table public.tense_zone_communes enable row level security;
alter table public.fee_cap_zones       enable row level security;
alter table public.legal_rules         enable row level security;
alter table public.articles            enable row level security;

-- ---------- Helper : le dossier appartient à l'utilisateur courant ----------
create or replace function public.owns_dossier(d uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.dossiers x where x.id = d and x.user_id = auth.uid());
$$;

-- ---------- Profils ----------
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid());

-- ---------- Dossiers (client propriétaire) ----------
create policy dossiers_select_own on public.dossiers for select to authenticated using (user_id = auth.uid());
create policy dossiers_insert_own on public.dossiers for insert to authenticated with check (user_id = auth.uid());
create policy dossiers_update_own on public.dossiers for update to authenticated using (user_id = auth.uid());
create policy dossiers_delete_own on public.dossiers for delete to authenticated using (user_id = auth.uid());

-- ---------- Tables enfant : lecture si on possède le dossier ----------
create policy dpe_select_own        on public.dpe_records      for select to authenticated using (public.owns_dossier(dossier_id));
create policy rent_select_own       on public.rent_events      for select to authenticated using (public.owns_dossier(dossier_id));
create policy verdicts_select_own   on public.verdicts         for select to authenticated using (public.owns_dossier(dossier_id));
create policy mandates_select_own   on public.mandates         for select to authenticated using (public.owns_dossier(dossier_id));
create policy sigproof_select_own   on public.signature_proofs for select to authenticated using (public.owns_dossier(dossier_id));
create policy pieces_select_own     on public.pieces           for select to authenticated using (public.owns_dossier(dossier_id));
create policy actions_select_own    on public.actions          for select to authenticated using (public.owns_dossier(dossier_id));
create policy funds_select_own      on public.fund_movements   for select to authenticated using (public.owns_dossier(dossier_id));
create policy messages_select_own   on public.messages         for select to authenticated using (public.owns_dossier(dossier_id));

-- Le client peut écrire un message sur son dossier.
create policy messages_insert_own on public.messages for insert to authenticated
  with check (public.owns_dossier(dossier_id) and sender = 'client');

-- ---------- Référentiels : lecture publique (données ouvertes) ----------
create policy irl_read    on public.irl_index           for select to anon, authenticated using (true);
create policy tense_read  on public.tense_zone_communes for select to anon, authenticated using (true);
create policy feecap_read on public.fee_cap_zones       for select to anon, authenticated using (true);
create policy rules_read  on public.legal_rules         for select to anon, authenticated using (true);

-- ---------- Articles : seuls les publiés sont lisibles publiquement ----------
create policy articles_read_published on public.articles for select to anon, authenticated
  using (status = 'PUBLISHED');

-- ---------- Storage : bucket privé des pièces ----------
insert into storage.buckets (id, name, public) values ('pieces', 'pieces', false)
  on conflict (id) do nothing;

create policy pieces_obj_select on storage.objects for select to authenticated
  using (bucket_id = 'pieces' and (storage.foldername(name))[1] = auth.uid()::text);
create policy pieces_obj_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'pieces' and (storage.foldername(name))[1] = auth.uid()::text);
create policy pieces_obj_update on storage.objects for update to authenticated
  using (bucket_id = 'pieces' and (storage.foldername(name))[1] = auth.uid()::text);
create policy pieces_obj_delete on storage.objects for delete to authenticated
  using (bucket_id = 'pieces' and (storage.foldername(name))[1] = auth.uid()::text);
