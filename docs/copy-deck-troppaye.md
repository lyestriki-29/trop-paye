# TropPayé — Copy deck (textes du site, emails, microcopy)
### v1.0 — juin 2026 — Source des contenus pour Claude Code
### ⚠️ Les passages marqués [AVOCAT] doivent être validés avant mise en ligne. Aucun texte de ce deck ne doit être reformulé librement par l'IA : modifications par édition de ce fichier uniquement.

---

## 1. Page d'accueil

**Hero**
- Titre : Marre de trop payer ?
- Sous-titre : Vérifiez votre loyer en 2 minutes. Si on ne récupère
  rien, vous ne payez rien.
- CTA principal : Vérifier mon loyer
- Ligne de réassurance (sous le CTA) : Gratuit · Sans engagement ·
  2 minutes
- Stat d'appui : 1 logement loué sur 6 en France a un loyer illégal.
  Le vôtre ? (lien source)

**Section « Comment ça marche » (3 étapes)**
1. Vérifiez — Tapez votre adresse. On croise votre loyer avec les
   données publiques : DPE, indice des loyers, règles de votre ville.
2. Mandatez-nous — Une signature en ligne, vos quittances, et c'est
   tout. Vous ne parlerez jamais loyer avec votre propriétaire — nous,
   si.
3. Récupérez — On réclame, on relance, on encaisse, on vous reverse.
   Notre commission : 25 % de ce qu'on récupère. Rien récupéré ?
   Rien payé.

**Section confiance**
- Titre : Nous faisons appliquer la loi. Rien de plus.
- Texte : Le gel des loyers des passoires thermiques, l'indice de
  référence des loyers, les délais de restitution du dépôt de
  garantie : ce sont vos droits, écrits dans la loi. TropPayé les
  fait simplement respecter. Chaque calcul cite sa source. Chaque
  euro est tracé sur un compte dédié. Vos données restent en France.
- Compteur public : {montant} € récupérés pour les locataires ·
  {n} dossiers en cours

**Section passoires (territoire de marque)**
- Titre : Logement mal isolé ? Votre loyer est gelé depuis 2022.
- Texte : Si votre logement est classé F ou G, la loi interdit toute
  augmentation de loyer depuis le 24 août 2022. Beaucoup de
  propriétaires l'ignorent — ou font comme si. Chaque augmentation
  appliquée depuis est remboursable. [lien : Vérifier mon DPE]

**FAQ home (extraits)**
- Combien ça coûte ? → Rien d'avance, jamais. Si nous récupérons de
  l'argent, notre commission est de 25 % des sommes récupérées. Si
  nous ne récupérons rien, vous ne payez rien. Le barème détaillé est
  ici [lien].
- Mon propriétaire peut-il me le reprocher ? → Demander l'application
  de la loi est votre droit. Votre bail ne peut pas être résilié pour
  ce motif, et c'est nous qui menons les échanges. [AVOCAT]
- Est-ce que vous êtes des avocats ? → Non, et nous ne donnons pas de
  conseil juridique. Nous fournissons une information générale, des
  calculs à partir de données publiques, et nous recouvrons les sommes
  avec votre mandat, dans le cadre légal du recouvrement amiable. Si
  votre dossier exige un avocat, nous vous mettons en relation avec
  un partenaire. [AVOCAT]
- Combien de temps ça prend ? → La plupart des dossiers se règlent à
  l'amiable en 1 à 3 mois. S'il faut aller plus loin, nous vous
  proposons un avocat partenaire — toujours sans frais d'avance.

## 2. Parcours diagnostic (microcopy)

- Étape adresse — titre : Où habitez-vous ? · placeholder : 12 rue de
  la République, Lyon · aide : Nous utilisons votre adresse uniquement
  pour retrouver les données publiques de votre logement.
- Confirmation DPE — titre : Est-ce bien votre logement ? · carte :
  Classe {X} · {surface} m² · DPE établi le {date} · boutons : C'est
  bien lui / Ce n'est pas lui
- DPE introuvable — titre : Nous n'avons pas trouvé votre DPE ·
  texte : Son numéro à 13 caractères figure sur votre bail ou sur
  l'annonce de location. · option : Je ne le connais pas — continuer
  sans (note : nous ne pourrons pas vérifier le gel des loyers, mais
  les autres vérifications restent possibles)
- Étape loyer — titre : Quel est votre loyer hors charges ? · aide :
  C'est le « loyer nu » ou « loyer hors charges » sur votre bail ou
  vos quittances — pas le total que vous virez chaque mois.
