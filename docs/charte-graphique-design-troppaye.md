# TropPayé — Charte graphique, motion design & contenu organique
### Document de référence design pour Claude Code — **v2.0, arbitrage du 2026-06-10**
### (v1 « document officiel » conservée dans l'historique git ; directions du duel archivées dans /design-lab/directions/archive)

---

## 1. Direction artistique

### Le concept v2 : « l'allié chaleureux qui montre la preuve comptable »

Issu du duel P0 (3 directions complètes, arbitrées par Lyes) : la **chaleur
humaine** de l'allié (base D3) porte l'enveloppe — accueil, langage, boutons,
générosité des espacements — tandis que le **langage documentaire** (D1) reste
la grammaire exclusive des PREUVES : carte-quittance à filets, références de
dossier en mono, lignes de calcul, tampon. L'émotion fait entrer, le document
fait signer. Le rendu visé reste premium : exécution irréprochable, détails
finis, et DES signatures mémorables (voir ci-dessous).

### Les trois signatures de marque

1. **Le surligneur jaune** (`accent`) — le coup de Stabilo de l'étudiant qui
   révise et du juriste qui pointe la ligne fautive. Usage : mots-clés du hero,
   ligne fautive d'une quittance, balayage du montant au verdict. Signature
   d'interaction PRODUIT, utilisable partout avec parcimonie.
2. **La carte-quittance** — toute preuve chiffrée vit dans une carte style
   document : en-tête mono petites capitales (« RÉF. DOSSIER TP-… »), filets
   1 px `line`, lignes libellé/montant, total en `refund`. Jamais un chiffre
   important hors de ce langage.
3. **Le tampon « TROP PAYÉ »** — double filet rouge `stamp`, incliné −6°,
   bords d'encrage imparfaits. Règle d'usage STRICTE : uniquement le verdict
   gagné, les réseaux sociaux et les images OG. Jamais dans le tunnel de
   mandat, le dashboard, les courriers, ni la home.

### Ce qu'on refuse (anti-références, inchangé)
Le look "IA générique" (fond crème + serif + terracotta ; fond noir + vert
acide ; gabarit journal à filets), les illustrations 3D corporate, les photos
de stock, les dégradés violets SaaS, le ton "startup disruptive".

---

## 2. Design tokens (v2 — palette chaude)

### Couleurs (variables CSS en canaux RGB, consommées par Tailwind)

| Token | Hex | Canaux | Usage |
|---|---|---|---|
| `ink` | #2A2118 | 42 33 24 | Texte principal, fonds inversés — brun-noir chaud |
| `paper` | #FFFEFB | 255 254 251 | Fond principal — blanc à peine chaud (PAS crème) |
| `paper-2` | #FAF4EC | 250 244 236 | Fonds de cartes, zones de formulaire |
| `refund` | #0C8F63 | 12 143 99 | LE vert de l'argent récupéré (gros montants, fonds sombres) |
| `refund-text` | #0A7351 | 10 115 81 | Variante AA du vert pour le texte courant sur fond clair |
| `stamp` | #D64545 | 214 69 69 | Rouge tampon chaud — tampon, alertes prescription, erreurs |
| `line` | #EAE1D6 | 234 225 214 | Filets, bordures 1 px |
| `accent` | #FFD84D | 255 216 77 | Le surligneur jaune — fonds de marquage, texte `ink` par-dessus |

Ratios : paper domine, ink pour le texte, refund à chaque montant en faveur du
locataire, accent en marquage ponctuel (jamais en aplat de section), stamp avec
parcimonie extrême. Contrastes AA partout ; sur `accent`, texte `ink`
obligatoire (jamais de blanc ni de vert sur jaune) ; `refund` pur réservé aux
grands corps/fonds sombres, `refund-text` pour le texte courant.

### Typographie

| Rôle | Police | Usage |
|---|---|---|
| Display | **Outfit** (600/700/800) | Titres, hero, CTA — géométrique chaleureuse |
| Body | **Figtree** (400/500/600) | Texte courant — ronde, lisible, amicale |
| Data | **Spline Sans Mono** (400/500) | TOUS les montants, dates, réfs de dossier, calculs — le mono dit « preuve comptable » |

Échelle : 12 / 14 / 16 / 20 / 28 / 40 / 64 (hero) — interlignage 1.6 body,
tracking -0.02em sur le display. Règle signature inchangée : tout montant en
euros est en Spline Sans Mono, chiffres tabulaires (`.tabular`), `refund` quand
il est en faveur du locataire.

### Grille, formes, ombres
Conteneur max 1120 px, grille 12 colonnes, base 4 px. Radius : 8 px (cartes),
4 px (champs), 999 px (badges ET boutons principaux — la pilule est un marqueur
v2). Ombres : douces et autorisées sur les cartes-preuves (grammaire chaleureuse,
ex. `shadow-xl` sur la quittance du hero) ; les filets 1 px restent le langage
des documents. Les cartes importantes gardent le style « quittance » :
en-tête avec référence en mono, filets, total mis en évidence.

