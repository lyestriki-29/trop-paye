# Brief juriste — Page « Notre histoire » + injections (copy-deck §7)

> **But de ce document** : faire valider/rédiger les 41 textes manquants de la page
> « Notre histoire » et de quelques encarts du site. Tant qu'ils ne sont pas remplis,
> **le build de production est bloqué** (garde-fou automatique `scripts/check-copy.mjs`)
> et le site ne peut pas être déployé.
>
> **Ce qui est attendu de vous (juriste)** : valider les formulations à risque (colonne
> « Sensibilité = HAUTE »), confirmer les titres/qualités professionnels, et vérifier
> qu'aucun texte ne contient de promesse de résultat ni de claim non autorisé. Les
> textes purement éditoriaux (récit, ton de marque) peuvent être rédigés par Lyes ;
> votre rôle y est un simple contrôle de conformité.

---

## 0. Qu'est-ce que TropPayé ? (présentation pour découvrir le produit)

### Le problème
En France, beaucoup de locataires paient un loyer **supérieur à ce que la loi autorise**
(complément de loyer abusif, dépassement de l'encadrement, hausses interdites sur les
passoires thermiques…). La plupart **ne le savent pas** et **ne réclament jamais** le
trop-perçu, faute de temps, de compétence juridique, ou par crainte du conflit avec le
bailleur.

### Ce que fait TropPayé (en une phrase)
TropPayé **détecte automatiquement** si un loyer est irrégulier, puis **récupère le
trop-perçu à l'amiable** auprès du bailleur **pour le compte du locataire**, en se
rémunérant **uniquement au succès** (commission de 25 % sur les sommes effectivement
récupérées ; rien n'est facturé si rien n'est récupéré).

### Le parcours d'un locataire, étape par étape
1. **Diagnostic gratuit en ligne** : le locataire saisit son adresse, son loyer, la classe
   énergétique (DPE), quelques infos du bail. Un moteur de règles calcule s'il y a une
   irrégularité et **estime** le montant **récupérable** (jamais promis).
2. **Verdict** : le locataire voit une fourchette estimée, le détail du calcul, et un
   niveau de confiance (élevé / moyen / faible). Tout verdict cite sa **base légale**.
3. **Dossier + pièces** : s'il veut aller plus loin, il crée un dossier et dépose ses
   pièces (bail + dernière quittance), de façon **chiffrée**.
4. **Mandat** : il signe un **mandat** (signature électronique simple) confiant à TropPayé
   le **recouvrement amiable** de son trop-perçu, au barème de **25 % au succès**.
5. **Recouvrement amiable** : TropPayé contacte le bailleur et conduit une **séquence de
   relances** échelonnée (mise en demeure puis relances à J+21 / J+35 / J+50) pour obtenir
   le remboursement, **sans procédure judiciaire** (le contentieux n'est pas l'objet du
   service ; les cas qui relèveraient du juge sont **orientés**, jamais chiffrés
   automatiquement).
6. **Versement** : si le bailleur rembourse, le locataire reçoit le trop-perçu **net de la
   commission de 25 %** sur son RIB.

### Les 3 situations juridiques traitées (distinctes, ne pas confondre)
- **Gel des loyers des passoires thermiques (F/G)** : interdiction d'augmenter le loyer
  des logements classés F ou G ⇒ trop-perçu chiffrable sur les hausses post-24/08/2022.
- **Bouclier loyer (+3,5 % max)** : plafonnement des révisions sur une période donnée
  (T3-2022 → T1-2024), même hors passoires.
- **Décence / interdiction de louer (G en 2025, F en 2028)** : relève d'une **orientation**
  (vers le juge / les autorités), **jamais d'une répétition de l'indu chiffrée
  automatiquement** par l'outil.

### Positionnement & cadre juridique
- C'est une activité de **recouvrement amiable de créances pour le compte d'autrui**
  (art. **R124-1 et s. CPCE**) — **ce n'est ni un cabinet d'avocats, ni du conseil
  juridique personnalisé.**
- **Rémunération au succès uniquement** (25 %).
- **Données 100 % en France** (hébergement Supabase région Paris), **chiffrement** des
  pièces sensibles, conformité **RGPD** (suppression en cascade, pas de log de données
  personnelles).
- **Aucune promesse de résultat** : on parle d'estimation et de montant « récupérable »,
  jamais d'un gain garanti.

### L'équipe (telle qu'affichée publiquement)
- **Lyes** : fondateur (le « cas zéro » de la page « Notre histoire », c'est son propre
  dossier de trop-perçu).
- **Nicolas** : cofondateur, présenté publiquement comme « **Expert de la location** »
  (jamais « juriste »).

### Modèle économique
Commission de **25 % au succès** sur le trop-perçu effectivement récupéré. Le diagnostic
est gratuit ; aucun frais si aucune somme n'est récupérée.

---

## 1. Cadre du produit (rappel synthétique des contraintes de communication)

TropPayé est une plateforme qui détecte les **loyers irréguliers** (France) et engage le
**recouvrement amiable du trop-perçu** pour le compte de locataires, contre **commission
au succès (25 %)**.

