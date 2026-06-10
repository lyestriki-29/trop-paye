# Spec — Refonte UI/UX du site public, identité & vidéos de lancement

**Date** : 2026-06-10 · **Statut** : design validé + revue adversariale intégrée (25 findings) · **Track** : B
**Sources** : `docs/charte-graphique-design-troppaye.md`, `docs/copy-deck-troppaye.md`,
`docs/structure-site-prerequis-troppaye.md`, `docs/etude-concurrence-positionnement-troppaye.md`,
recherche web 2026-06-10 (Conny, patterns fintech/legaltech 2026).

## Décisions cadres (arbitrées par Lyes)

- **Périmètre** : tout le site public. Espace client + back-office **hors scope** (track suivant).
- **DA** : la charte « document officiel » est **challengée** — duel de 3 directions avant exécution.
- **Hero** : « tape l'adresse » — l'étape adresse du diagnostic démarre DANS le hero.
- **Capture avant verdict** : email + téléphone (détail en Phase 2).
- **Ajouts** : logo (décliné par direction), animation d'entrée sobre, plan vidéos de lancement.
- **Déploiement** : développement sur branche/preview ; bascule **en bloc** (funnel fin P2, reste
  fin P3). Jamais d'ancien/nouveau design mélangés en prod (règle « pas deux patterns »).
- **Process variantes (charte §8)** : le duel P0 règle la direction ; les sections d'office
  restantes — « comment ça marche », barème/slider, gabarit guide — gardent leurs 2-3 variantes
  de composition en P2/P3, arbitrées par Lyes.
- **Amendement charte §4 acté quel que soit le vainqueur** : un (1) reveal d'entrée du hero au
  premier chargement, registre sobre, en plus du moment verdict. À inscrire dans la charte v2.

## Phase 0 — Duel de directions artistiques (`/design-lab`)

- **Préalable technique** : re-câbler `apps/web/tailwind.config.ts` sur des variables CSS au
  format canaux — `colors: { ink: "rgb(var(--ink) / <alpha-value>)" }` + défauts `:root`
  identiques aux hex actuels (impact visuel nul). Sans ça, le scoping par direction ne peut pas
  fonctionner (Tailwind 3.4 : les hex codés en dur ignorent les variables CSS).
- **3 directions complètes** × 2 écrans témoins : **home statique** + **séquence verdict animée
  simplifiée** (le moment signature se juge en mouvement — arbitrage fiable à coût contenu).
  - **D1 « Document officiel »** : la charte actuelle — papier/encre, tampon rouge, Bricolage
    Grotesque + Public Sans + Spline Sans Mono.
  - **D2 « Relevé de compte »** : data-fintech froide et précise, la preuve par les chiffres,
    gros montants mono, zéro métaphore papier (esprit Wise/Linear).
  - **D3 « De votre côté »** : allié humain et chaleureux, gros boutons, chaleur maîtrisée
    (esprit Mes-Allocs/Alan) — l'empathie d'abord, la preuve ensuite.
- **Identité incluse** : par direction — logotype (2-3 propositions SVG), marque secondaire
  (D1 : tampon ; D2/D3 : équivalent propre), favicon, gabarit d'image OG.
- **Isolation** : tokens scopés par direction sous `/design-lab/directions/*` (possible grâce au
  préalable). Zéro impact sur le site live.
- **Interdits communs** (charte) : crème+serif « IA », noir+vert acide, 3D corporate, photos de
  stock, dégradés violets SaaS. Principes partagés : sobriété, montants mono `tabular-nums`,
  AA, mobile-first.
