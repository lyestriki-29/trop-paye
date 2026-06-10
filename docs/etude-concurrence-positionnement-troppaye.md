# TropPayé — Étude concurrentielle & positionnement
### Données pour Claude Code : concurrents, benchmark Conny, messages et angles catchy — v1.0, juin 2026

---

## 1. Cartographie des concurrents (recherche juin 2026)

### Tableau de synthèse

| Acteur | Type | Ce qu'il fait | Ce qu'il NE fait PAS | Menace |
|---|---|---|---|---|
| **Plateforme Ville de Paris** (paris.fr) | Public, gratuit | Simulateur encadrement + signalement de dépassement (compte Mon Paris requis depuis 01/2025, baux < 3 ans) | Pas de détection DPE/IRL/dépôt, pas de récupération du trop-perçu pour le locataire (la Ville sanctionne, elle ne rembourse pas), Paris uniquement | Faible — c'est un AMONT à intégrer dans notre parcours, pas un concurrent |
| **Simulateurs DRIHL / service-public.fr** | Public, gratuit | Référence des loyers par zone | Verdict brut, aucun accompagnement | Faible |
| **Simulateurs privés** (PAP, simulons.fr, BailPDF...) | Contenu/SEO | Calcul du plafond d'encadrement | Pas de DPE, pas d'action, monétisent l'audience autrement | Faible — concurrents SEO seulement |
| **Litige.fr / DemanderJustice** | Legaltech généraliste | Mise en demeure + saisine juge, ~40 € payés D'AVANCE | Aucune détection (il faut savoir qu'on est lésé), pas de spécialisation loyer, pas de succès fee, pas d'encaissement pour le client | Moyenne — pourrait pivoter, mais ADN généraliste |
| **Associations (CLCV, CNL), ADIL** | Associatif/public | Conseil, défense, conciliation | Capacité limitée, pas d'outil de détection à l'échelle, démarche physique | Nulle — ce sont des PRESCRIPTEURS à recruter |
| **Rocket Lawyer & co** | Modèles de documents | Lettres types | Côté bailleur surtout (impayés), pas de détection ni d'exécution | Nulle |
| **Équivalent français de Conny** | — | **N'EXISTE PAS** (recherches multiples juin 2026) | — | C'est LA fenêtre |

### Constat structurant

Tout l'écosystème français s'arrête au même endroit : le **verdict**. Personne ne fait les trois étapes ensemble : détecter automatiquement → agir à la place du locataire → ne se payer qu'au succès. La presse grand public elle-même documente le besoin sans solution : <stat>1,4 million de logements seraient loués à des prix illégaux</stat> (Journal du Net, 2024), et les médias militants publient des **tutoriels manuels** pour faire baisser son loyer soi-même (Frustration Magazine, mai 2026 : modèle de lettre à recopier, mise en garde sur le rapport de force) — preuve d'une demande réelle servie aujourd'hui par du bricolage.

---

## 2. Benchmark clé : Conny (ex-wenigermiete.de), Allemagne

Le modèle exact de TropPayé existe en Allemagne depuis 2016 et a survécu à tout. À étudier ligne par ligne.

**Le modèle.** Le locataire vérifie en ligne si son bailleur respecte le Mietpreisbremse (l'encadrement allemand) via un calculateur ; s'il y a dépassement, il mandate Conny en un clic ; Conny calcule le loyer maximal légal, exige du bailleur le remboursement du trop-payé ET le respect du plafond pour l'avenir ; le client ne paie une commission qu'en cas de succès (« Einfach. Online. Ohne Kostenrisiko » — simple, en ligne, sans risque financier). Démarré à Berlin, Düsseldorf, Hambourg, Cologne et Munich, étendu ensuite à toutes les villes disposant d'un référentiel de loyers exploitable.

**La validation juridique.** Le modèle a été attaqué sans relâche par les bailleurs et a gagné : la Cour fédérale allemande (BGH) a validé dès novembre 2019 (« Lexfox I ») puis reconfirmé en 2022 que la combinaison « récupération du trop-payé + exigence de conformité future » relève bien de la licence de recouvrement (Inkasso) — l'équivalent fonctionnel de notre montage R124 + jurisprudence Demanderjustice. La CJUE a même renforcé la protection des consommateurs utilisant ce type de service (2024). Stiftung Warentest (l'UFC allemande) le recommande avec des CGU jugées correctes ; leur fiche est mise à jour en janvier 2026 : le service tourne toujours, a inspiré des concurrents, la majorité des dossiers se règlent à l'amiable (le contentieux long est l'exception).

**Les leçons à transposer.**
1. Lancer là où la donnée de référence est fiable (eux : les Mietspiegel ; nous : la base DPE ADEME + IRL INSEE — encore plus binaire que leur référentiel).
2. La double demande « remboursement passé + baisse future » est le cœur de la proposition de valeur ET du jugement favorable — notre mandat doit porter les deux.
3. Le client peut stopper à tout moment sans frais (sauf si la baisse arrive ensuite grâce au travail déjà fait) — clause de mandat à répliquer, très rassurante.
4. S'attendre à une guérilla judiciaire des bailleurs institutionnels — prévoir le budget juridique et en faire un atout RP (chaque attaque = un article de presse).
5. Vision affichée : « Justice-as-a-Service » — utile pour le storytelling levée de fonds/presse.

