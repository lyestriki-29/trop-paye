# TropPayé — Plan d'implémentation MVP

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer un MVP **cliquable de bout en bout** de TropPayé (site public + diagnostic/questionnaire + verdict animé + mandat + signature maison + espace client + back-office admin), avec moteur de règles réel testé à 100 %, données externes publiques réelles (Géoplateforme, ADEME) et prestataires sensibles simulés derrière des ports.

**Architecture:** Monorepo pnpm. `apps/web` = Next.js 16 (App Router, Server Actions, pas de backend séparé). `packages/rules-engine` = lib **pure** (zéro I/O, données injectées). `packages/shared` = brand/tokens + schémas zod + machine à états + utilitaires temps/argent. `packages/templates` = courriers/mandat ([AVOCAT]). `packages/video` = squelette Remotion. Données : **Supabase** (région Paris) via **supabase-js + RLS** ; migrations SQL versionnées (Supabase CLI) ; dev en **local Docker** puis `supabase link` cloud. Intégrations sensibles (signature, LRE, paiements) derrière des **ports/adapters** (impl réelle maison pour la signature, Mock pour LRE/paiements).

**Tech Stack:** Next.js 16.2.x · React 19.2 · TypeScript 5.6+ (strict, zéro `any`) · Tailwind v3 (tokens charte) · `motion` (ex-Framer Motion) · Supabase (Postgres + Auth magic links + Storage + RLS) · supabase-js · Vitest · Playwright · Zod · `next/og` (ImageResponse natif) · Node 22 LTS · pnpm 9.

---

## 0. Décisions verrouillées (priment sur les specs en cas de conflit)

| Sujet | Décision |
|---|---|
| Framework | Next.js **16.2.x** (greenfield, pas de 14). `cacheComponents:true` ; règle : public non personnalisé → `use cache`+`cacheTag` ; **données dossier = dynamiques, jamais en scope cache**. |
| Données | **Supabase Paris** + **supabase-js + RLS** (pas de Prisma → RLS jamais bypassée). Migrations SQL via Supabase CLI. Dev local Docker → cloud. |
| Auth | Magic links Supabase, **expiration 15-30 min**, page intermédiaire « Se connecter » (anti-prefetch SafeLinks). Rôle `admin` séparé du client. |
| Moteur | **Pur**, 3 règles V1 : `DPE_FREEZE`, `IRL_OVERCHARGE` (incl. bouclier 3,5 %), `DEPOSIT_LATE` + agrégateur anti-double-comptage. TDD, 100 % couverture. |
| Signature | **Maison** (eIDAS « simple » SES) derrière un port `SignatureProvider`. Pas de Yousign en V1. Opposabilité = `[AVOCAT]`. |
| Adresse/DPE | **Réels** : Géoplateforme IGN + ADEME `dpe03existant`, derrière `AddressProvider` / `DpeProvider`, avec cache. |
| LRE / Paiements | **Mock** derrière `LreProvider` / `PaymentProvider` (webhooks + délais simulés, boutons admin « simuler »). Aucun euro/courrier réel. |
| Emails | Notifications = **outbox** (table + console) jusqu'à clé Resend/Brevo. |
| Variantes UI | Je tranche la meilleure → page réelle ; 2-3 variantes déposées dans `/design-lab` pour arbitrage. |
| Branding | Logo + tampon **SVG/CSS fait main**. |
| Copy | Copy-deck mot pour mot ; `TODO_COPY` pour les manques ; brouillons UI non-juridiques marqués « brouillon » ; `[AVOCAT]` intouchés + bandeau. |
| Délais pipeline | **Jours calendaires**, fuseau **Europe/Paris**, J0 = date d'envoi effective. Fonction pure `computeSchedule`. (`[AVOCAT]` sur calendaire vs ouvré.) |
| Hors chemin critique | Remotion (squelette only), OG dynamique (OG statique au départ), 3-variantes systématiques → après la démo end-to-end. |

---

## 1. Modèle de domaine & machine à états

