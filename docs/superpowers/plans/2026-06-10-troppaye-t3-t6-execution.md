# TropPayé — Plan d'exécution T3 → T6 (jusqu'au bout)

> Suite du plan MVP `2026-06-10-troppaye-mvp.md`. T0/T1/T2 livrés. Ce document détaille
> T3→T6 en tâches exécutables. **Exécution d'une traite ; la vérif visuelle se fait à la
> fin par le fondateur** (je livre des checks automatiques + une revue adversariale).

## Décisions de cadrage (ce push)
1. **Périmètre** : MVP complet T3→T6 (prestataires sensibles en mock).
2. **Compte client** : créé **à l'entrée du mandat** — après le verdict, le CTA « Récupérer »
   déclenche une connexion magic-link qui **réclame** le dossier anonyme (cookie `tp_session`),
   puis le mandat.
3. **PDF** : stylé charte via **@react-pdf/renderer** (mandat + courriers).
4. **Textes juridiques** : **brouillons marqués `[AVOCAT]`** (placeholder neutre, bandeau
   « ne pas utiliser en prod »), aucun droit inventé.

Rappels verrouillés (plan MVP §0) : signature maison eIDAS simple ; pièces chiffrées
AES-256-GCM ; LRE/paiements MOCK derrière ports ; emails = outbox ; délais calendaires
Europe/Paris ; `recovery_state` lu avant toute Action ; `confidence=LOW` ⇒ validation
bloquée ; jamais de texte libre vers le bailleur (templates only).

## État des fondations (vérifié)
- Tables présentes : `profiles, dossiers, mandates, signature_proofs, pieces, actions,
  fund_movements, messages, outbox_emails, access_logs, rent_events` + référentiels.
  Enums : `mandate_status(DRAFT|PENDING|SIGNED|CANCELLED)`, `piece_status(RECEIVED|ILLEGIBLE|
  VALIDATED)`, `action_type`, `recovery_state(SCHEDULED|PAUSED|LOCKED)`.
- Storage : bucket privé `pieces` + policies `storage.foldername(name)[1]=auth.uid()`.
- `packages/shared/dossier-state-machine.ts` : `canTransition/assertTransition/nextStatuses`.
- `lib/auth/with-auth.ts` : `requireUser/requireAdmin/withAuth(schema,handler)`.
- **`packages/templates` est vide** → à créer.
- À vérifier au début de chaque tâche : colonnes exactes des tables touchées + valeur des
  transitions dans la machine à états.

---

## Pré-vol (P)
- [ ] **P.1** Deps `apps/web` : `@react-pdf/renderer`. (crypto = `node:crypto`, pas de dep.)
      `pnpm install` ; typecheck/build verts.
- [ ] **P.2** `lib/crypto.ts` : `encrypt(buf)/decrypt(buf)` AES-256-GCM via `PIECES_ENCRYPTION_KEY`
      (clé 32o, IV aléatoire, tag). Pur testable côté node — test round-trip dans rules-engine
      ? non (web). Test léger via script. Helper `sha256(buf)`.
- [ ] **P.3** Ports : `lib/providers/signature.ts`, `lib/providers/lre.ts`,
      `lib/providers/payment.ts` (interfaces du plan §2). Impl `HouseSignatureProvider`,
      `MockLreProvider`, `MockPaymentProvider`. Sélecteurs `getXProvider()`.
- [ ] **P.4** `packages/templates` : `package.json` (`@troppaye/templates`), `src/index.ts`
      (`renderTemplate(name, vars)` + registre), bandeau `[AVOCAT]`. Brouillons : `mandat.md`,
      `lettre-j0.md`, `relance-j21.md`, `proposition-j35.md`, `dernier-avis-j50.md`.

## T3 — Mandat + signature maison + pièces
- [ ] **T3.1 Claim** : action `claimDossier()` (withAuth) — relie le dossier anonyme
      (`session_token = cookie`) à `auth.uid()` (`user_id`), purge le token, transition
      autorisée. Branchée dans `app/auth/callback` quand `next` pointe vers le mandat.