---

## 3. Données chiffrées à exploiter dans le site (avec source à citer)

| Chiffre | Usage | Source |
|---|---|---|
| 1,1 million de passoires F/G dans le parc locatif privé, loyer gelé depuis 08/2022 | Page d'accueil, guides DPE | Ministère Transition écologique (via Hellio) |
| 1,4 million de logements loués à des prix illégaux | Accroche presse/landing | Journal du Net 2024 |
| Plus d'1/3 des nouveaux baux au-dessus du plafond ; >40 % dans certains secteurs | Guides encadrement | Rapport officiel relayé Figaro/Meilleurtaux 2026 |
| 8 annonces sur 10 non conformes pour les < 15 m² à Paris | Cible étudiants/petites surfaces | Ville de Paris (Ian Brossat) |
| Amendes bailleur : 5 000 € (particulier) / 15 000 € (SCI) | Pages "vos droits", levier dans les courriers | Loi ELAN |
| Pénalité dépôt de garantie : +10 % du loyer par mois de retard | Module dépôt | Loi 1989 art. 22 |
| Prescription 3 ans pour récupérer le trop-versé | Compte à rebours sur le verdict | Art. 7-1 loi 1989 |

⚠️ Chaque statistique affichée sur le site doit pointer sa source (lien) — la crédibilité est l'actif n°1 d'un service juridique.

---

## 4. Positionnement : ce qu'on met en avant (les angles « catchy »)

### Le message maître (hero de la home)

> **« Marre de trop payer ? Vérifiez votre loyer en 2 minutes. Si on ne récupère rien, vous ne payez rien. »**
> Sous-titre : 1 logement loué sur 6 en France a un loyer illégal. Le vôtre ?
> Baseline sous le logo : « Récupérez ce que votre loyer vous doit. »

Pourquoi ça marche : promesse + absence totale de risque + curiosité personnelle (« le vôtre ? »). C'est la mécanique exacte des leaders de l'indemnisation aérienne et de Conny, éprouvée à grande échelle.

### Les 6 angles différenciants, par ordre de force

