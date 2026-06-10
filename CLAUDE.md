# TropPayé

Plateforme web qui détecte les loyers irréguliers (France) et récupère
le trop-perçu pour le compte des locataires (commission au succès).

## Stack
- Monorepo pnpm : `apps/web` (Next.js 16, App Router, TS — front public,
  espace client, back-office ET API via Route Handlers + Server Actions :
  pas de backend séparé), `packages/rules-engine` (lib pure TS, zéro I/O),
  `packages/templates`, `packages/shared` (brand/tokens + zod), `packages/video`.
- Données : **Supabase région Paris** — Postgres + Auth (magic links) +
  Storage + RLS, via `supabase-js`. Migrations SQL versionnées (Supabase CLI).
  Dev en local Docker → cloud. 100 % des données en France (résidence) +
  chiffrement applicatif des pièces sensibles (mitigation Cloud Act).
- Séquences de relance (J0/J21/J35/J50) : table `actions` + `scheduled_at` +
  route interne sécurisée (`CRON_SECRET`), idempotente (verrou par action.id),
  qui lit `recovery_state` (SCHEDULED|PAUSED|LOCKED) avant tout envoi.
- Tests : Vitest (rules-engine 100 %), Playwright (e2e).

## Principes non négociables
1. Le moteur (`packages/rules-engine`) est PUR : déterministe, aucune I/O.
   Données externes (DPE, IRL) injectées en paramètres. Testable hors ligne.
2. Toute règle juridique porte `effectiveFrom`/`effectiveTo`. Le droit
   applicable dépend des dates du dossier, jamais de la date du jour.
3. Tout verdict référence : règle (id+version), base légale, calcul détaillé
   (audit trail JSON), score de confiance (HIGH | MEDIUM | LOW).
4. Montants en centimes (int), dates ISO, fuseau Europe/Paris.
5. Jamais de texte juridique improvisé : courriers/messages depuis
   `packages/templates` (contenu **[AVOCAT]**, ne pas modifier le sens).
6. RGPD : pas de log de PII ; pièces chiffrées ; suppression en cascade dès
   le début ; RLS sur toutes les tables.
7. Sécurité Next 16 : chaque Server Action = `withAuth` (session + ownership
   + validation zod). `proxy.ts` (ex-middleware) ≠ autorisation.

## Règles métier (corrections issues de la recherche — détails dans docs/)
- **3 régimes DISTINCTS** : gel F/G (trop-perçu sur hausses post-24/08/2022)
  ≠ bouclier 3,5 % (T3-2022→T1-2024, même hors F/G) ≠ décence / interdiction
  de louer G(2025)/F(2028) = orientation judiciaire, **jamais chiffrée** en
  répétition automatique.
- Adresse : **Géoplateforme IGN** `data.geopf.fr/geocodage` (la BAN
  `api-adresse.data.gouv.fr` est morte). ADEME slug **`dpe03existant`**.
  IRL série INSEE **001515333** (table seedée + cron).
- Signature **MAISON** (eIDAS « simple »). LRE + paiements = **MOCK** derrière
  des ports. Emails de notif = **outbox** jusqu'à clé Resend/Brevo.
- UI : variantes dans `/design-lab` (je tranche, j'archive les autres).
  Montants en Spline Sans Mono, `tabular-nums`, vert `refund` si en faveur
  du locataire. `prefers-reduced-motion` partout.
- Valeurs réglementaires = **TODO_VERIFIER**. Copy-deck mot pour mot ;
  brouillons UI non-juridiques marqués « brouillon » ; **[AVOCAT]** jamais
  en prod sans validation.

## Commandes
`pnpm dev` · `pnpm test` · `pnpm typecheck` · `pnpm lint` · `pnpm verdict <fixture.json>`
· `pnpm db:start` · `pnpm db:reset` · `pnpm db:types`

Plan d'implémentation : `docs/superpowers/plans/2026-06-10-troppaye-mvp.md`

<!-- tokenade-scaffold -->
## Tokenade rules (v3)

- **Default to tokenade MCP tools** for codebase questions: `mcp__tokenade__semantic_search` for natural-language queries, `symbol_find` for known identifiers, `structure_map` for repo overview, `skeleton` for large files, `call_hierarchy` for "who calls X / what does Y call". Fall back to `grep` / `find` / whole-file `Read` only when the query doesn't fit a structured shape.
- **Subagents you spawn** also need these tools. The Claude Code hook auto-injects a tokenade preamble into every `Task`/`Agent` prompt, so spawned subagents inherit the preference without you having to remember.
- **Fix root causes, not symptoms.** Before patching a visible failure, write the one-sentence answer to "what mechanism produced this, and is my patch addressing the mechanism or the artifact?" Only paper over an artifact when the real fix is out of scope, and say so explicitly.
- For noisy shell commands, route through `tokenade wrap '<cmd>'` — the PreToolUse Bash hook does this automatically when installed.
- **When a compactor folded bytes you need verbatim** (exact JSON, exact diff, single error line lost to dedup): recover them instantly via `mcp__tokenade__expand_ref` with the `hash=…` printed in the compactor's banner — no re-execution, no re-cost. Only fall back to `tokenade raw <cmd>` (aliases: `bypass`, `noproxy`) or `TOKENADE_HOOK_DISABLED=1` when you actually need to re-run a command WITHOUT compaction (e.g., to capture stderr that auto-compact dropped on the floor).
<!-- /tokenade-scaffold -->
