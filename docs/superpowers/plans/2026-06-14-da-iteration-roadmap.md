# Itération DA néubrutaliste — Feuille de route (4 phases)

> Roadmap global. Branche `feat/da-neubrutalist-public`.
> Specs source : `docs/superpowers/specs/2026-06-14-tunnel-verdict-da-iteration.md`
> (chantiers 1-5) + `docs/superpowers/specs/2026-06-14-hero-da-design.md` (hero Mix 2 v2).
> **Méthode** : plan phasé. Chaque phase = un plan détaillé écrit juste avant de la coder,
> une PR ciblée, un palier testable (typecheck + tests verts + smoke runtime par Lyes).

## Pourquoi phasé
Les 4 chantiers sont largement indépendants et certains touchent le schéma zod / le
moteur. On livre en tranches verticales pour avoir un retour réel tôt et garder des PRs
petites (CLAUDE.md). On ne détaille en tâches bite-sized qu'une phase à la fois.

## Phase 1 — Palette « + de couleur » + bandes de section  ← EN COURS
Plan détaillé : `2026-06-14-phase1-palette.md`.
- Saturer les tokens `.nb` (lavande, corail, jaune) + ajouter menthe / ciel / orange / vert.
- Bandes de couleur pleine par section LP (hero lavande · résultats menthe · étapes ciel ·
  régimes corail · moteur noir · confiance jaune · closing orange).
- **Gate** : `pnpm typecheck` + `pnpm build` verts ; smoke visuel LP par Lyes (chaque
  bande lisible, contrastes OK, composants charte partagés intacts).
- **Base de tout le reste** : tunnel et verdict réutilisent ces tokens.

## Phase 2 — Tunnel Format A « no-scroll »
- Rail réparé (PAS de `.nb-step-badge`), split pleine page (question active | `DossierPanel`),
  header nb, chrome nb. Question « pièces » en saisie exacte > 4 (schéma zod + moteur 4+).
- Réutilise le moteur existant (`question-graph`, `reveal-state`, `progress`, render fns,
  `GuidedTunnel`→split, nouveau `DossierPanel`). **`buildPayload` inchangé**.
- **Gate** : 238 tests + 76 rules-engine verts, typecheck, smoke tunnel adresse→submit.

## Phase 3 — Verdict nb (4 états)
- `/diagnostic/[verdictId]` scope `.nb` : héros split (quittance + count-up + économie +
  fourchette + confiance | panneau « Votre dossier » + bande mandat), modules restylés,
  détail par fondement (RuleCards), pistes d'orientation NON chiffrées (3 régimes distincts).
- 4 états : Irrégulier · Conforme+signaux · Conforme · Données insuffisantes.
- **Gate** : typecheck + tests verts, smoke des 4 états par Lyes.

## Phase 4 — Polish LP + Hero + Animations
- **Hero Mix 2 v2** (spec hero) : compteur géant `−194 €` (label à droite, aéré grand écran),
  quittance nettoyée (tampon sous le total), « 37 diagnostics » (`TODO_COPY/VERIFIER`).
- Animations (`motion/react`) : reveal au scroll + stagger, count-up en vue, hover nb,
  ticker/disque/sticker. **Tout sous `prefers-reduced-motion`**.
- **Gate** : typecheck + build, smoke LP complet par Lyes, revue maison finale.

## Effort
`Max`, exécution par sous-agents (la revue maison a déjà attrapé 2 vrais bugs avant runtime).
Réutiliser au maximum la couche présentation existante.