1. **« Zéro risque »** — aucun frais d'avance, commission uniquement au succès. PERSONNE ne le propose en France sur le logement. À répéter partout (header, footer, FAQ, emails).
2. **« On s'occupe de tout »** — vs le tutoriel DIY et le simulateur qui vous laisse seul avec votre verdict. Le locataire moyen ne veut PAS affronter son propriétaire ; nous sommes le tiers qui encaisse le conflit à sa place. Ton : « vous ne parlez plus jamais loyer avec votre proprio, nous oui ».
3. **Le verdict chiffré personnel** — pas « votre loyer est trop élevé » mais « **vous avez 1 437 € à récupérer** (+ 72 €/mois d'économie) ». Le montant exact, en gros, partageable (image OG générée avec le chiffre — moteur viral : « j'ai fait le test, j'ai X € à récupérer »).
4. **L'urgence légale légitime** — « chaque mois qui passe, la prescription de 3 ans efface vos droits : ~X € perdus par mois d'attente ». Vrai juridiquement, puissant commercialement, à formuler sobrement (urgence factuelle, jamais anxiogène artificielle).
5. **L'angle passoire thermique** — politiquement et médiatiquement porteur : « votre logement est mal isolé ET votre loyer a augmenté ? C'est doublement illégal. » Personne n'occupe ce créneau alors que c'est le gisement le plus massif et le plus binaire. C'est NOTRE territoire de marque : « le défenseur des locataires de passoires ».
6. **La transparence radicale** — barème affiché partout (25 %, exemples chiffrés), compteur public des sommes récupérées, méthodologie ouverte, sources citées. Antidote au soupçon « chasseur de primes » et différenciation vs l'opacité des legaltechs génériques.

### Mécaniques produit à forte traction (specs pour Claude Code)

- **Image OG dynamique** sur la page verdict : fond de marque + « J'ai vérifié mon loyer : 1 437 € à récupérer » + CTA. Route Next.js `/api/og/[verdictId]` (lib @vercel/og).
- **Compteur public** sur la home : « X € récupérés pour les locataires » (somme des FundMovement OUT_TENANT) + « X dossiers en cours ». Même à petit volume, la transparence du chiffre réel > un gros chiffre inventé.
- **Effet immeuble** : après un verdict DPE positif, écran « Votre immeuble entier est probablement classé F/G — invitez vos voisins » avec lien de parrainage par adresse. Les dossiers groupés d'un même bailleur augmentent le levier ET le taux de succès.
- **Compte à rebours de prescription** sur le verdict : « date limite pour agir sur la période la plus ancienne : JJ/MM/AAAA ».
- **Score de confiance affiché** (élevé/moyen) : l'honnêteté sur l'incertitude crédibilise les verdicts « élevés ».
- **Page « Combien je touche ? »** avec slider interactif : loyer payé vs loyer légal → trop-perçu, part TropPayé, part locataire. La transparence comme outil de conversion.

### Ton de marque

Sérieux mais pas corporate ; du côté du locataire sans être anti-proprio (« nous faisons appliquer la loi, rien de plus ») ; pédagogue (chaque verdict explique le droit en français simple) ; factuel sur l'urgence. Interdits : promesses de gain garanties, ton vengeur, jargon juridique non expliqué, toute formulation assimilable à un conseil juridique personnalisé.

### Marque retenue : TropPayé

**Nom** : TropPayé — la promesse est dans le nom, mémorable en une
exposition, déclinable au-delà du loyer (charges trop payées, dépôt non
rendu, frais d'agence). Domaines : troppaye.fr + trop-paye.fr en
redirection ; handles @troppaye sur TikTok/Instagram/X. ⚠️ Avant tout
usage public : disponibilité AFNIC + recherche de similarité INPI +
dépôt de marque.

**Baseline principale** : « Récupérez ce que votre loyer vous doit. »
Variantes contextuelles : « Vérifiez. Récupérez. Ne payez que si ça
marche. » (parcours/landing) · « Le loyer légal, rien de plus. »
(presse, courriers, B2B).

**Distinction marque / raison sociale** : TropPayé est la marque grand
public. Les courriers de recouvrement adressés aux bailleurs sont
signés de la raison sociale de la SAS (nom sobre et neutre, à choisir
à la création), avec mention « exploitant la plateforme troppaye.fr ».
Un courrier signé « TropPayé » durcirait inutilement les négociations.

### Banque de hooks (acquisition sociale)

Hooks directs (pub, affiches, pre-roll) :
« Marre de trop payer ? TropPayé. » ·
« Trop payé ? Récupérez. » ·
« Vérifié, réclamé, remboursé. TropPayé. » ·
« Vous avez trop payé. Lui, il le sait. » (visuel immeuble) ·
« 2 minutes pour vérifier. 3 ans pour récupérer. 0 € si on échoue. »

Hooks formats courts (TikTok/Reels/Shorts) :
« POV : tu découvres que t'as trop payé ton loyer depuis 2 ans » ·
« Ton proprio espère que tu ne feras jamais ce test » ·
« J'ai tapé mon adresse, j'ai trouvé 1 400 € » (format témoignage —
le plus viral, à industrialiser avec les vrais dossiers gagnés) ·
« Logement mal isolé + loyer augmenté = doublement illégal ».

**Gimmick de fin de vidéo** (réflexe répétitif, original — ne jamais
réutiliser de formules de personnages protégés type Dora) :
« Trop payé ? Tape l'adresse ! » — répété à l'identique en clôture de
chaque contenu jusqu'à devenir un automatisme culturel.

**Règle des deux registres** : les hooks offensifs servent UNIQUEMENT
l'acquisition sociale ; le site, la presse, les courriers et le tunnel
de mandat restent sur le registre sobre (« nous faisons appliquer la
loi, rien de plus »). Le fun fait venir, le sérieux fait signer.

---

## 5. Mots-clés SEO prioritaires (intention forte, à transformer en guides)

- « augmentation loyer dpe f » / « dpe g augmentation loyer interdite » / « loyer passoire thermique » → guides DPE (cœur)
- « loyer trop cher que faire » / « récupérer trop perçu loyer » → pages action
- « encadrement des loyers [ville] » + « plafond loyer [ville] » → pages ville
- « dépôt de garantie non rendu » / « caution non restituée délai » → module dépôt (volume énorme)
- « calcul augmentation loyer irl » / « augmentation loyer illégale » → module IRL
- « frais d'agence location plafond » → module honoraires
- Longue traîne réseaux : « mon proprio a augmenté mon loyer alors que dpe g », à capter via contenus courts TikTok/Shorts renvoyant au simulateur.

---

## 6. Risques concurrentiels et réponse

- **Litige.fr ajoute un module loyer** : probable à terme ; notre défense = la détection (base réglementaire + DPE) et la marque spécialisée. Vitesse d'exécution décisive : être LE nom associé au sujet avant eux.
- **Les villes améliorent leurs outils** : tant mieux — leurs simulateurs valident le problème mais ne récupèrent pas l'argent ; intégrer leurs verdicts comme pièce du dossier.
- **Un clone copie le site** : la barrière est la base réglementaire territorialisée, les templates validés avocat, le statut R124 opérationnel et la preuve sociale accumulée (compteur, avis) — 6 à 9 mois d'avance incompressibles pour un suiveur.
- **Conny arrive en France** : ils annoncent une ambition européenne depuis des années sans l'exécuter (droit très national) ; si ça arrive, être la cible d'acquisition locale évidente n'est pas le pire scénario.