**Tables (SQL, snake_case) :** `profiles` (id=auth.uid, role client|admin, prénom/nom/tél), `dossiers`, `rent_events`, `verdicts`, `mandates`, `signature_proofs`, `pieces`, `actions`, `fund_movements`, `messages`, `outbox_emails`, `access_logs` ; référentiels `irl_index`, `tense_zone_communes`, `fee_cap_zones`, `legal_rules`. Montants en **centimes (int)**, dates **ISO**, `created_at/updated_at`.

**Machine à états `dossiers.status`** (transitions autorisées explicites — implémentées dans `packages/shared/src/dossier-state-machine.ts`, vérifiées à chaque mutation) :

```
DRAFT ──diagnostic complété──▶ DIAGNOSED
DIAGNOSED ──signature mandat──▶ MANDATE_PENDING
MANDATE_PENDING ──pièces min. fournies──▶ IN_REVIEW
IN_REVIEW ──admin valide (confidence≠LOW)──▶ RECOVERY
IN_REVIEW ──admin refuse──▶ CLOSED
RECOVERY ──contestation de fond──▶ ESCALATED
RECOVERY ──paiement encaissé+reversé──▶ WON
RECOVERY ──échec/clôture──▶ LOST
ESCALATED ──issue partenaire──▶ WON | LOST
WON | LOST ──▶ CLOSED
```

**`dossiers.recovery_state`** (`SCHEDULED | PAUSED | LOCKED`) — **lu par le cron AVANT toute Action** : `LANDLORD_REPLY` → `PAUSED` ; `CONTESTATION_FOND` → `LOCKED` (aucune relance ne peut partir). Garde-fou risque n°1.

**Garde-fou bloquant (code, pas doc) :** `confidence = LOW` ⇒ bouton « valider → J0 » **désactivé** ; aucune zone de texte libre vers le bailleur (templates only) ; bandeau « information ≠ conseil » sur verdict/espace/messagerie.

---

## 2. Ports / adapters (`apps/web/lib/providers`)

```ts
interface AddressProvider   { complete(q): Promise<Suggestion[]>; geocode(q): Promise<GeoResult> }   // Géoplateforme IGN
interface DpeProvider       { byAddress(banId,label): Promise<Dpe[]>; byNumber(n13): Promise<Dpe|null> } // ADEME dpe03existant + cache
interface SignatureProvider { createEnvelope(docs): Promise<Envelope>; sign(envelopeId,consent): Promise<SignatureProof>; getStatus(id) } // HouseSignatureProvider (réel)
interface LreProvider       { send(letter): Promise<{ref}>; getStatus(ref) }   // MockLreProvider (webhook simulé + bouton admin)
interface PaymentProvider   { recordIncoming(...); payout(...) }               // MockPaymentProvider (FundMovement, bouton admin)
```
Real now : Address, Dpe, Signature. Mock now : Lre, Payment (swap réel = nouvelle impl du même port, zéro changement domaine).

---

## 3. Moteur de règles (`packages/rules-engine`) — design

Interface (kit §3) : `evaluateAll(snapshot, referentials, asOf) → VerdictGlobal`. Chaque règle : `RuleResult { ruleId, ruleVersion, outcome (IRREGULAR|COMPLIANT|INSUFFICIENT_DATA), confidence (HIGH|MEDIUM|LOW), recoverableCents, futureMonthlySavingCents, actionDeadline?, missingData?, computation (trace) }`.

**`DPE_FREEZE`** — UNIQUEMENT le trop-perçu sur **hausses post-24/08/2022** d'un bien **F/G à la date de la hausse**. Entrées : `dpeHistory[]` (classe, date, surface, source), `rentHistory[]`, `leaseSignedAt`. Dégel = date d'un DPE **≤ E** post-travaux (daté + n° ADEME) ; sinon le gel court. `recoverable` = Σ (loyer payé − loyer légal figé) bornée à **3 ans glissants avant asOf** (plancher prudent). Confidence HIGH si `dpeSource=ADEME_API` + RentEvents pertinents en `source:"quittance"`, sinon MEDIUM ; classe inconnue → INSUFFICIENT_DATA. **NE PAS** chiffrer l'interdiction de louer G/F (→ signal `indecenceSignal` séparé, orientation, jamais un montant).