Cadre juridique à respecter dans TOUTE formulation publique :
- Activité de **recouvrement amiable de créances pour le compte d'autrui** (art. **R124-1
  et s. CPCE**), à déclarer auprès du procureur de la République.
- **Jamais de promesse de résultat.** Vocabulaire imposé : « récupérable », « estimation »,
  « visé » — **jamais** « vous allez toucher / vous récupérerez X € ».
- **Pas de conseil juridique personnalisé** affiché (l'équipe informe sur la procédure,
  ne conseille pas).
- **Nicolas (cofondateur)** : rôle public **figé** = « **Expert de la location** ».
  Interdiction d'écrire « juriste », « expert juridique », « avocat » pour lui.
- Mention « **validé par un avocat** » : **interdite tant qu'elle n'est pas vraie**
  (un flag technique `legalReviewDone` la masque par défaut). Ne l'activer qu'après
  une vraie revue avocat.
- Ton : voix active, phrases courtes, « vous » de respect, calme et précis (pas
  d'humour ici), zéro jargon non expliqué.

## 2. Le « cas zéro » (chiffres réels, déjà actés — éditables mais cohérents avec le moteur)

La page s'ouvre sur le dossier fondateur (le cas réel de Lyes), illustré par une
quittance stylisée **non nominative** :
- Loyer hors charges : **900,00 €**
- Complément de loyer (contesté) : **120,00 €/mois**
- Total appelé : **1 020,00 €**
- Classe DPE du logement : **F**
- Tampon visuel : « TROP PAYÉ »

Ces montants sont figés côté code ; seuls les **textes** autour sont à rédiger.

## 3. Garde-fous techniques (ne pas s'en écarter)

| Règle | Conséquence si non respectée |
|---|---|
| Nicolas = « Expert de la location » uniquement | Incohérence + risque allégation trompeuse |
| `jsonLd.nicolasJobTitle` ≠ « juriste » | Donnée structurée publique fausse |
| `legalReviewLine` non publiée sans revue avocat réelle | Claim mensonger |
| Aucune promesse de résultat | Pratique commerciale trompeuse (art. L121-1 C. conso) |
| Phrase imposée (preuve sociale) : « Premier dossier en cours : le nôtre. » | À garder mot pour mot |

---

## 4. Les 41 textes à fournir (regroupés par section de la page)

Légende **Sensibilité** : 🔴 HAUTE (validation juriste requise) · 🟠 MOYENNE (claim à
surveiller) · ⚪ Éditoriale (rédaction libre, simple contrôle).

### SEO (balises invisibles, référencement Google)
| Clé | Ce que c'est | Contrainte | Sensib. |
|---|---|---|---|
| `seo.title` | Titre onglet/Google | ~60 caractères max | ⚪ |
| `seo.description` | Description Google | ~155 caractères max | 🟠 (pas de promesse) |

### §1 — Hero « cas zéro »
| Clé | Ce que c'est | Contrainte | Sensib. |
|---|---|---|---|
| `hero.kicker` | Petite accroche au-dessus du titre | 2-4 mots | ⚪ |
| `hero.title` | Grand titre de la page | 1 phrase forte | 🟠 |
| `hero.intro` | Paragraphe d'intro sous le titre | 2-3 phrases | 🟠 |
| `casZero.meta` | Ligne mono sous l'en-tête de la quittance (non nominative) | courte, factuelle | ⚪ |

### §2 — Récit du duo (deux voix en alternance : Lyes puis Nicolas)
| Clé | Ce que c'est | Contrainte | Sensib. |
|---|---|---|---|
| `duo.title` | Titre de la section | court | ⚪ |
| `duo.founder.role` | Rôle affiché sous « Lyes » | titre pro de Lyes | 🔴 (titre exact) |
| `duo.founder.photoAlt` | Texte alternatif photo Lyes (accessibilité) | descriptif | ⚪ |
| `duo.founder.p1` | 1er paragraphe (voix de Lyes) | récit | 🟠 |
| `duo.founder.p2` | 2e paragraphe (voix de Lyes) | récit | 🟠 |
| `duo.nicolas.photoAlt` | Texte alternatif photo Nicolas | descriptif | ⚪ |
| `duo.nicolas.p1` | 1er paragraphe (voix de Nicolas) | récit | 🟠 |
| `duo.nicolas.p2` | 2e paragraphe (voix de Nicolas) | récit | 🟠 |

> Rappel : le rôle affiché de Nicolas est **figé** à « Expert de la location » (déjà en
> dur, pas à rédiger).

### §3 — La bascule (le déclic fondateur)
| Clé | Ce que c'est | Contrainte | Sensib. |
|---|---|---|---|
| `bascule.title` | Titre de section | court | ⚪ |
| `bascule.p1` | 1er paragraphe | récit | 🟠 |
| `bascule.p2` | 2e paragraphe | récit | 🟠 |

### §4 — La méthode (présentée comme un « document officiel » : 4 paires libellé → valeur)
| Clé | Ce que c'est | Contrainte | Sensib. |
|---|---|---|---|
| `methode.title` | Titre de section | court | ⚪ |
| `methode.intro` | Phrase d'intro | 1-2 phrases | 🟠 |
| `methode.m1.label` / `methode.m1.value` | Mention 1 (ex. « Base légale » → …) | paire courte | 🔴 (exactitude juridique) |
| `methode.m2.label` / `methode.m2.value` | Mention 2 | paire courte | 🔴 |
| `methode.m3.label` / `methode.m3.value` | Mention 3 | paire courte | 🔴 |
| `methode.m4.label` / `methode.m4.value` | Mention 4 | paire courte | 🔴 |

> Ces 4 mentions ressemblent à un cartouche de document officiel. Si elles citent des
> bases légales (gel des loyers F/G, encadrement, art. CPCE…), elles doivent être
> **exactes**. À cadrer avec vous.

### §5 — Preuve sociale
| Clé | Ce que c'est | Contrainte | Sensib. |
|---|---|---|---|
| `preuve.title` | Titre de section | court | ⚪ |
| *(état vide)* | **Imposé** : « Premier dossier en cours : le nôtre. » | mot pour mot | ⚪ (déjà figé) |

### §6 — Appel à l'action
| Clé | Ce que c'est | Contrainte | Sensib. |
|---|---|---|---|
| `cta.title` | Titre au-dessus du bouton (le bouton réutilise le CTA d'accueil) | court | 🟠 |

### Phrase « avocat » (n'apparaît que si une vraie revue avocat a eu lieu)
| Clé | Ce que c'est | Contrainte | Sensib. |
|---|---|---|---|
| `legalReviewLine` | Mention type « Parcours validé par un avocat » | **interdite si non vraie** | 🔴 |

### Données structurées JSON-LD (lues par Google, invisibles à l'écran)
| Clé | Ce que c'est | Contrainte | Sensib. |
|---|---|---|---|
| `jsonLd.founderJobTitle` | Intitulé de poste de Lyes (donnée structurée) | exact, ne pas inventer | 🔴 |
| `jsonLd.nicolasName` | Nom complet de Nicolas | nom réel | 🟠 |
| `jsonLd.nicolasJobTitle` | Intitulé de poste de Nicolas | **jamais « juriste »** | 🔴 |

### Injections (textes réutilisés ailleurs sur le site)
| Clé | Ce que c'est | Où | Sensib. |
|---|---|---|---|
| `storyTeaser.l1` | Ligne 1 du teaser récit | page d'accueil | ⚪ |
| `storyTeaser.l2` | Ligne 2 du teaser récit | page d'accueil | ⚪ |
| `storyTeaser.l3` | Ligne 3 du teaser récit | page d'accueil | ⚪ |
| `storyTeaser.linkLabel` | Libellé du lien « lire l'histoire » | page d'accueil | ⚪ |
| `reviewer.phrase` | Phrase de réassurance | tunnel mandat, étape signature | 🔴 (pas de promesse) |
| `reviewer.photoAlt` | Texte alternatif photo | tunnel mandat | ⚪ |
| `verdictStoryLine` | 1 ligne affichée **seulement sur un verdict positif** | page verdict | 🔴 (pas de promesse) |
| `footerSignature` | Signature courte du pied de page | tout le site | ⚪ |

---

## 5. Questions précises à trancher avec le juriste

1. **`duo.founder.role` + `jsonLd.founderJobTitle`** : quel intitulé exact pour Lyes
   (fondateur ? dirigeant ? autre) ? Doit-il refléter une fonction réglementée ?
2. **`jsonLd.nicolasJobTitle`** : quel intitulé public pour Nicolas, compatible avec
   « Expert de la location » et **sans** suggérer un titre juridique protégé ?
3. **§4 mentions `m1..m4`** : peut-on citer les bases légales (gel des loyers passoires
   F/G, encadrement des loyers, recouvrement amiable R124 CPCE) en clair, et sous quelle
   formulation exacte pour rester défendable ?
4. **`reviewer.phrase` / `verdictStoryLine` / `seo.description` / `cta.title`** : valider
   qu'aucune ne constitue une promesse de résultat (rester sur « récupérable » /
   « estimation »).
5. **`legalReviewLine`** : voulez-vous qu'une mention « validé par un avocat » existe ?
   Si oui, sous quelle forme, et à partir de quand peut-on l'activer (le code la masque
   tant qu'un drapeau `legalReviewDone` n'est pas levé) ?
6. **Récits `p1/p2`** (Lyes et Nicolas) : un simple contrôle qu'aucune affirmation
   factuelle/chiffrée non vérifiable n'y figure.

---

## 6. Procédure une fois les textes validés (côté technique, pour info)

1. Reporter les textes validés dans `docs/copy-deck-troppaye.md` §7 (source de vérité).
2. Aligner **mot pour mot** `apps/web/lib/content/notre-histoire.ts` (remplacer chaque
   `TODO_COPY — …` par le texte validé).
3. Relancer le garde-fou : `pnpm --filter @troppaye/web exec node scripts/check-copy.mjs`
   doit passer (0 placeholder) → le build de prod se débloque.

*(La phrase de preuve sociale « Premier dossier en cours : le nôtre. » est déjà figée et
ne doit pas être modifiée.)*
