# Hero LP — refonte DA (validée 2026-06-14)

> Brainstorm compagnon visuel, validé avec Lyes. Branche `feat/da-neubrutalist-public`.
> Complète l'itération `2026-06-14-tunnel-verdict-da-iteration.md` §6 (« HERO à retravailler »).
> Référence visuelle : `.superpowers/brainstorm/58188-1781442417/content/mix2-v2.html` (gitignoré).
> Objectif unique : **maximiser le lancement d'un diagnostic** (conversion).

## Direction retenue : « Mix 2 v2 » — compteur géant + quittance vivante

Mix de deux paris : le **choc émotionnel du chiffre** (variante A) + la **preuve produit**
(variante B). DA néubrutaliste conservée, palette « + de couleur » (bande hero **lavande**
`#B7A4F2`, cf. itération §4). Layout split 2 colonnes, centré verticalement.

### Colonne gauche (accroche + action)
1. **Eyebrow** mono : `Loyer encadré · gel F/G · bouclier 3,5 %`.
2. **Compteur géant** `−194 €` (Archivo Black, vert `refund`, `text-stroke` ink +
   ombre dure 6px) en **count-up animé** au montage. **Le label part à DROITE du nombre**
   (filet ink vertical de séparation), pas en dessous :
   - ligne 1 (display, petit) : `par mois en moyenne`
   - ligne 2 (mono) : `de loyer économisé une fois la hausse illégale supprimée`
   - **Grand écran : aérer** — plus d'espace vertical entre les deux lignes et plus de
     respiration autour du compteur (le bloc ne doit pas paraître tassé en `lg`).
3. **H1** : `Marre de trop payer ?` (`brand.hero.title` verbatim, « trop payer » en
   `nb-mark--refund`).
4. **Sous-titre** : `brand.hero.subtitle` verbatim.
5. **Champ adresse** (`HeroAddress` existant) — amorce du diagnostic, bouton vert « Vérifier ».
6. **Compteur social vivant** : `● 37 diagnostics lancés cette semaine` (point vert pulsé).
   → **TODO_COPY / TODO_VERIFIER** : chiffre à brancher sur une vraie source ou à assumer
   comme fourchette honnête ; ne pas afficher un nombre inventé en prod sans accord.

### Colonne droite (preuve)
**Quittance spécimen** néubrutaliste (`aria-hidden`, chiffres témoin fictifs, légère
rotation `-1deg`) :
- en-tête : `Réf. TP-2026-0117` / `Quittance de loyer` ; adresse `12 rue des Lilas…` ;
- 3 lignes : loyer appelé · plafond légal (gel DPE F/G) · **hausse illégale / mois**
  (ligne surlignée jaune `acid`, montant en vert) ;
- **total** « Trop-perçu récupéré » `1 437,00 €` (mono, vert) ;
- **stickers dégagés** (ne recouvrent aucun texte) : `0 € d'avance` (jaune, haut-gauche),
  `25 % au succès` (corail, haut-droite) ;
- **tampon « Trop payé »** (corail, rotation) **placé à droite, sous le total `1 437`**
  (débord bas de carte), plus sur les lignes chiffrées.
- Montants en **Spline Sans Mono `tabular-nums`**, vert `refund`.

## Contraintes
- **Copy** : titre + sous-titre `brand.hero` verbatim. Micro-copy nouvelle (label compteur,
  « 37 diagnostics ») marquée `TODO_COPY`. Chiffres témoin de la quittance = illustration
  (`TODO_VERIFIER`, déjà en prod).
- **Animations** : count-up `−194 €` + point vert pulsé + (rappel itération §5) hover nb.
  **Tout désactivé sous `prefers-reduced-motion`** (count-up → valeur finale directe).
- **Accessibilité** : carte quittance `aria-hidden="true"` (décorative) ; le compteur
  social reste lisible lecteur d'écran.
- Reste néubrutaliste : bords ink 2-3px, ombres dures, fonts Archivo Black / Spline Sans
  Mono / Outfit. Ne pas casser les composants charte partagés.

## Fichiers visés
- `apps/web/components/home/nb/sections-hero-nb.tsx` (`HeroNb` + `VerdictCardNb`) :
  recomposer en Mix 2 v2 (compteur gauche, quittance nettoyée droite, compteur social).
- `StripNb` / `TickerNb` inchangés (bande chiffres + marquee conservés sous la hero).
- S'intègre à l'ordre d'implémentation de l'itération (étape 4 : polish LP + hero).
