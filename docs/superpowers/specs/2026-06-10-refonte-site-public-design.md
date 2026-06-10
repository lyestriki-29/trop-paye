# Spec — Refonte UI/UX du site public, identité & vidéos de lancement

**Date** : 2026-06-10 · **Statut** : design validé (brainstorm avec Lyes) · **Track** : B (après chantier A questionnaire)
**Sources** : `docs/charte-graphique-design-troppaye.md`, `docs/copy-deck-troppaye.md`,
`docs/structure-site-prerequis-troppaye.md`, `docs/etude-concurrence-positionnement-troppaye.md`,
recherche web 2026-06-10 (Conny, patterns fintech/legaltech 2026).

## Décisions cadres (arbitrées par Lyes)

- **Périmètre** : tout le site public. Espace client + back-office **hors scope** (track suivant).
- **DA** : la charte « document officiel » est **challengée** — duel de 3 directions avant exécution.
- **Hero** : « tape l'adresse » — l'étape adresse du diagnostic démarre DANS le hero.
- **Capture avant verdict** : email + téléphone (détail en Phase 2).
- **Ajouts** : logo (décliné par direction), animation d'entrée sobre, plan vidéos de lancement.

## Phase 0 — Duel de directions artistiques (`/design-lab`)

- **3 directions complètes**, chacune appliquée aux **2 écrans témoins** : home (hero tape-l'adresse)
  et page verdict (le moment signature).
  - **D1 « Document officiel »** : la charte actuelle — papier/encre, tampon rouge, Bricolage
    Grotesque + Public Sans + Spline Sans Mono.
  - **D2 « Relevé de compte »** : data-fintech froide et précise, la preuve par les chiffres,
    gros montants mono, zéro métaphore papier (esprit Wise/Linear).
  - **D3 « De votre côté »** : allié humain et chaleureux, gros boutons, chaleur maîtrisée
    (esprit Mes-Allocs/Alan) — l'empathie d'abord, la preuve ensuite.
- **Identité incluse** : chaque direction porte son traitement de marque — logotype (2-3
  propositions SVG par direction), marque secondaire (D1 : tampon ; D2/D3 : équivalent propre),
  favicon, gabarit d'image OG.
- **Isolation** : tokens en variables CSS scopées sous `/design-lab/directions/*` — zéro impact
  sur le site live pendant l'exploration.
- **Interdits communs** (anti-références charte) : crème+serif « IA », noir+vert acide, 3D
  corporate, photos de stock, dégradés violets SaaS. Principes UX partagés par les 3 :
  sobriété, montants en mono `tabular-nums`, contrastes AA, mobile-first.
- **Livrable & sortie** : comparateur dans `/design-lab` ; arbitrage Lyes → la gagnante devient
  la **charte v2** (doc `charte-graphique` mis à jour si ≠ D1), les perdantes archivées dans
  `/design-lab/archive`.

## Phase 1 — Système de design

- Tokens Tailwind définitifs (direction gagnante), polices via `next/font` (subset, swap).
- Composants de base : Button, Field, Card « quittance », Badge d'étape, Frise de progression,
  Header/Footer du site public.
- **Animation d'entrée du site** : reveal orchestré du hero au premier chargement (stagger
  0,6–0,9 s, focus auto du champ adresse en desktop), `prefers-reduced-motion` → fondu simple.
  **Pas d'écran splash bloquant** (anti-pattern conversion ; charte : « la sobriété partout,
  le spectacle c'est le verdict »).

## Phase 2 — Chemin de conversion