### Iconographie & illustration
Icônes : Lucide, 1.5 px, couleur ink. Illustrations : pas de 3D ni de
personnages ; des « documents stylisés » (bail, quittance, courrier AR) en
aplats ink/line sur paper, et des détails du monde réel (coin d'AR, liasse de
quittances, coup de surligneur).

---

## 3. Logo (arbitré)

- **Logotype principal** : « TropPayé » en **Outfit 800**, ink, avec le
  **surligneur `accent` sous « Payé »** (le marqueur jaune = l'argent repéré).
  Référence : `LogoA` de /design-lab/directions/v2/identite.
- **Marque secondaire** : le **tampon** « TROP PAYÉ » (double filet `stamp`,
  texture d'encrage feTurbulence, −6°) — réservé verdict gagné + réseaux + OG.
- **Favicon** : pastille « TP » fond `accent`, texte ink (le tampon est réservé).
- **Gabarit OG** : logotype + montant surligné `accent` + tampon claqué au coin
  bas droit (cf. aperçu v2/identite).
- Variantes : monochrome ink, blanc sur ink.

---

## 4. Motion design (motion v12) — amendé v2

Principes : la sobriété en continu, la matière partout, l'orchestration sur
DEUX moments — **l'entrée du hero** (une fois) et **le verdict** (le sommet).
`prefers-reduced-motion` respecté systématiquement (fondu simple, montants
affichés sans count-up).

### L'entrée du site (amendement v2, acté quel que soit l'écran)
Reveal du hero au premier chargement : stagger 0,6–0,9 s, **CSS keyframes pur**
(jamais gaté sur l'hydratation React — le LCP ne doit pas attendre), une seule
fois. Pas d'écran splash.

### Le moment signature : la séquence du verdict (~1,8 s, grammaire v2)
1. La carte-quittance se pose (fade + slide 12 px)
2. L'en-tête document puis les lignes de calcul s'impriment (stagger 80 ms, mono)
3. Le **surligneur `accent` balaie** le montant total (width 0→100 %, 400 ms)
4. Count-up du total (0 → montant, 1 s, ease-out, 64 px, `refund`)
5. Le CTA pilule apparaît, le montant DANS le bouton (« Récupérer mes 1 437 € »)
6. Le **tampon** claque UNIQUEMENT sur l'écran de verdict gagné (scale 1.4→1,
   −6°, spring raide) — optionnel selon l'écran, jamais ailleurs

### Micro-interactions (150-250 ms) — DENSITÉ OBLIGATOIRE (v2)
Tout élément interactif a un état hover/focus/active travaillé. Champs : focus
ring ink 2 px, label flottant. Étapes du questionnaire : slide + barre de
progression animée. Compteur public : count-up au scroll-into-view (une fois).
Upload : la pièce se « classe » dans le dossier. Cartes : élévation du filet
(line → ink) ou ombre douce. Reveals au scroll : fade + 16 px, once, sur CHAQUE
section (sobre mais systématique).

---

## 5. Densité & effet waouh (nouveau, exigence produit)

Les écrans témoins du duel étaient volontairement légers ; le produit final ne
l'est PAS. Standard v2 : **dense, habité, fini**.

- **Chaque section porte au moins un artefact riche** : carte-quittance
  spécimen, chiffre animé, détail du monde réel, coup de surligneur — jamais
  un simple titre + paragraphe + bouton flottant dans le vide.
- **La preuve est la décoration** : plutôt qu'illustrer, montrer la matière
  réelle (quittances, calculs, compteur, extraits de loi sourcés).
- **Le waouh vient de la précision** : alignements parfaits, tabular-nums,
  transitions finies, états vides/chargement/erreur dessinés — pas de
  parallaxe gratuite ni d'effets continus.
- **Hiérarchie éditoriale affirmée** : gros display contrasté, kickers mono,
  numérotation, rythme vertical varié (sections pleines/aérées alternées).
- Le grand spectacle reste le VERDICT — c'est lui qui doit décrocher le
  « waouh » final et le partage.

---

## 6. Usine à contenu organique : package Remotion

(Inchangé v1, tokens v2.) `packages/video` — compositions VerdictReveal,
HookLoop, Témoignage, StatPunch + Explainer/Teaser/DemoScreen (spec refonte
P4). Les compositions consomment les MÊMES tokens que le site (palette v2,
Outfit/Figtree via @remotion/google-fonts). Sous-titres intégrés par défaut.
Banque de hooks : `brand.ts` + `docs/hooks-cible-etudiants-paris.md`.

---

## 7. Dashboard client & questionnaire (spécifications UX)

(Inchangé v1 sur le fond — modèle mental « suivi de colis » pour /espace, une
question par écran pour le diagnostic, autosave, magic link — à exécuter avec
la grammaire v2 : cartes-quittance pour les montants, surligneur pour l'étape
courante, pilules pour les CTA.)

---

## 8. Process de travail : les variantes /design-lab

(Inchangé.) Pour toute section UI nouvelle ou retravaillée : 2 à 3 variantes
comparables dans /design-lab, arbitrage Lyes, promotion de la retenue,
archivage des autres dans /design-lab/archive (mémoire des essais — D1, D2,
D3 du duel y sont conservées). Sections d'office restantes pour la refonte :
« comment ça marche », barème/slider, page guide type.