- [ ] **T3.2 CTA verdict** : sur la page verdict, « Récupérer ce montant » → `/login?next=/mandat/<id>`
      (ou direct si déjà connecté). Remplace le bouton « Bientôt disponible ».
- [ ] **T3.3 PDF mandat** : `lib/pdf/mandate-document.tsx` (@react-pdf/renderer) — mandat stylé
      charte (logo, tampon, montants mono) à partir du template `[AVOCAT]` + données dossier.
      `renderMandatePdf(dossier) → Buffer`.
- [ ] **T3.4 Page mandat** : `app/mandat/[dossierId]/page.tsx` (server, `requireAuthPage` +
      ownership). Client : récap dossier + verdict, **barème slider 25 %** (`[AVOCAT]`, défaut
      verrouillé), aperçu PDF, **case de consentement** (texte `[AVOCAT]`), bouton « Signer ».
      Bandeau « brouillon — information ≠ conseil ».
- [ ] **T3.5 signMandate** (withAuth + ownership + zod) : via `SignatureProvider` →
      hash SHA-256 du PDF, insert `mandates(SIGNED)` + `signature_proofs` (consentement, IP,
      user-agent, timestamp, hash), upload PDF chiffré en storage, transition
      `DIAGNOSED→MANDATE_PENDING`. Outbox email « mandat reçu ».
- [ ] **T3.6 Pièces** : `app/mandat/[dossierId]/pieces` (ou onglet) — checklist pilotée par
      `verdict.missingData` + socle (bail, quittances). Upload → action `uploadPiece` (withAuth,
      ownership) : **chiffre** (T3.2 crypto) → storage `${uid}/dossiers/${dossierId}/${type}`,
      insert `pieces(RECEIVED)`. Quand socle minimal présent → `MANDATE_PENDING→IN_REVIEW`.
- **AC** : anonyme → login (dossier réclamé) → mandat signé (PDF + preuve) → pièces chiffrées →
  dossier `IN_REVIEW`. typecheck+build verts.

## T4 — Espace client
- [ ] **T4.1 Lecture dossier** : `lib/dossier/read.ts` — `listDossiers()/getDossier(id)` via
      `getSupabaseServer` (RLS, pas service_role). Historique d'étapes dérivé de `actions` +
      `status`.
- [ ] **T4.2 `/espace`** : liste des dossiers (carte : adresse, statut, montant `Amount`).
- [ ] **T4.3 `/espace/[dossierId]`** : frise « suivi de colis » (étapes datées, machine à états),
      carte « prochaine étape », carte montants, pièces jointes (lien `createSignedUrl` 60-300 s,
      déchiffré à la volée), messagerie **scriptée** (lecture `messages` + réponses canned) +
      bandeau « information ≠ conseil ».
- [ ] **T4.4 Notifications** : helper `notify(dossierId, event)` → insert `outbox_emails` à
      chaque changement d'étape (appelé par les transitions T3/T5).
- **AC** : un client voit son dossier et sa frise avancer ; pièces lisibles via URL signée.

## T5 — Back-office admin + pipeline de recouvrement
- [ ] **T5.1 File de revue** : `/admin/dossiers` (`requireAdminPage`) — liste `IN_REVIEW` + score
      (confidence), actions **valider** (→`RECOVERY`, génère les Actions J0/J21/J35/J50) /
      **demander pièce** / **refuser** (→`CLOSED`). **`confidence=LOW` ⇒ valider désactivé**.
- [ ] **T5.2 computeSchedule** : vérifier/compléter `packages/shared/dates.ts`
      `computeSchedule(j0)` (J0/J21/J35/J50 calendaires Europe/Paris). À la validation, insert
      `actions` planifiées (`scheduled_at`).
- [ ] **T5.3 Templates courriers + PDF** : rendus `lettre-j0…dernier-avis-j50` via
      `@react-pdf/renderer` (réutilise `lib/pdf`). `[AVOCAT]`.