- Étape augmentations — titre : Votre loyer a-t-il augmenté depuis
  votre arrivée ? · bouton : + Ajouter une augmentation
- Avant verdict (capture email) — titre : Votre estimation est prête ·
  texte : Nous avons détecté {une irrégularité probable / un dossier
  conforme}. Recevez le détail complet et conservez votre dossier :
  · placeholder : votre@email.fr · CTA : Voir mon résultat ·
  dessous : Pas de spam. Désinscription en un clic.

**Page verdict irrégulier**
- Titre : Vous avez trop payé.
- Montant : {X} € récupérables · + {Y} €/mois d'économie à venir
- Explication type (module DPE) : Votre logement est classé {F/G}.
  Depuis le 24 août 2022, la loi interdit toute augmentation de son
  loyer. Or votre loyer a augmenté de {a} € le {date}. Chaque mois
  depuis, vous avez payé {a} € de trop. Sur la période légalement
  récupérable, cela représente {X} €. (Base : loi Climat et
  résilience, art. 159 — voir le texte)
- Confiance élevée : Notre estimation s'appuie sur des données
  officielles (DPE n° {num}, indice INSEE). / Confiance moyenne :
  Il nous manque {pièce} pour fiabiliser ce calcul — vous pourrez la
  fournir à l'étape suivante.
- Urgence (sobre) : La loi limite la récupération aux 3 dernières
  années : passé le {date}, les mois les plus anciens ne seront plus
  récupérables.
- CTA : Récupérer mes {X} €
- Mention : Estimation informative établie à partir de données
  publiques et de vos déclarations. Ceci n'est pas un conseil
  juridique. [AVOCAT]

**Page verdict conforme**
- Titre : Bonne nouvelle : rien à signaler.
- Texte : D'après vos réponses et les données publiques, votre loyer
  respecte les règles que nous vérifions. · Veille : Activez l'alerte
  gratuite : si votre loyer augmente un jour, nous vérifierons
  automatiquement. · Rebond : Vous quittez bientôt votre logement ?
  Vérifiez aussi votre dépôt de garantie.

## 2bis. Mini-tunnel dépôt (brouillon LOT 3)

### ⚠️ BROUILLON — à valider par Lyes / [AVOCAT] avant mise en ligne

- Titre module : Dépôt de garantie
- Introduction module : Mini-vérification facultative — brouillon, à valider.
- Question date : Date de remise des clés
- Question état des lieux : L'état des lieux de sortie est-il conforme ?
  · Choix : Oui / Non
- Question montant : Montant du dépôt de garantie versé
- Question restitution : Le dépôt a-t-il été remboursé ?
  · Choix : Non / Partiellement / Totalement
- Champs restitution : Montant remboursé · Date du remboursement
- Champ retenue : Montant retenu avec justificatif (facultatif)
- Aperçu : À ajouter à votre dossier : +{montant}
- État incomplet : Complétez les 4 questions pour recalculer votre dossier.
- CTA : Mettre à jour mon dossier
- CTA état chargement : Mise à jour…
- Erreurs : TODO_COPY — saisie invalide · TODO_COPY — session expirée ·
  TODO_COPY — dossier introuvable ou session expirée · TODO_COPY — trop de
  tentatives, réessayez plus tard · TODO_COPY — enregistrement impossible,
  réessayez · TODO_COPY — complétez les champs du dépôt

**TODO_COPY**
- Valider le titre et l'introduction du module.
- Valider les libellés date / état des lieux / montant / restitution.
- Valider la formulation « montant retenu avec justificatif » [AVOCAT].
- Valider les messages d'erreur et l'état incomplet.
- Valider le libellé CTA et son état de chargement.

## 3. Tunnel mandat (microcopy)

