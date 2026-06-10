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

**Pièges de mesure (vécus le 2026-06-11) — vérifier AVANT de croire les scores :**
1. **Serveur orphelin** : tuer tout node sur le port AVANT de relancer
   (`Get-NetTCPConnection -LocalPort 3005`) — deux serveurs peuvent co-écouter
   sous Windows et l'ancien sert un HTML dont les chunks n'existent plus.
2. **CSS 200 ?** `curl -s localhost:3005/ | grep -o '/_next/[^\"]*\.css'` puis
   curl le fichier — un 404/500 = page non stylée = LCP/scores faux.
3. **Filmstrip** : extraire `screenshot-thumbnails` du JSON et REGARDER une
   vignette — c'est ce qui a révélé une page sans CSS (logo géant = faux LCP).
4. Supabase local wedgé (Kong 499 / PostgREST « statement timeout ») fait
   pendre le prerender ISR de la home au build → `docker restart supabase_rest_Trop-paye`.

## Mesures du 2026-06-10 (machine chargée : 2 dev servers + 3 piles Supabase)

| Catégorie | Score | Cible |
|---|---|---|
| Performance | **68** | ≥ 90 ❌ |
| Accessibilité | 96 | AA ✅ |
| Bonnes pratiques | 96 | ✅ |
| SEO | 100 | ✅ |

Détail perf : LCP 3,7 s · TBT 680 ms · CLS 0.

## Mesures du 2026-06-11 — après la passe perf (machine toujours chargée : 3 piles Supabase)

| Catégorie | Runs | Médiane | Cible |
|---|---|---|---|
| Performance | 72 / 75 / 85 | **75** (était 68) | ≥ 90 ⏳ machine calme |
| Accessibilité | — | 96 | ✅ |
| Bonnes pratiques | — | 96 | ✅ |
| SEO | — | 100 | ✅ |

Détail perf (médiane) : LCP 3,2-3,4 s (élément = H1 ✓) · TBT 630 ms (360 ms sur
le run le moins perturbé) · CLS 0. Fait : motion retiré du bundle home (reveal
CSS + compteur vanilla), H1 LCP en translation seule. Restant = éval framework
(~220 KB, plancher Next/React) amplifiée par la charge machine et le ×4 CPU
simulé → **re-mesurer sur machine calme avant toute optimisation de plus**.

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
