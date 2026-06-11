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

### ⚠️ SQUELETTE À REMPLIR PAR LYES — chaque `TODO_COPY` bloque le build de prod
### (scripts/check-copy.mjs). Une fois remplie, aligner mot pour mot
### apps/web/lib/content/notre-histoire.ts. Garde-fous : Nicolas = « expert de
### la location » UNIQUEMENT (jamais juriste/expert juridique) ; aucune mention
### « validé par avocat » hors flag legalReviewDone.

**SEO**
- seo.title : TODO_COPY
- seo.description : TODO_COPY

**§1 Hero « cas zéro »** (chiffres réels actés 2026-06-11 : loyer 900,00 € HC,
complément de loyer 120,00 €/mois, logement classé F — éditables ici)
- hero.kicker : TODO_COPY
- hero.title : TODO_COPY
- hero.intro : TODO_COPY
- casZero.meta (ligne mono sous l'en-tête de la quittance, non-PII) : TODO_COPY

**§2 Récit du duo** (deux voix en alternance)
- duo.title : TODO_COPY
- duo.founder.role (affiché sous « Lyes ») : TODO_COPY
- duo.founder.photoAlt : TODO_COPY
- duo.founder.p1 / p2 : TODO_COPY
- duo.nicolas.photoAlt : TODO_COPY
- duo.nicolas.p1 / p2 : TODO_COPY
  (le rôle affiché de Nicolas est figé : « Expert de la location »)

**§3 La bascule**
- bascule.title : TODO_COPY
- bascule.p1 / p2 : TODO_COPY

**§4 La méthode** (mentions type document officiel : 4 paires libellé → valeur)
- methode.title / methode.intro : TODO_COPY
- methode.m1..m4 (label + value) : TODO_COPY

**§5 Preuve sociale**
- preuve.title : TODO_COPY
- preuve.emptyState (imposé par la spec) : « Premier dossier en cours : le nôtre. »

**§6 CTA**
- cta.title : TODO_COPY (le bouton réutilise le CTA du deck §1)

**Phrase avocat** (rendue uniquement si legalReviewDone=true)
- legalReviewLine : TODO_COPY

**JSON-LD**
- jsonLd.founderJobTitle : TODO_COPY (ne pas inventer)
- jsonLd.nicolasName (nom complet) : TODO_COPY
- jsonLd.nicolasJobTitle : TODO_COPY (jamais « juriste »)

**Injections**
- storyTeaser.l1/l2/l3 (3 lignes, homepage) + storyTeaser.linkLabel : TODO_COPY
- reviewer.phrase (tunnel mandat, étape signature) + reviewer.photoAlt : TODO_COPY
- verdictStoryLine (une ligne, verdict positif uniquement) : TODO_COPY
- footerSignature (signature courte du footer) : TODO_COPY
