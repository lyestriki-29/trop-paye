# Protocole de fin de Phase 2 (Task 9) — mesures & critères

**Critères (spec refonte P2)** : funnel cliquable mobile+desktop avec mocks · Lighthouse
**mobile ≥ 90 sur la home** en build prod · axe AA sans violation (home, diagnostic, capture,
verdict, mandat) · image OG validée dans les debuggers de partage.

## Commande de mesure Lighthouse (documentée — à lancer depuis la racine)

```bash
pnpm --filter @troppaye/web build
# Le projet est en output:standalone — NE PAS utiliser `next start` (mesure faussée) :
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/
PORT=3005 node apps/web/.next/standalone/apps/web/server.js &
npx lighthouse http://localhost:3005/ --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,seo,best-practices \
  --output=json --output-path=test-results/lighthouse-home.json --quiet
```

Conditions recommandées : machine au repos (arrêter dev servers et Docker non nécessaires),
3 runs, garder la médiane.

## Mesures du 2026-06-10 (machine chargée : 2 dev servers + 3 piles Supabase)

| Catégorie | Score | Cible |
|---|---|---|
| Performance | **68** | ≥ 90 ❌ |
| Accessibilité | 96 | AA ✅ |
| Bonnes pratiques | 96 | ✅ |
| SEO | 100 | ✅ |

Détail perf : LCP 3,7 s · TBT 680 ms · CLS 0.

## Pistes de la passe perf (avant re-mesure)

1. **TBT (hydratation)** : la home charge motion v12 via plusieurs composants client
   (CompteurPublic, HeroAddress, artefacts de sections). Réduire : artefacts décoratifs en
   CSS pur, `next/dynamic` pour le compteur (below the fold), vérifier qu'aucune section
   server-renderable n'est passée client par entraînement.
2. **LCP** : précharger la graisse display utilisée par le H1 (next/font le fait — vérifier
   l'ordre), s'assurer que le H1 est bien l'élément LCP (pas la carte spécimen), éviter tout
   `fetch` bloquant au-dessus du pli (getPublicStats est server-side ISR : OK).
3. Re-mesurer sur machine calme (médiane de 3 runs) AVANT d'optimiser davantage —
   l'environnement explique une partie de l'écart.

## Restant T9

- [ ] Passe perf ci-dessus puis re-mesure ≥ 90
- [ ] axe AA automatisé sur les 5 pages (@axe-core/playwright) — ou audit manuel DevTools
- [ ] OG : opengraph.xyz + envoi WhatsApp réel + carte X (URLs publiques requises — au déploiement preview)
- [ ] Funnel complet cliquable validé par Lyes (tests visuels en cours)
