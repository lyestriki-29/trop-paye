# TropPayé — Charte graphique, motion design & contenu organique
### Document de référence design pour Claude Code — v1.0, juin 2026

---

## 1. Direction artistique

### Le concept : « le document officiel qui se retourne contre l'abus »

L'univers visuel de TropPayé est ancré dans le monde réel du sujet :
la quittance, le bail, le relevé, le courrier recommandé, le tampon
administratif. On en détourne les codes : ce vocabulaire visuel de
l'administration — habituellement subi par le locataire — devient SON
arme. Le rendu visé est premium-fintech : sobre, précis, beaucoup de
blanc, une exécution irréprochable, et UNE signature mémorable.

### La signature de marque : le tampon « TROP PAYÉ »

Un tampon encreur rouge, légèrement incliné (-6°), bords imparfaits
d'encrage, qui « claque » sur le verdict. C'est à la fois :
- le logo secondaire (le logotype principal reste typographique),
- le moment-clé du parcours (l'animation du verdict),
- l'élément récurrent des images OG et des vidéos organiques,
- un actif déclinable physiquement (stickers, vrai tampon pour la presse).

Règle d'usage : le tampon apparaît UNIQUEMENT au moment du verdict
irrégulier et dans les contenus sociaux. Jamais dans le tunnel de
mandat, le dashboard ou les courriers (registre sobre).

### Ce qu'on refuse (anti-références)
Le look "IA générique" (fond crème + serif + terracotta ; fond noir +
vert acide ; gabarit journal à filets), les illustrations 3D
corporate, les photos de stock de gens souriants, les dégradés violets
SaaS, le ton "startup disruptive".

---

## 2. Design tokens

### Couleurs (packages/shared/brand.ts → exporter aussi en CSS variables)

| Token | Hex | Usage |
|---|---|---|
| `ink` | #11192B | Texte principal, fonds inversés — encre bleu nuit |
| `paper` | #FBFBF8 | Fond principal — blanc papier (PAS crème) |
| `paper-2` | #F1F1EC | Fonds de cartes, zones de formulaire |
| `refund` | #0B9E6B | LE vert de l'argent récupéré : montants, succès, courbe du compteur |
| `stamp` | #C8322B | Rouge tampon — réservé au tampon, aux alertes de prescription et aux erreurs |
| `line` | #D9D9D1 | Filets, bordures 1px |

Ratios : paper domine (~80 %), ink pour le texte, refund apparaît
chaque fois qu'un montant en faveur du locataire s'affiche (cohérence :
vert = votre argent), stamp avec parcimonie extrême.
Contrastes AA minimum partout (vérifier refund sur paper pour le texte :
utiliser une variante foncée `refund-text` #087A52 pour le texte courant).

### Typographie

| Rôle | Police | Usage |
|---|---|---|
| Display | **Bricolage Grotesque** (Google Fonts, 600-800) | Titres, hero, montants géants — caractère affirmé sans agressivité |
| Body | **Public Sans** (400/500/600) | Texte courant — lisible, légèrement institutionnel (c'est la police de l'administration US : clin d'œil parfait) |
| Data | **Spline Sans Mono** (400/500) | TOUS les montants, dates, références de dossier, calculs, audit trail — le mono dit "preuve comptable" |

Échelle : 12 / 14 / 16 / 20 / 28 / 40 / 64 (hero) — interlignage généreux
(1.6 body), tracking légèrement serré sur le display (-0.02em).
Règle signature : tout montant en euros est en Spline Sans Mono,
chiffres tabulaires, couleur `refund` quand il est en faveur du locataire.

### Grille, formes, ombres
Conteneur max 1120px, grille 12 colonnes, espacement base 4px.
Radius : 8px (cartes), 4px (champs), 999px (badges d'étape).
Ombres quasi nulles : préférer les filets 1px `line` (langage "document").
Les cartes importantes (verdict, dossier) ont un style "quittance" :
fond paper, filet, en-tête avec référence de dossier en mono — comme un
document officiel.

### Iconographie & illustration
Icônes : Lucide, 1.5px de trait, couleur ink. Illustrations : pas de
3D ni de personnages ; à la place, des "documents stylisés" (bail,
quittance, courrier AR) traités en aplats ink/line sur paper, et des
détails du monde réel (le coin d'un AR, la liasse de quittances).

---

## 3. Logo (brief pour la création)

- **Logotype principal** : "TropPayé" en Bricolage Grotesque 800,
  ink, avec l'accent du "é" traité en `refund` (le petit signal vert =
  l'argent qui revient). Déclinaison une ligne / empilé.
- **Logo secondaire / favicon** : le tampon — "TP" ou "TROP PAYÉ" dans
  un cadre arrondi double filet rouge, incliné, texture d'encrage.
- **Variantes** : monochrome ink, blanc sur ink, tampon seul.
- À générer : SVG du logotype, du tampon (avec masque de texture pour
  l'effet encrage), favicon, et OG template intégrant les deux.
- Claude Code produira 3 propositions de logotype + 2 de tampon dans
  /design-lab pour arbitrage avant adoption.

---

## 4. Motion design (Framer Motion)

Principe : la sobriété partout, l'orchestration sur UN moment — le
verdict. `prefers-reduced-motion` respecté systématiquement (variantes
sans mouvement, fondu simple).

### Le moment signature : la séquence du verdict (1,8 s)
1. La carte-quittance du logement se construit (fade + slide 12px)
2. Les lignes de calcul s'impriment une à une (stagger 80ms, style
   ticket de caisse, montants en mono)
3. Le tampon TROP PAYÉ claque : scale 1.4→1 + rotation -6°, spring
   raide (stiffness 600), légère secousse de la carte (1px, 100ms)
4. Le montant total démarre un count-up (0 → 1 437 €, easing out,
   1s, en `refund`, taille 64)
5. Le CTA "Récupérer mes 1 437 €" apparaît (le montant DANS le bouton)

### Micro-interactions (discrètes, 150-250ms)
- Champs de formulaire : focus ring ink 2px, label flottant
- Étapes du questionnaire : transition slide horizontale + barre de
  progression qui s'anime
- Dashboard : la frise de suivi remplit son segment à chaque nouvelle
  étape (ligne qui se dessine + badge qui "pop")
- Compteur public de la home : count-up au scroll-into-view (une fois)
- Upload : la pièce déposée se "classe" dans le dossier (translation
  vers la checklist + coche)
- Hover des cartes guides : élévation du filet (line → ink), pas d'ombre

### Scroll de la home
Révélations sobres au scroll (fade + 16px, once), pas de parallaxe ni
d'effets continus. La home doit donner une impression de précision,
pas de spectacle — le spectacle, c'est le verdict.

---

## 5. Usine à contenu organique : package Remotion

`packages/video` — Remotion (React) pour générer les vidéos sociales
de façon programmatique à partir des données réelles (anonymisées) :
chaque dossier gagné peut devenir un contenu en 1 commande.

### Compositions à créer (formats 9:16 1080×1920 et 1:1)
1. **VerdictReveal** (8-12s) : adresse floutée tapée → scan des lignes
   de calcul → tampon TROP PAYÉ → count-up du montant → gimmick de fin
   "Trop payé ? Tape l'adresse !" + logo. Props : montant, type
   d'irrégularité, ville. C'est LE format à industrialiser.
2. **HookLoop** (5-7s) : un hook texte de la banque (brand.ts) en
   typographie cinétique (mots qui claquent au rythme), fond ink,
   accents refund/stamp, boucle parfaite pour les pubs.
3. **Témoignage** (15-20s) : citations d'un dossier gagné, habillage
   quittance, montants en mono, tampon final.
4. **StatPunch** (6s) : une stat choc ("1,4 million de loyers
   illégaux") en compteur + source + CTA.

### Infrastructure
- `pnpm video:render VerdictReveal --props=dossier.json` → MP4
- Plus tard : route back-office "générer la vidéo de ce dossier"
  (render Lambda ou file locale sur le VPS)
- Les compositions consomment les MÊMES tokens (brand.ts) que le site :
  cohérence totale site/vidéos. Sous-titres intégrés par défaut
  (le son est coupé sur les feeds).

---

## 6. Dashboard client (spécification UX)

Modèle mental : **le suivi de colis**. Le locataire doit comprendre où
en est son dossier en 3 secondes, comme un tracking Colissimo.

### Écran principal `/espace`
- En-tête : référence dossier (mono), adresse, montant en jeu (refund)
- **Frise verticale de progression** (le cœur de l'écran) :
  Dossier validé → Courrier envoyé (+ n° AR, date) → AR signé par le
  bailleur → Relance → Réponse reçue → Accord / Transmission avocat →
  Paiement reçu → **Reversé sur votre compte**.
  Chaque étape : badge, date, libellé en langage humain ("Votre
  propriétaire a reçu le courrier le 12/03"), pièce jointe consultable.
  Étape courante animée (pulse discret), étapes futures en line.
- Carte "Prochaine étape" : ce qui va se passer + qui agit + délai
  estimé ("Sans réponse d'ici le 02/04, nous envoyons la relance —
  vous n'avez rien à faire").
- Carte montants : trop-perçu réclamé / récupéré / votre part / notre
  commission — transparence totale, en mono.
- Pièces : checklist des documents (fournis ✓ / manquants avec CTA
  d'upload), aperçu des courriers envoyés en PDF.
- Messagerie : fil simple, réponses de l'équipe, bandeau "nous ne
  donnons pas de conseil juridique personnalisé" + bouton d'escalade.

### Notifications
Email à CHAQUE changement d'étape (objet : "Votre dossier avance :
le courrier a été remis à votre propriétaire") — la transparence est
le produit autant que le résultat.

---

## 7. Questionnaire & collecte de documents (spécification UX)

Principes : une question par écran, langage humain, autosave continu,
reprise par magic link, montrer la progression ET le bénéfice
("plus que 2 questions avant votre estimation").

### Phase diagnostic (anonyme, 2 min)
1. Adresse (autocomplétion BAN) → en arrière-plan : DPE + zonages
2. "Votre logement" : confirmation visuelle du DPE trouvé ("Est-ce
   bien votre logement ? 42 m², 3e étage" — Oui/Non), sinon n° DPE ou
   "je ne sais pas" (parcours dégradé)
3. "Votre bail" : date de signature, meublé/vide, loyer hors charges
   (aides de saisie : "où trouver ce montant sur votre bail ?")
4. "Les augmentations" : votre loyer a-t-il augmenté ? quand ?
   combien ? (timeline interactive simple : ajouter une augmentation)
5. → VERDICT (email demandé ici pour recevoir le détail)

### Phase mandat (après verdict, 5 min)
Checklist dynamique pilotée par `missingData` du moteur :
- Bail (PDF/photo — obligatoire)
- 2 dernières quittances (obligatoire)
- Quittance d'avant l'augmentation contestée (si module IRL/DPE)
- État des lieux de sortie + preuve de remise des clés (module dépôt)
- DPE (optionnel si trouvé via ADEME)
Upload par drag & drop ET photo mobile (caméra), formats jpg/png/pdf,
compression côté client, chaque pièce rattachée à son exigence avec
statut (reçue / illisible / validée). Puis récapitulatif → barème en
clair avec slider d'exemple → signature électronique → confirmation
avec la frise du dashboard déjà initialisée (étape 1 verte : effet
"c'est parti").

---

## 8. Process de travail avec Claude Code : les variantes

Règle à inscrire dans le CLAUDE.md : **pour toute section UI nouvelle
ou retravaillée, produire 2 à 3 variantes comparables** avant
intégration.

- Route dédiée `/design-lab` (protégée en prod) : liste des sections,
  chaque section affiche ses variantes côte à côte (desktop) ou
  empilées (mobile) avec un libellé du parti pris de chacune
  ("V1 : hero centré sur le simulateur / V2 : hero preuve sociale /
  V3 : hero tampon plein écran").
- Chaque variante respecte STRICTEMENT les tokens — les variantes
  divergent par la composition, la hiérarchie et le contenu, jamais
  par des couleurs/polices hors charte.
- Après arbitrage, la variante retenue est promue dans la page réelle
  et les autres archivées dans /design-lab/archive (mémoire des essais).
- Sections concernées d'office : hero, section "comment ça marche",
  carte verdict, pricing/barème, frise dashboard, page guide type,
  logotype et tampon.