- **Sortie** : arbitrage Lyes → la gagnante devient la **charte v2** (doc mis à jour, y compris
  l'amendement §4) ; perdantes archivées dans `/design-lab/archive`.

## Phase 1 — Système de design

- Tokens définitifs (direction gagnante), polices via `next/font` (subset, swap).
- Composants **neutres** (le traitement visuel vient de la charte v2, pas de la v1) : Button,
  Field, Carte résultat, Indicateur d'étape, Frise de progression, Header/Footer.
- **Header** : nav (Comment ça marche, Guides, Résultats), CTA « Vérifier mon loyer », lien
  « Se connecter » vers l'espace existant. **Footer** : nav complète + mentions légales R124
  (squelette copy deck §5, [AVOCAT]).
- **Animation d'entrée** : CSS keyframes pur, **pas gaté sur l'hydratation React** (sinon LCP
  repoussé), 0,6–0,9 s, une seule fois, `prefers-reduced-motion` → fondu simple. Pas de splash.

## Phase 2 — Chemin de conversion

- **Perf préalable** : activer le rendu statique/cache des surfaces publiques (anticipé en
  commentaire dans `next.config.ts`) avant toute mesure Lighthouse.
- **Home** (contenus copy deck) : hero tape-l'adresse → Comment ça marche (3 étapes) → Confiance
  (badges de réassurance **près du CTA**) → Passoires thermiques → FAQ → CTA final. Compteur
  public branché sur les chiffres réels (jamais de chiffre inventé).
- **Hero → tunnel** : adresse sélectionnée dans le hero → navigation vers `/diagnostic` avec
  l'adresse préremplie dans le brouillon ; le tunnel reprend à l'étape suivante. `/diagnostic`
  en accès direct (guides, deep links) = parcours complet depuis l'étape adresse.
- **Tunnel diagnostic** : restylé une-question-par-écran, progression + bénéfice (« plus que 2
  questions avant votre estimation ») ; intègre le chantier A.
- **États dégradés du funnel** (spécifiés, copy `TODO_COPY`) : Géoplateforme IGN indisponible →
  saisie manuelle d'adresse ; ADEME indisponible → continuer sans DPE (distinct de « DPE
  introuvable ») ; échec de soumission de la capture → retry non destructif ; verdict
  introuvable/expiré → page dédiée.