- **Home** (sections dans l'ordre, contenus = copy deck) : hero tape-l'adresse → Comment ça
  marche (3 étapes) → Confiance (« Nous faisons appliquer la loi, rien de plus », badges de
  réassurance **près du CTA**, pas en footer) → Passoires thermiques (territoire de marque) →
  FAQ → CTA final. Compteur public branché sur les chiffres réels (jamais de chiffre inventé).
- **Tunnel diagnostic** : restylé une-question-par-écran, progression + bénéfice visible
  (« plus que 2 questions avant votre estimation ») ; intègre les améliorations du chantier A.
- **Capture avant verdict** (nouvelle étape) : verdict partiel/flouté → formulaire **email
  (obligatoire) + téléphone (présent ; optionnel recommandé** — chaque champ obligatoire coûte
  de la conversion ; décision finale à l'usage). Finalité affichée (« pour vous tenir informé
  de votre dossier »), consentement RGPD explicite, pas de log PII, microcopy du copy deck.
- **Page verdict** : séquence signature ~1,8 s (adaptée à la direction gagnante), count-up du
  montant, CTA « Récupérer mes {X} € », compte à rebours de prescription (3 ans), score de
  confiance affiché, **image OG dynamique** `/api/og/[verdictId]`, bouton de partage.
  Verdict conforme : page rassurante + veille gratuite (copy deck).
- **Tunnel mandat** : barème en clair avec **slider interactif** (si on récupère X → vous
  recevez 0,75X), upload de pièces rassurant (statut par pièce), signature, confirmation avec
  frise initialisée (« c'est parti »).
- **Règle de copy** : tout texte vient du copy deck **mot pour mot** ; manque → `TODO_COPY`
  signalé, jamais improvisé (a fortiori les passages [AVOCAT]).

## Phase 3 — Reste du site public

`/comment-ca-marche` (parcours + barème + FAQ), `/resultats` (compteur + études de cas
anonymisées), **gabarit guides SEO** (silo `/guides/*`, quasi zéro JS, données structurées
Article/FAQ), `/a-propos`, `/partenaires`, `/presse`, pages légales, 404/erreur/états vides.

## Phase 4 — Vidéos de lancement (`packages/video`, Remotion)

Compositions (props = données réelles anonymisées ; tokens partagés avec le site ; sous-titres
intégrés ; gimmick final « Trop payé ? Tape l'adresse ! ») :

1. **VerdictReveal** (8-12 s, 9:16 + 1:1) — adresse floutée → scan calculs → signature de marque
   → count-up → gimmick. LE format à industrialiser (1 dossier gagné = 1 vidéo).
2. **HookLoop** (5-7 s) — hooks de `brand.ts` en typographie cinétique, boucle parfaite (pubs).
3. **StatPunch** (6 s) — une stat sourcée en compteur (« 1,4 million de loyers illégaux »").
4. **Explainer** (30-45 s) — comment ça marche en 3 étapes (site, presse, pre-roll).
5. **TeaserLancement** (15 s) — montée de tension + date/gimmick (J-21 → J0).
6. **Témoignage** (15-20 s) — citations habillées d'un dossier gagné (post-pilote).
7. **DemoScreen** (20-30 s) — screencast stylisé du diagnostic réel (réassurance produit).

Déclinaisons par canal : TikTok/Reels/Shorts (9:16), X/LinkedIn (1:1, 16:9).
Calendrier type : J-21 Teaser + StatPunch · J-7 Explainer + HookLoops · J0 série VerdictReveal
· J+n Témoignages du pilote. Rendu local (`pnpm video:render`), pas de Lambda au début.

## Hors scope

Espace client, back-office, app mobile, refonte des emails transactionnels (textes déjà au
copy deck), génération vidéo automatisée depuis le back-office (plus tard).

## Critères de fin de phase

- **P0** : arbitrage rendu par Lyes (direction + logo).
- **P1** : tokens + composants, typecheck/build verts.
- **P2** : funnel complet cliquable mobile + desktop ; Lighthouse perf ≥ 90 (home, guides) ;
  axe AA sans violation ; OG image fonctionnelle.
- **P3** : toutes les pages publiques en place.
- **P4** : 7 compositions rendues en MP4 de test.

## Risques & garde-fous

- **Dérive de copy** : interdiction de reformuler ; copy deck = source unique.
- **Challenger ≠ tout casser** : les 3 directions partagent les principes UX et les interdits.
- **Téléphone** : friction + RGPD — optionnel recommandé, finalité explicite, consentement.
- **Compteur public** : chiffres réels ou rien.
- **Perf guides SEO** : pas de motion lourde ni de JS inutile sur les pages d'acquisition.