- Barème — titre : Notre rémunération, en toute transparence · slider :
  Si nous récupérons {X} € → vous recevez {0,75X} €, notre commission
  est de {0,25X} €. · rappel : Rien récupéré ? Rien payé. Vous pouvez
  arrêter à tout moment. [AVOCAT pour la formulation exacte des
  conditions d'arrêt]
- Pièces — titre : Vos documents · sous-titre : Une photo lisible
  suffit. · items : Votre bail (obligatoire) / Vos 2 dernières
  quittances (obligatoire) / {pièces conditionnelles}
- Signature — titre : Dernière étape : votre mandat · texte : Ce
  mandat nous autorise à réclamer et encaisser les sommes pour votre
  compte, sur un compte dédié et contrôlé. Vous restez maître de votre
  dossier à tout moment. [AVOCAT]
- Confirmation — titre : C'est parti. · texte : Votre dossier
  {référence} est en cours de vérification par notre équipe (sous
  48 h ouvrées). Vous serez informé(e) de chaque étape par email —
  vous n'avez plus rien à faire.

## 4. Emails transactionnels (objets + corps courts)

1. Vérification email — Objet : Votre résultat TropPayé vous attend ·
   CTA : Voir mon résultat
2. Dossier validé — Objet : Votre dossier {ref} est validé — courrier
   en préparation · Corps : Notre équipe a vérifié votre dossier. Le
   courrier de réclamation part le {date} en recommandé. Montant
   réclamé : {X} €.
3. Courrier remis — Objet : Votre propriétaire a reçu le courrier ·
   Corps : L'accusé de réception a été signé le {date}. Il a
   maintenant 21 jours pour répondre. Sans réponse, nous relançons
   automatiquement le {date+21}.
4. Réponse reçue — Objet : Du nouveau sur votre dossier {ref}
5. Accord obtenu — Objet : 🎉 Accord obtenu : {X} € pour vous ·
   Corps : Votre propriétaire s'est engagé à rembourser {X} € et à
   ramener votre loyer à {Y} €. Prochaine étape : l'encaissement.
6. Reversement — Objet : {0,75X} € sont en route vers votre compte ·
   Corps : Nous avons encaissé {X} €. Votre part ({0,75X} €) est virée
   sur votre compte sous 7 jours. Détail et facture en pièce jointe.
   Merci de votre confiance — un mot sur votre expérience nous aide
   énormément : {lien avis}.
7. Demande de pièce — Objet : Il nous manque un document pour avancer
8. Escalade proposée — Objet : Votre dossier mérite un avocat — sans
   frais d'avance · [AVOCAT]

## 5. Pages légales et bandeaux (squelettes [AVOCAT])

- Bandeau messagerie : Notre équipe vous informe sur la procédure mais
  ne peut pas vous donner de conseil juridique personnalisé.
- Pied de page : TropPayé est une marque de {RAISON SOCIALE}, société
  par actions simplifiée — activité de recouvrement amiable de
  créances pour le compte d'autrui déclarée auprès du procureur de la
  République de {ville} (art. R124-1 et s. CPCE) — assurance RC
  professionnelle {assureur} — médiateur de la consommation :
  {organisme}.
- /comment-ca-marche, /resultats, CGU, confidentialité : structures
  dans le doc structure-site ; contenus à dériver de ce deck + [AVOCAT].

## 6. Ton et règles d'écriture (pour toute nouvelle microcopy)

Voix active, phrases courtes, « vous » de respect, zéro jargon non
expliqué (chaque terme légal a sa définition en une ligne au survol).
Les boutons disent ce qui se passe (« Récupérer mes 1 437 € », pas
« Continuer »). Les erreurs expliquent et orientent, sans s'excuser ni
culpabiliser. Jamais de promesse de résultat (« récupérable »,
« estimation », jamais « vous allez toucher »). Le fun reste sur les
réseaux ; ici, on est précis, calme, et de votre côté.

## 7. Page « Notre histoire » + injections du récit fondateur

### ✅ REMPLI — copy validée par Lyes le 2026-06-13. Source de vérité ; le module
### apps/web/lib/content/notre-histoire.ts est aligné mot pour mot. Garde-fous :
### Nicolas = « expert de la location » UNIQUEMENT ; aucune mention « validé par
### avocat » affichée hors flag legalReviewDone. Les items 🔴 (titres, bases
### légales, phrases sans promesse) restent à confirmer en revue juriste — voir
### docs/copy-deck-notre-histoire-BRIEF-JURISTE.md.

**SEO**
- seo.title : TropPayé : votre loyer est peut-être trop élevé
- seo.description : Découvrez si votre loyer dépasse ce que la loi autorise. Diagnostic gratuit, trop-perçu récupérable à l'amiable. Rémunération au succès uniquement.

**§1 Hero « cas zéro »** (chiffres réels : loyer 900,00 € HC, complément de loyer
120,00 €/mois, logement classé F)
- hero.kicker : Notre histoire
- hero.title : Tout a commencé par notre propre quittance.
- hero.intro : TropPayé n'est pas né d'une étude de marché. Il est né d'un loyer que l'un de nous payait, et qui dépassait ce que la loi autorise. Nous avons construit l'outil que nous aurions voulu avoir.
- casZero.meta : Quittance reconstituée : logement classé F, complément de loyer contesté.

**§2 Récit du duo** (deux voix en alternance)
- duo.title : Deux regards sur le même problème
- duo.founder.role (affiché sous « Lyes ») : Fondateur
- duo.founder.photoAlt : Portrait de Lyes, fondateur de TropPayé
- duo.founder.p1 : Je payais 1 020 € par mois pour un logement classé F. Sur le papier, tout semblait normal. En regardant de près, j'ai compris qu'un complément de loyer de 120 € s'ajoutait chaque mois sans base solide, et que la loi interdisait d'augmenter le loyer d'une passoire thermique.
- duo.founder.p2 : J'ai voulu comprendre, puis récupérer ce qui pouvait l'être. Le calcul existait, la base légale aussi. Ce qui manquait, c'était un moyen simple de le faire valoir sans y passer des semaines. TropPayé est cette réponse.
- duo.nicolas.photoAlt : Portrait de Nicolas, cofondateur de TropPayé
- duo.nicolas.p1 : Cela fait des années que je connais le marché locatif de l'intérieur. Les loyers irréguliers, je les vois souvent, et je vois aussi combien il est rare qu'un locataire ose ou sache les contester.
- duo.nicolas.p2 : Quand Lyes m'a montré son dossier, l'idée était évidente : si lui pouvait récupérer son trop-perçu, des milliers d'autres le pouvaient aussi. Mon rôle, c'est de rendre ce chemin clair et accessible.
  (le rôle affiché de Nicolas est figé : « Expert de la location »)

**§3 La bascule**
- bascule.title : Le déclic
- bascule.p1 : Récupérer son propre trop-perçu, c'est satisfaisant. Comprendre que des centaines de milliers de locataires sont dans la même situation, sans le savoir, c'est ce qui change tout.
- bascule.p2 : Nous avons décidé d'industrialiser ce que Lyes avait fait à la main : détecter l'irrégularité, estimer le montant récupérable, et engager le recouvrement amiable pour le compte du locataire.

**§4 La méthode** (mentions type document officiel : 4 paires libellé → valeur)
- methode.title : Notre méthode
- methode.intro : Pas de promesse, pas de jargon. Une mécanique claire, adossée à des textes précis.
- methode.m1 : Base légale → Gel des loyers des passoires thermiques (F et G) depuis le 24/08/2022.
- methode.m2 : Plafonnement → Bouclier loyer, révisions encadrées (+3,5 % max) sur la période T3-2022 à T1-2024.
- methode.m3 : Cadre d'activité → Recouvrement amiable de créances pour le compte d'autrui (art. R124-1 et s. CPCE).
- methode.m4 : Rémunération → 25 % du trop-perçu effectivement récupéré. Aucun frais sans récupération.

**§5 Preuve sociale**
- preuve.title : Nos résultats
- preuve.emptyState (imposé par la spec) : « Premier dossier en cours : le nôtre. »

**§6 CTA**
- cta.title : Découvrez si votre loyer est récupérable. (le bouton réutilise le CTA du deck §1)

**Phrase avocat** (rendue uniquement si legalReviewDone=true ; brouillon gardé masqué)
- legalReviewLine : Parcours validé par un avocat. *(à confirmer/reformuler par l'avocat AVANT de lever le flag)*

**JSON-LD**
- jsonLd.founderJobTitle : Fondateur
- jsonLd.nicolasName (nom complet) : Nicolas *(nom complet à confirmer)*
- jsonLd.nicolasJobTitle : Expert de la location

**Injections**
- storyTeaser.l1 : Notre premier dossier, c'était le nôtre.
- storyTeaser.l2 : Un loyer trop élevé, une base légale, un trop-perçu récupérable.
- storyTeaser.l3 : Voilà comment TropPayé est né.
- storyTeaser.linkLabel : Lire notre histoire
- reviewer.phrase : Chaque dossier repose sur une base légale identifiée et un montant estimé récupérable.
- reviewer.photoAlt : Portrait du référent qui suit votre dossier
- verdictStoryLine : D'après vos informations, votre situation présente un trop-perçu potentiellement récupérable.
- footerSignature : TropPayé : recouvrement amiable du trop-perçu locatif.
