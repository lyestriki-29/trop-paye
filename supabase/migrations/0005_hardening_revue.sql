-- 0005_hardening_revue.sql — correctifs de la revue adversariale du 2026-06-11.

-- ---------- (1) RLS : le client n'écrit JAMAIS dossiers en direct ----------
-- Les policies d'écriture de 0002 étaient du code MORT (100 % des écritures
-- passent par des Server Actions en service_role) ET une faille réelle :
-- `for update using (user_id = auth.uid())` sans WITH CHECK laissait un client
-- authentifié patcher en direct (PostgREST) des colonnes serveur-seulement —
-- immediate_execution (rétractation L221-18), agreed_total_cents (assiette de
-- la commission), status/recovery_state (machine à états), landlord_address
-- (destinataire du recommandé). delete_own permettait même de cascade-supprimer
-- signature_proofs (destruction de la preuve du mandat). Lecture conservée.
drop policy if exists dossiers_update_own on public.dossiers;
drop policy if exists dossiers_insert_own on public.dossiers;
drop policy if exists dossiers_delete_own on public.dossiers;

-- ---------- (2) Verrou d'encaissement (anti double-submit) ----------
-- recordPayment échelonné avait perdu le claim atomique d'avant-refonte : un
-- double-clic opérateur pouvait dupliquer IN/OUT_FEE/OUT_TENANT et le payout.
-- Claim : UPDATE ... SET payment_claimed_at = now() WHERE payment_claimed_at
-- IS NULL (atomique) ; libéré en fin d'action. Si un crash le laisse posé,
-- l'erreur UI explique comment le libérer (re-validation manuelle).
alter table public.dossiers
  add column payment_claimed_at timestamptz;