**`IRL_OVERCHARGE`** — 3 causes : (a) **pas de clause de révision** ⇒ toute indexation indue ; (b) **dépassement IRL** (loyerMax = loyerPrécédent × IRL(ref,N)/IRL(ref,N-1)) ; (c) **bouclier 3,5 %** si révision prend effet **T3-2022→T1-2024** (métropole), plafonnée — générateur distinct **même hors F/G**. Rétroactivité post-ALUR : rappel antérieur à la demande = indu. Arrondi : IRL 2 décimales, résultat au centime (convention testée).

**`DEPOSIT_LATE`** — délai 1 mois (EDL conforme) / 2 mois sinon ; dû = dépôt − retenues justifiées ; pénalité = 10 % loyer mensuel HC × mois de retard **entamés**. Calcul autonome.

**Agrégateur** — exécute toutes les règles à la date, agrège les IRREGULAR, **déduplique les périodes** (jamais deux fois le même euro : si DPE_FREEZE et IRL_OVERCHARGE couvrent la même hausse, retenir le fondement au recouvrable le plus élevé, l'autre en subsidiaire), produit le `VerdictGlobal`. Toute valeur réglementaire issue des référentiels porte un flag `verified` ; si `false` → `TODO_VERIFIER` propagé dans la trace.

---

## 4. Sécurité / RGPD (conventions dès le jour 1)

- **`withAuth(action)`** : chaque Server Action = (1) session Supabase, (2) ownership/rôle, (3) `zod.parse(payload)` — sinon throw. Traiter toute action comme un POST public (anti-IDOR). `proxy.ts` = rewrites légers only, **jamais** l'autorisation.
- **RLS** sur toutes les tables (`auth.uid()`). Back-office/cron = `service_role` **côté serveur uniquement**. Anonyme : écrit via Server Action service_role clé = `sessionToken` cookie httpOnly signé ; réclamation du dossier au login.
- **Storage** : buckets privés, chemin `${userId}/dossiers/${dossierId}/${type}`, policy `storage.foldername(name)[1] = auth.uid()`, lecture via `createSignedUrl` 60-300 s. **Chiffrement applicatif AES-256-GCM** des pièces sensibles avant upload (`PIECES_ENCRYPTION_KEY`). CNI : vérifier puis purger.
- `access_logs` (qui a vu quel dossier), suppression **cascade** RGPD, zéro log de PII.

---

## 5. Arborescence cible

```
troppaye/
├─ pnpm-workspace.yaml · package.json · tsconfig.base.json · .gitignore · .env.local · .env.example
├─ CLAUDE.md · README.md
├─ supabase/ (config.toml · migrations/*.sql · seed.sql)
├─ docs/ (8 specs + charte-graphique-design-troppaye.md · superpowers/plans/)
├─ apps/web/
│  ├─ next.config.ts · proxy.ts · tailwind.config.ts · playwright.config.ts
│  ├─ app/ (site public, (diagnostic), (mandat), espace/, admin/, api/{og,cron,health}, design-lab/)
│  ├─ components/ (ui/, verdict/, questionnaire/, dashboard/, admin/, brand/{Logo,Stamp})
│  ├─ lib/ (supabase/{server,browser,admin}.ts · auth/withAuth.ts · providers/* · crypto.ts · referentials.ts)
│  └─ tests/ (playwright e2e)
└─ packages/
   ├─ shared/  (brand.ts · tokens.ts · schemas/*.ts · money.ts · dates.ts(computeSchedule) · dossier-state-machine.ts)
   ├─ rules-engine/ (src/{types,rules/*,aggregate,index}.ts · cli/verdict.ts · tests/* · fixtures/*.json)
   ├─ templates/ (mandat.md · lettre-J0-*.md · relance-J21.md · proposition-J35.md · dernier-avis-J50.md  [AVOCAT])
   └─ video/   (remotion squelette)
```

---

## 6. Tranches verticales (chaque tranche est démontrable seule)

### T0 — Socle (bite-sized ci-dessous)
Monorepo, Next 16, Tailwind tokens, Supabase local, schéma + RLS, auth client/admin, CLAUDE.md, CI. **AC :** `pnpm dev` sert la home brandée ; `supabase start` OK ; login magic link local fonctionne ; `pnpm -r typecheck/lint/test` vert.

### T1 — Rules-engine (bite-sized ci-dessous)
3 règles + agrégateur + CLI. **AC :** ≥ 50 tests (dont les 3 cas limites DPE + bouclier 3,5 %), 100 % couverture, `pnpm verdict fixtures/cas-XXX.json` rend un verdict lisible.

### T2 — Diagnostic public + verdict
Questionnaire une-question-par-écran (autosave, reprise), Géoplateforme (autocomplete) + ADEME réels, confirmation logement, capture email après aperçu, page verdict + **séquence animée** (tampon, count-up, reduced-motion), OG statique. Variantes hero/verdict en `/design-lab`. **AC :** parcours anonyme complet → verdict chiffré avec base légale + confiance + deadline + mention « information ≠ conseil ».

### T3 — Mandat + signature maison + pièces
Récap, barème (slider 25 %), **signature maison** (consentement, hash PDF, audit, `signature_proofs`), upload pièces chiffrées (checklist pilotée par `missingData`). **AC :** mandat signé → PDF dans l'espace, dossier `MANDATE_PENDING`→`IN_REVIEW`.

### T4 — Espace client
Frise « suivi de colis » (étapes datées, pièces jointes), carte « prochaine étape », carte montants (mono/refund), messagerie scriptée + bandeau, notifications outbox à chaque changement d'étape. **AC :** un client voit son dossier avancer en temps réel.

### T5 — Back-office admin + pipeline
File de revue (scoring, valider/demander pièce/refuser, **LOW bloquant**), kanban pipeline, génération PDF courriers depuis templates, exécuteur `/api/cron/run-due-actions` (idempotent, lit `recovery_state`) + bouton « avancer le temps », tagging réponses (PAIEMENT/CONTESTATION…), encaissement/reversement **simulés** + facture. **AC :** un dossier parcourt J0→…→WON en simulé, pause auto à la réponse bailleur.

### T6 — Seeds démo + durcissement + QA
8-10 dossiers (un par état) + comptes `admin@troppaye.test` & clients, RLS/chiffrement/cascade vérifiés, a11y AA, Lighthouse, **walkthrough Playwright** commenté + compte rendu. **AC :** revue « vivante » sur toutes les surfaces.

---

## 7. T0 — tâches bite-sized

### Task T0.1 : Workspace pnpm
- [ ] Créer `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `package.json` racine (scripts `dev/build/lint/typecheck/test/db:*`), `tsconfig.base.json` (strict, `paths` `@troppaye/*`).
- [ ] Créer `.env.example` (copie de `.env.local` sans valeurs).
- [ ] `pnpm install` → vérifier l'arbre workspace. Commit `chore: init monorepo pnpm`.

### Task T0.2 : `packages/shared`
- [ ] `brand.ts` (nom, baseline « Récupérez ce que votre loyer vous doit. », hooks, tokens charte), `tokens.ts` (export CSS vars + objet JS), `money.ts` (centimes ↔ €, format fr-FR), `dates.ts` (`computeSchedule(j0)` calendaire Europe/Paris), `dossier-state-machine.ts` (transitions + `canTransition`). Tests Vitest des purs. Commit.

### Task T0.3 : Next 16 + Tailwind tokens
- [ ] `apps/web` via `create-next-app@latest` (TS, App Router, Tailwind, ESLint flat). `next.config.ts` : `cacheComponents:true`, `output:'standalone'`, `images.remotePatterns`. Retirer `--turbopack` des scripts.
- [ ] `tailwind.config.ts` mappé sur les tokens (ink/paper/paper-2/refund/refund-text/stamp/line, polices via `next/font/google` Bricolage Grotesque/Public Sans/Spline Sans Mono, échelle 12-64). Home brandée minimale + `Logo`/`Stamp` SVG. `pnpm dev` visuel. Commit.

### Task T0.4 : Supabase local + schéma + RLS
- [ ] `pnpm add -D supabase` ; `pnpm supabase init` ; `pnpm supabase start` (Docker).
- [ ] Migration `0001_init.sql` : toutes les tables (§1) + enums + index + `updated_at` triggers.
- [ ] Migration `0002_rls.sql` : RLS sur toutes les tables, policies `auth.uid()`, Storage policies, bucket privé `pieces`.
- [ ] `pnpm supabase db reset` OK. Générer types `pnpm supabase gen types typescript`. Commit.

### Task T0.5 : Auth + clients supabase + withAuth
- [ ] `lib/supabase/{server,browser,admin}.ts`, `lib/auth/withAuth.ts`, page login magic link + page intermédiaire, callback, rôle admin. Smoke test login local. Commit.

### Task T0.6 : CLAUDE.md + CI
- [ ] `CLAUDE.md` racine = section 1 du kit **+ décisions §0 + bloc tokenade** conservé ; déplacer les 8 specs dans `docs/`, renommer la charte. `.github/workflows/ci.yml` (typecheck+lint+test). Commit.

## 8. T1 — tâches bite-sized (TDD strict : test rouge → impl → vert → commit, par cas)

### Task T1.1 : Types & fixtures
- [ ] `src/types.ts` (DossierSnapshot, Referentials, RuleInput, RuleResult, ComputationTrace, VerdictGlobal). 3 fixtures `fixtures/cas-001..003.json` (DPE F + hausse ; conforme ; relocation). Commit.

### Task T1.2 : `DPE_FREEZE` (≥15 cas)
- [ ] Écrire les tests d'abord (15 cas dont : nouveau DPE ≤ E entre 2 hausses ; DPE multiples surface ±10 % ; bail après hausse/relocation ; classe inconnue → INSUFFICIENT_DATA ; prescription 3 ans ; **interdiction de louer NON chiffrée**). Lancer → rouge.
- [ ] Implémenter `rules/dpe-freeze.ts` minimal → vert. Couverture 100 % du fichier. Commit.

### Task T1.3 : `IRL_OVERCHARGE`
- [ ] Tests : sans clause = indu total ; dépassement IRL ; **bouclier 3,5 % T3-2022→T1-2024** ; rétroactivité ALUR ; arrondis. → rouge → impl → vert. Commit.

### Task T1.4 : `DEPOSIT_LATE`
- [ ] Tests : délai 1 vs 2 mois ; pénalité 10 % × mois entamés ; retenues justifiées. → rouge → impl → vert. Commit.

### Task T1.5 : Agrégateur + CLI
- [ ] Tests dédup périodes (DPE vs IRL même hausse). Impl `aggregate.ts`. `cli/verdict.ts` (`pnpm verdict <fixture.json>` rendu fr + `--json`). Vérifier sur les 3 fixtures. Commit.

---

## 9. Registre TODO_VERIFIER / [AVOCAT] (à trancher par le fondateur/avocat, ne bloque pas la démo)

- `[AVOCAT]` : opposabilité signature maison (eIDAS simple) ; mentions R124-4 du mandat ; périmètre recouvrement amiable vs conseil (pacte de quota litis) ; délai 21 j calendaire vs ouvré ; tous passages [AVOCAT] du copy-deck.
- `TODO_VERIFIER` : valeurs IRL seedées (incohérence apparente 2025) ; dates/seuils décence ; point de départ prescription (connaissance) ; couverture ADEME mesurée sur ~20 adresses.
- **Business** : licence Remotion (≥4 personnes) ; custom SMTP domaine ; compte dédié R124 + RC pro + déclaration procureur (avant tout euro réel).

## 10. Handoff d'exécution
Plan complet. Exécution en **subagent-driven-development** (sous-agent frais par tâche + revue), tranches T0→T6 dans l'ordre, commits par changement logique, typecheck+tests verts à chaque palier. Arrêt/échec → diagnostic avant correctif. Revue fondateur au réveil : `pnpm dev` + walkthrough Playwright.