- [ ] **T5.4 Cron exécuteur** : `app/api/cron/run-due-actions/route.ts` — garde `CRON_SECRET`,
      **idempotent** (verrou par `action.id`), lit `recovery_state` (skip si `PAUSED|LOCKED`),
      envoie via `MockLreProvider`, journalise outbox, avance l'action. Bouton admin
      « avancer le temps » (dev).
- [ ] **T5.5 Kanban** : `/admin/pipeline` — board par `status`.
- [ ] **T5.6 Tagging réponses** : actions admin → `LANDLORD_REPLY` (`recovery_state=PAUSED`),
      `CONTESTATION_FOND` (`LOCKED`/`ESCALATED`), `PAYMENT_RECEIVED` → `MockPaymentProvider`
      (`fund_movements`), reversement simulé + facture, transition `RECOVERY→WON`.
- **AC** : un dossier parcourt `J0→…→WON` en simulé ; **pause auto** à la réponse bailleur ;
  aucune relance ne part si `LOCKED`.

## T6 — Seeds démo + durcissement + QA (automatisé ; visuel = fondateur)
- [ ] **T6.1 Seeds** : `supabase/seed.sql` (ou script) — 8-10 dossiers (un par état) +
      `admin@troppaye.test` + 2-3 clients. Réutilisables après `db:reset`.
- [ ] **T6.2 Vérifs sécurité** : tests/SQL — isolation RLS (client A ≠ client B), cascade
      suppression RGPD, round-trip chiffrement pièces, cron refuse sans `CRON_SECRET`.
- [ ] **T6.3 a11y** : labels/aria/focus + `prefers-reduced-motion` sur toutes les surfaces.
- [ ] **T6.4 Playwright e2e** : parcours complet anonyme→verdict→login→mandat→signature→pièces
      →admin valide→cron→WON. (Automatisé ; le walkthrough visuel reste à toi.)
- [ ] **T6.5 Revue adversariale** multi-agents (sécurité/RLS/justesse/conventions) du diff
      T3→T6 → corriger les findings confirmés.
- **AC** : e2e vert, vérifs sécurité vertes, prêt pour ta revue visuelle finale.

---

## Stratégie d'exécution & vérification
- **Ordre** : P → T3 → T4 → T5 → T6 (tranches verticales, dépendances respectées).
- **Coeur cohérent par moi** : transitions d'état, server actions, flux sensibles RLS/crypto,
  cron idempotent. **Sous-agents en parallèle** pour le bien-borné : brouillons templates,
  composants PDF, seeds, et la **revue adversariale finale** (Agent tool, pas de workflow requis).
- **Palier de vérif à chaque fin de tranche** : `pnpm -r typecheck` · tests moteur ·
  `pnpm --filter @troppaye/web build` ; commits séparés par changement logique ; jamais de
  secret committé.
- **Pas de vérif visuelle de ma part** (ta décision) — je livre les checks auto + une démo
  e2e ; tu fais la revue visuelle quand le site est finalisé.
- **`[AVOCAT]`/`TODO_VERIFIER`** : tout texte juridique et toute valeur réglementaire restent
  marqués ; rien d'inventé ; barème 25 % = placeholder verrouillé.

## Risques / points de vigilance
- **Claim anonyme→authentifié** : fenêtre où le cookie et la session coexistent — transition
  idempotente, refuser si le dossier appartient déjà à un autre `user_id`.
- **Chiffrement pièces** : la clé `PIECES_ENCRYPTION_KEY` doit exister en env ; sans elle,
  l'upload échoue proprement (pas de stockage en clair).
- **Cron idempotence** : double exécution ne doit jamais envoyer deux fois (verrou par action).
- **RLS vs service_role** : lectures client via anon/RLS ; service_role réservé cron/back-office
  serveur.
- **PDF @react-pdf** : runtime Node (pas Edge) pour les routes qui génèrent des PDF.
