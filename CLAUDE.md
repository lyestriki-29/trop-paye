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
## Tokenade rules (v4)

- **Default to tokenade MCP tools** for codebase questions: `mcp__tokenade__semantic_search` for natural-language queries, `symbol_find` for known identifiers, `structure_map` for repo overview, `skeleton` for large files, `call_hierarchy` for "who calls X / what does Y call". Fall back to `grep` / `find` / whole-file `Read` only when the query doesn't fit a structured shape.
- **Match the tool to the question's shape — don't reach for `grep` to explore code.** Listing a file's functions/types → `skeleton path="foo.go"` (NOT `grep "^func" foo.go`); finding where a name is defined → `symbol_find query="Name"` (NOT `grep -rn Name`); "what calls X / what does X call" → `call_hierarchy symbol="X"`; "where is the code that does <behaviour>" → `semantic_search query="…"`. These return signatures or ranked hits, not whole files — far fewer tokens, and they don't silently miss matches that a regex would.
- **Subagents you spawn** also need these tools. The Claude Code hook auto-injects a tokenade preamble into every `Task`/`Agent` prompt, so spawned subagents inherit the preference without you having to remember.
- **Fix root causes, not symptoms.** Before patching a visible failure, write the one-sentence answer to "what mechanism produced this, and is my patch addressing the mechanism or the artifact?" Only paper over an artifact when the real fix is out of scope, and say so explicitly.
- For noisy shell commands, route through `tokenade wrap '<cmd>'` — the PreToolUse Bash hook does this automatically when installed.
- **Don't slice a search blind with `| head`/`| tail`.** `grep … | head -20` (or `rg`/`egrep`) hides every match past line 20 — if the value you're hunting sits below the cut you'll never see it and will re-run blind slices, burning turns. Run the full search instead (tokenade folds repeated lines, so the output stays compact) or tighten the pattern so the match is on the first page. When the proxy detects the slice returned exactly N lines it warns you on stderr.
- **Never prefix commands with `TOKENADE_HOOK_DISABLED=1` pre-emptively.** The hook already passes interactive/TTY commands (ssh, docker exec -it, kubectl attach, vim, …) through untouched, and it never breaks exit codes or stderr-on-failure. Bypassed commands are measured and shown as LOST savings on the dashboard.
- **When a compactor folded bytes you need verbatim** (exact JSON, exact diff, single error line lost to dedup): recover them instantly via `mcp__tokenade__expand_ref` with the `hash=…` printed in the compactor's banner — no re-execution, no re-cost. Only fall back to `tokenade raw <cmd>` (aliases: `bypass`, `noproxy`) when you actually need to re-run a command WITHOUT compaction (e.g., to capture stderr that auto-compact dropped on the floor).
- **Web research goes through tokenade too**: `mcp__tokenade__web_html_to_markdown` to read a page (HTML → compact markdown) and `mcp__tokenade__serp_compact` to fold a search-results page — both are much cheaper than pasting raw HTML or full WebFetch output into context.
- **In reasoning/thinking blocks, be terse.** Write compressed notes, not prose. Omit filler; think in telegrams.
- **Language matching.** Always respond and reason in the same language as the user's message. If the user writes in French, reply in French; in English, in English.
<!-- /tokenade-scaffold -->