- **Capture avant verdict** : le verdict partiel révèle le **statut sans montant** (« nous avons
  détecté une irrégularité probable » — copy deck) ; le cas **conforme passe aussi** par la
  capture. Email **obligatoire** (nécessaire à l'envoi du résultat), téléphone **optionnel au
  lancement** avec consentement séparé. **Microcopy téléphone / finalité / consentement :
  `TODO_COPY` [AVOCAT] — mise à jour du copy deck requise AVANT implémentation** (le deck
  actuel ne couvre que l'email ; interdiction d'improviser).
- **Stockage leads** : table dédiée `leads` (id, dossier_id FK cascade, email, phone nullable,
  consent_at, consent_text_version, purpose) — pas de colonnes sur `dossiers`. RLS deny-all ;
  écriture uniquement via Server Action service-role validant le `session_token` ; rate-limiting
  anti-abus (endpoint public qui écrit de la PII).
- **Page verdict — 4 états** (pas 2) :
  1. Irrégulier chiffré : séquence signature (~1,8 s, adaptée à la direction gagnante), count-up,
     CTA « Récupérer mes {X} € », score de confiance, prescription.
  2. Irrégularité **non chiffrée** (décence/interdiction de louer) : orientation partenaire,
     sans montant ni count-up — séquence dégradée à définir. `TODO_COPY`.
  3. Conforme : rassurance + veille gratuite (copy deck).
  4. Données insuffisantes : explication + pièces à fournir. `TODO_COPY`.
- **Prescription** : date affichée = expiration du mois le plus ancien encore récupérable
  (fenêtre glissante 3 ans) ; présentation à valider **[AVOCAT]** ; échéance lointaine (>1 an)
  → mention sobre sans urgence.
- **Partage & OG** : `ImageResponse` de **`next/og`** (PAS `@vercel/og` — doublon satori) ;
  polices en fichiers **statiques par graisse** embarqués (satori ne lit ni variables CSS, ni
  Tailwind, ni fontes variables) ; couleurs via les constantes JS de `@troppaye/shared`.
  **Image OG anonymisée** : montant + type d'irrégularité + ville — **jamais l'adresse**.
  Lien partagé ouvert par un tiers → **page teaser publique** (pas les données du dossier ; le
  verdict complet reste lié à la session du locataire). `verdictId` non séquentiel (UUID).
- **Tunnel mandat** : barème en clair avec slider interactif, upload de pièces avec statut par
  pièce, signature (mock), confirmation avec frise initialisée.
- **Variantes /design-lab** : « comment ça marche », barème/slider (2-3 compositions chacune).
- **Critères de fin P2 (protocole)** : funnel complet cliquable mobile + desktop **avec mocks**
  (signature/LRE/paiement, conformément au CLAUDE.md) ; Lighthouse **mobile ≥ 90 sur la home**
  en build prod (commande documentée dans le repo) ; axe AA sans violation sur home, diagnostic,
  capture, verdict, mandat ; image OG validée dans les debuggers de partage (WhatsApp/X).

## Phase 3 — Reste du site public

- `/comment-ca-marche` (parcours + barème + FAQ), `/resultats` (compteur + études de cas
  anonymisées), `/a-propos`, `/partenaires`, `/presse`, pages légales, 404/erreur/états vides.
- **Gabarit guides SEO** : quasi zéro JS, JSON-LD Article/FAQ. Pages encadrement par ville v1 :
  **CTA vers `/diagnostic`** — pas de simulateur intégré (reporté avec le module encadrement,
  décision actée). Variantes /design-lab : gabarit guide.
- **Socle SEO transverse** : title/meta par page (`TODO_COPY`), `sitemap.xml`, `robots.txt`,
  canonical, JSON-LD FAQPage sur la FAQ home.
- **Mesure & consentement** : analytics **sans cookie, exempté CNIL** (type Plausible/Matomo
  mode exempté) → pas de bannière au lancement. Tout tracker non exempté ultérieur → CMP.
  Politique cookies dans `/legal` (squelette [AVOCAT]).
- **Critères de fin P3** : toutes pages publiques = structure + design finaux, `TODO_COPY`
  tolérés mais **listés** en fin de phase ; guides = gabarit + **2 guides réels** de
  démonstration ; Lighthouse mobile ≥ 90 sur le gabarit guide.

## Phase 4 — Vidéos de lancement (`packages/video`, Remotion)

- **Bootstrap explicite** (le package n'existe pas encore) : init Remotion, versions
  `@remotion/*` strictement alignées entre elles, script `video:render` au package.json racine,
  polices via `@remotion/google-fonts`, tokens importés depuis `packages/shared` (pur TS).
- Compositions (sous-titres intégrés ; gimmick final « Trop payé ? Tape l'adresse ! ») :
  1. **VerdictReveal** (8-12 s, 9:16 + 1:1) — LE format à industrialiser (1 dossier gagné = 1 vidéo).
  2. **HookLoop** (5-7 s) — hooks de `brand.ts` en typographie cinétique, boucle parfaite.
  3. **StatPunch** (6 s) — une stat sourcée en compteur.
  4. **Explainer** (30-45 s) — comment ça marche en 3 étapes (site, presse, pre-roll).
  5. **TeaserLancement** (15 s) — montée de tension + date/gimmick.
  6. **Témoignage** (15-20 s) — citations habillées d'un dossier gagné (post-pilote).
  7. **DemoScreen** (20-30 s) — screencast stylisé du diagnostic réel.
- Déclinaisons : TikTok/Reels/Shorts (9:16), X/LinkedIn (1:1, 16:9). Calendrier type : J-21
  Teaser + StatPunch · J-7 Explainer + HookLoops · J0 série VerdictReveal · J+n Témoignages.
- **Rendus de test sur fixtures DEMO** (plausibles, marquées, jamais publiées) ; la règle
  « données réelles anonymisées » s'applique à la **diffusion** uniquement.
- **Critère P4** : les 7 compositions rendues en MP4 depuis les fixtures (`pnpm video:render`).

## Hors scope

Espace client, back-office, app mobile, refonte des emails transactionnels, génération vidéo
automatisée depuis le back-office, simulateur encadrement intégré aux pages ville.

## Risques & garde-fous

- **Copy** : interdiction de reformuler ; tout manque → `TODO_COPY` (et [AVOCAT] si sensible) ;
  la capture email+téléphone exige une **mise à jour du copy deck par Lyes avant implémentation**.
- **Challenger ≠ tout casser** : les 3 directions partagent principes UX et interdits.
- **PII** : OG/partage anonymisés (jamais l'adresse) ; table `leads` deny-all + rate-limiting ;
  pas de log PII.
- **Compteur public** : chiffres réels ou rien.
- **Perf acquisition** : guides quasi zéro JS ; reveal hero en CSS pur ; rendu statique/cache
  activé avant mesure.
