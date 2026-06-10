# TropPayé

Plateforme web qui détecte les loyers irréguliers (France) et récupère le trop-perçu
pour le compte des locataires — commission au succès. Monorepo pnpm.

- `apps/web` — Next.js 16 (site public, espace client, back-office, API).
- `packages/rules-engine` — moteur de règles **pur** (zéro I/O, testé à 100 %).
- `packages/shared` — marque/tokens, schémas zod, machine à états, utilitaires.
- `packages/templates` — courriers & mandat (contenu **[AVOCAT]**).
- `packages/video` — squelette Remotion (vidéos sociales).

## Prérequis
Node 22 LTS · pnpm 9 · Docker (Supabase local).

## Démarrage
```bash
pnpm install
pnpm db:start          # Supabase local (Docker)
pnpm db:reset          # migrations + seed
pnpm dev               # http://localhost:3000
```

## Commandes
`pnpm dev` · `pnpm test` · `pnpm typecheck` · `pnpm lint` · `pnpm verdict <fixture.json>`

Spécifications dans `docs/`. Plan d'implémentation : `docs/superpowers/plans/`.
Décisions et endpoints : voir `CLAUDE.md`.
