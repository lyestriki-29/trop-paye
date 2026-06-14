# Itération design post-smoke — tunnel Format A + verdict + couleur (à coder en session neuve)

> Validé le 2026-06-14 avec Lyes (compagnon visuel). **Rien de ceci n'est encore codé.**
> La logique Phase A du tunnel EST livrée (commits `b47956e`..`d9d2e9d`, 238 tests verts,
> revue maison passée). Le smoke a montré des défauts de chrome/layout → cette itération.
> Branche : `feat/da-neubrutalist-public`. Référence de base : `2026-06-14-refonte-tunnel-diagnostic-nb-design.md`.

## Maquettes de référence (dans `.superpowers/brainstorm/55357-1781437754/content/`, gitignoré)
- `format-A-noscroll.html` — layout tunnel cible.
- `phase-b-verdict.html` — refonte verdict.
- `lp-animated.html` — **palette couleur + animations cibles** (prototype animé).
- (aussi `verdict-climax-v3.html` dans l'ancien dossier `44934-*` : héros verdict + fourchette + économie).

## 1. Tunnel — Format A « no-scroll » (remplace le layout actuel)
Le smoke a révélé : **rail cassé** (ChapterRail applique `.nb-step-badge` — un cercle 3,5rem
pour un numéro — au mot « LOGEMENT » → débordement géant), **chrome pas nb** (header/fond
restés charte), **colonne `max-w-xl` = trop d'espace blanc**.

Cible (validée) :
- **Split pleine page, sans scroll** : gauche = **la question active SEULE** ; droite =
  **`DossierPanel`** = toutes les réponses (compactes, **cliquables → édition**), mini-carte,
  CTA « Voir mon résultat » en bas. La page tient dans la fenêtre (`h-screen`, overflow interne
  seulement sur la liste du dossier).
- **Rail réparé** : segments nb nets (fait ✦ / en cours = boîte accent / à venir numéroté),
  pleine largeur, **PAS de `.nb-step-badge`**.
- Header nb (logo encadré + « Étape X sur 5 » badge violet), fond travaillé nb.
- Réutiliser le moteur existant (`question-graph`, `reveal-state`, `progress`, render fns,
  `GuidedTunnel` à restructurer en split, nouveau `DossierPanel`). `buildPayload` inchangé.

## 2. Question « pièces » — saisie exacte (changement métier UI)
Retirer « Je ne sais pas » ; permettre le **nombre exact, au-delà de 4** (précision voulue).
- Render : stepper / saisie numérique (1,2,3,4,5,6,7…), plus de pilule NSP.
- **Schéma zod** : lever un éventuel cap `roomCount <= 4` (vérifier `diagnosticSchema`).
- **Moteur** : le barème encadrement regroupe « 4 et + » → mapper `roomCount >= 4` à la
  catégorie 4+ (vérifier que `roomCount = 6` ne casse rien). Stocker la valeur exacte.
- Retirer/neutraliser `roomCountUnknown` pour cette question.

## 3. Verdict (Phase B) — toutes les sections en nb
`/diagnostic/[verdictId]` enveloppé `.nb`. **Penser à TOUTES les sections** (demande Lyes) :
- **Héros split** (tient en haut d'écran) : gauche = quittance ligne par ligne + count-up
  (bloc vert : total + **économie −X €/mois**) + **fourchette base→max** (si `range.isRange`)
  + badge de confiance ; droite = **panneau « Votre dossier »** (même composant que le tunnel,
  continuité) + **bande mandat « Signer mon mandat »** + partage/téléchargement.
- **Modules dessous** (scroll OK) tous restylés nb : capture email, boosters, mini-tunnel
  dépôt, **détail par fondement** (RuleCards : règle+version, base légale, calcul, confiance),
  **pistes d'orientation NON chiffrées** (séparées — 3 régimes distincts).
- **4 états** : Irrégulier (héros) · Conforme + signaux (orientation, zéro chiffre) ·
  Conforme (rassurant) · Données insuffisantes (retour tunnel).
- Garde-fous : principe n°3 (confiance accolée), copy-deck verbatim, `[AVOCAT]`, `TODO_VERIFIER`.

## 4. Couleur — palette plus saturée + bandes de section pleine couleur
Niveau « + de couleur » validé (vs pastel actuel). **Bandes de couleur pleine par section**,
accents plus francs, néubrutalisme conservé (bords ink, ombres dures). Valeurs cibles
(de `lp-animated.html`, à réconcilier avec le scope `.nb` de `globals.css`) :
`--ink:#241d15` · `--paper:#FFFDF7` · jaune `#FFCE2E` · menthe `#7FE3B4` · vert `#0FA968` ·
lavande `#B7A4F2` · corail `#FF8AA0` · ciel `#86D2F5` · orange `#FF9A3D`.
Affectation LP : hero lavande · résultats menthe · étapes ciel · régimes corail · moteur
**noir (contraste)** · confiance jaune · closing orange. Cette palette devient la **référence
DA pour TOUT** (LP + tunnel + verdict). ⚠️ ne pas casser les composants charte partagés.

## 5. Animations (motion/react, `prefers-reduced-motion` partout)
Reproduire le prototype `lp-animated.html` :
- Reveal au scroll (fondu + montée, **stagger** sur les cartes) via IntersectionObserver /
  motion `whileInView`.
- **Count-up** des chiffres de résultats à l'entrée en vue.
- Hover néubrutaliste (carte/bouton qui s'enfonce/soulève, ombre qui bouge).
- Ticker marquee continu, disque hero en rotation, sticker en wiggle.
- Tout désactivé sous reduced-motion.

## 6. HERO — À RETRAVAILLER (objectif unique : pousser au diagnostic)
Le disque coloré actuel est un **placeholder décoratif**. À brainstormer en session neuve :
quel contenu/visuel/animation de hero **maximise le lancement d'un diagnostic** (la conversion) ?
Pistes à explorer : démo interactive « tape ton adresse → aperçu », chiffre choc animé,
champ adresse directement dans le hero (amorce du tunnel), preuve sociale animée, etc.

## Ordre d'implémentation (session neuve, « tout d'un coup »)
1. Palette couleur (globals.css `.nb` + bandes) — la base.
2. Tunnel Format A (rail réparé, split no-scroll, `DossierPanel`, pièces exactes).
3. Verdict nb (héros split + modules + 4 états).
4. Polish LP (bandes couleur + animations) + **hero retravaillé** (après brainstorm).
5. Revue maison + smoke.
Effort : **Max**, exécution par sous-agents (a déjà prouvé sa valeur : la revue a attrapé
2 vrais bugs avant le runtime). Réutiliser le moteur tunnel existant — surtout la couche présentation.
