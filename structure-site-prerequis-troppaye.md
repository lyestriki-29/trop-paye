# TropPayé — Structure du site web & prérequis
### Document de conception technique et opérationnelle — v1.0, juin 2026

---

## 1. Arborescence du site public

```
troppaye.fr
│
├── / (Accueil)
│   → Promesse : "Votre loyer est-il légal ? Vérifiez en 2 min.
│     Si on récupère rien, vous ne payez rien."
│   → CTA unique : démarrer le diagnostic
│   → Preuves : montant total récupéré, témoignages, presse
│
├── /diagnostic (le cœur du site — parcours en 4 écrans)
│   ├── Étape 1 : adresse du logement (autocomplétion BAN)
│   ├── Étape 2 : le bail (date signature, loyer initial, meublé/vide,
│   │             surface, nb pièces, époque construction si connue)
│   ├── Étape 3 : les augmentations (historique des loyers payés,
│   │             upload quittances optionnel)
│   └── Étape 4 : VERDICT chiffré + explication pédagogique
│                 → si irrégularité : CTA "Récupérez X € — mandat en ligne"
│                 → si conforme : page rassurante + alerte veille gratuite
│
├── /mandat (tunnel de conversion post-diagnostic)
│   ├── Récapitulatif du dossier et des montants
│   ├── Upload des pièces (bail, quittances, DPE si dispo)
│   ├── Barème en clair : 25 % au succès, 0 € sinon, exemples chiffrés
│   ├── Signature électronique (mandat R124 + CGU)
│   └── Confirmation + accès espace personnel
│
├── /espace (espace client connecté)
│   ├── Tableau de bord : statut du dossier (frise chronologique)
│   ├── Documents : courriers envoyés, accusés de réception, mandat
│   ├── Messagerie (réponses scriptées + escalade humaine)
│   └── Paiements : remboursements reçus, reversements, factures
│
├── /guides (le moteur SEO — architecture en silo)
│   ├── /guides/dpe
│   │   ├── augmentation-loyer-dpe-f-g-interdite
│   │   ├── verifier-classe-dpe-de-mon-logement
│   │   ├── location-dpe-g-interdite-2025
│   │   └── ... (1 page par question à forte intention)
│   ├── /guides/encadrement
│   │   ├── /paris, /lille, /bordeaux, /montpellier... 
│   │   │   (1 page par ville : plafonds, quartiers, simulateur intégré)
│   ├── /guides/irl
│   │   └── calcul-augmentation-loyer-irl, augmentation-illegale...
│   └── /guides/complement-de-loyer
│
├── /comment-ca-marche (parcours expliqué + barème + FAQ)
├── /resultats (compteur public, études de cas anonymisées)
├── /partenaires (page avocats & associations)
├── /a-propos, /presse
└── /legal (CGU, mentions, confidentialité, politique cookies,
            mention "information juridique, pas de conseil personnalisé")
```

## 2. Back-office (interne)

```
admin.troppaye.fr
├── File de revue : dossiers en attente de validation humaine pré-mandat
│   (scoring automatique : force du dossier, complétude des pièces)
├── Pipeline de recouvrement : vue kanban par étape
│   (courrier J0 → relance J+21 → proposition J+35 → dernier avis J+50
│    → encaissé / transmis partenaire / clos sans suite)
├── Gestion des courriers : génération, envoi recommandé API, suivi AR
├── Comptabilité dédiée : compte de fonds clients (encaissements
│   bailleurs, reversements locataires, commissions) — traçabilité
│   exigée par le statut R124
├── Partenaires : transmission de dossiers, suivi des issues
├── Référentiel réglementaire : édition des règles (arrêtés, IRL,
│   zones) avec versionnage par date d'effet
└── Analytics : taux de conversion par étape, taux de succès par type
    d'irrégularité, délai moyen, montant moyen
```

## 3. Architecture technique

### Stack recommandée

| Couche | Choix | Pourquoi |
|---|---|---|
| Front public | Next.js (React) | SEO critique (SSR/SSG des guides), un seul langage |
| Back API | Node.js (NestJS) ou Go | Vos compétences ; NestJS structure bien un domaine métier riche |
| Base de données | PostgreSQL | Relationnel, JSONB pour les règles versionnées |
| File d'attente | Redis + BullMQ (ou équivalent) | Séquences de relances programmées (J0, J+21...) |
| Stockage documents | S3 compatible (Scaleway) | Pièces des dossiers, chiffrement au repos, hébergement FR |
| Génération PDF | Bibliothèque HTML→PDF (côté serveur) | Courriers et dossiers |
| Signature électronique | Yousign ou Universign (FR, eIDAS) | Mandat R124 opposable |
| Envoi recommandé | API type Merci Facteur / AR24 (LRE) | LRE = recommandé électronique légal, coût réduit |
| Paiements | Stripe (encaissement) + virements SEPA sortants | Attention : voir prérequis compte dédié §5 |
| Auth | Magic link + email | Friction minimale |
| Hébergement | Scaleway / OVH | Données FR, argument de marque |

### Le moteur de règles (le cœur de la valeur)

Principe : `verdict = f(logement, bail, historique_loyers, date)` — toutes les règles sont **versionnées par date d'effet**, car le droit applicable dépend de la date de signature/renouvellement du bail.

Modules de détection, par ordre de construction :

1. **Module DPE (priorité 1)** : entrée = adresse → interrogation de l'API
   Observatoire DPE de l'ADEME (data.ademe.fr, gratuite, sans clé pour
   la consultation) → classe énergétique + date du diagnostic.
   Règle : si classe ∈ {F, G} et augmentation de loyer (révision,
   renouvellement ou relocation) postérieure au 24/08/2022 → irrégularité.
   Cas dégradés : DPE introuvable à l'adresse (saisie manuelle du n° DPE
   à 13 caractères figurant sur le bail/annonce), DPE multiple pour un
   immeuble (désambiguïsation par étage/surface), DPE refait après travaux.

2. **Module IRL (priorité 1)** : série des indices INSEE (publication
   trimestrielle, API ou import). Règles : plafond de révision annuelle
   = IRL ; clause de révision requise au bail ; prescription de l'action ;
   plafonnements spécifiques (bouclier loyer 2022-2024 à 3,5 %).

3. **Module zones tendues / relocation (priorité 2)** : référentiel des
   communes en zone tendue (décret, liste publique) ; règle = loyer du
   nouveau bail ≤ dernier loyer du précédent locataire (sauf exceptions
   travaux/sous-évaluation). Limite : nécessite de connaître l'ancien
   loyer (le bail doit le mentionner — champ du formulaire).

4. **Module encadrement avec plafond (priorité 3)** : base des arrêtés
   préfectoraux par territoire (Paris, Est Ensemble, Plaine Commune,
   Lille, Bordeaux, Montpellier...) : plafond €/m² par zone géographique
   × nb pièces × époque × meublé. Travail de structuration de données
   important, à maintenir chaque année. À construire APRÈS le lancement
   (et seulement si le dispositif est prolongé fin 2026).

5. **Module complément de loyer (priorité 4)** : détection seulement
   (signal "complément possiblement abusif") → escalade partenaire
   directe, jamais de recouvrement autonome (irrégularité non binaire).

### Modèle de données (simplifié)

```
users ──< dossiers ──< pieces (bail, quittances, DPE...)
              │
              ├──< verdicts (versionnés : règle appliquée, montants,
              │              référence légale, date de calcul)
              ├──< actions (courrier J0, AR reçu, relance, réponse
              │             bailleur, transmission partenaire...)
              └──< mouvements_fonds (encaissement bailleur,
                            reversement locataire, commission)

referentiel_regles (type, territoire, date_debut, date_fin, paramètres JSONB)
indices_irl (trimestre, valeur)
arretes_encadrement (territoire, annee, zone, pieces, epoque, meuble, plafond)
```

## 4. Parcours utilisateur détaillé (diagnostic → reversement)

1. **Diagnostic (2 min, anonyme jusqu'au verdict)** : ne demander l'email
   qu'APRÈS avoir montré un verdict partiel — le verdict complet chiffré
   est le "hook" qui justifie l'inscription.
2. **Verdict** : montant en gros, explication en français simple, base
   légale citée, niveau de confiance affiché (élevé/moyen — honnêteté =
   confiance), et la mention information ≠ conseil juridique.
3. **Mandat** : 3 écrans max. Pièces minimales : bail + 2 quittances
   (le reste peut être complété après). Signature électronique des deux
   documents. Email de confirmation avec copie du mandat.
4. **Revue humaine (interne, <48 h)** : validation ou demande de pièce
   ou refus motivé ("dossier insuffisant" — protège le taux de succès).
5. **Séquence de recouvrement** : courriers automatiques aux jalons,
   chaque événement notifié au locataire (transparence = rétention).
   Toute réponse du bailleur contenant une contestation de fond est
   taguée et basculée en escalade.
6. **Encaissement & reversement** : paiement du bailleur sur le compte
   dédié (virement avec référence dossier, ou lien de paiement) →
   reversement au locataire sous 7 jours, commission déduite, facture
   automatique.
7. **Post-succès** : demande d'avis/témoignage, proposition de parrainage
   ("votre immeuble est classé F — vos voisins sont probablement dans le
   même cas"), veille gratuite activée sur le bail (alerte à chaque
   future augmentation notifiée).

## 5. Prérequis — checklist complète avant lancement

### Juridique & conformité (bloquant, mois 1-2)

- [ ] **Avocat conseil** sélectionné (droit immobilier + régulation des
      legaltechs) — valide TOUT ce qui suit
- [ ] **Mandat de recouvrement** conforme R124-2 : convention écrite,
      pouvoir de recevoir les fonds, fondement de la créance, barème,
      conditions de reversement, clause "commission due même si le
      bailleur paie directement le locataire"
- [ ] **CGU/CGV** : frontière information/conseil explicite, barème,
      rétractation (vente à distance), médiation de la consommation
      (adhésion à un médiateur agréé — obligatoire B2C)
- [ ] **Statut recouvrement amiable** :
      - [ ] assurance RC professionnelle couvrant l'activité
      - [ ] compte bancaire DÉDIÉ aux fonds clients (établissement de
            crédit agréé) — séparé du compte d'exploitation
      - [ ] déclaration écrite au procureur de la République du TJ du
            siège, AVANT tout exercice
      - [ ] mentions obligatoires des courriers de recouvrement
            (R124-4 : identité, fondement, montant détaillé, modalités)
- [ ] **Scripts figés** : tous les courriers et réponses types validés ;
      procédure d'escalade documentée pour le support
- [ ] **Convention type avocats partenaires** (transmission, honoraires
      au résultat côté partenaire, respect de la déontologie — pas de
      partage d'honoraires prohibé)
- [ ] **RGPD** : registre des traitements, DPO désigné (externe possible),
      AIPD recommandée (données financières + pièces d'identité
      éventuelles), hébergement UE, durées de conservation, CNIL —
      bannière cookies conforme
- [ ] **Structure** : société (SAS recommandée — responsabilité limitée
      indispensable vu l'activité), RC exploitation, compta avec expert-
      comptable (fonds de tiers = rigueur comptable non négociable)
- [ ] **Marque** : recherche d'antériorité + dépôt INPI + nom de domaine

### Données & technique (mois 1-3)

- [ ] Accès et tests **API Observatoire DPE ADEME** (couverture réelle
      par adresse à mesurer sur un échantillon — déterminant pour l'UX)
- [ ] **Base Adresse Nationale** (BAN) pour l'autocomplétion
- [ ] Import et mise à jour des **séries IRL INSEE**
- [ ] Référentiel **zones tendues** (liste des communes, décret en vigueur)
- [ ] Prestataires contractualisés : signature électronique, LRE/
      recommandé, paiement
- [ ] Environnement : repo, CI/CD, monitoring, sauvegardes chiffrées,
      gestion des secrets
- [ ] Jeu de **tests du moteur de règles** : 30-50 cas réels vérifiés à
      la main (votre "vérité terrain") — non négociable, une erreur de
      verdict envoyée à un bailleur est le pire risque réputationnel

### Opérationnel & marketing (mois 2-4)

- [ ] 2 avocats partenaires signés (couvrant au moins Paris + une autre
      métropole)
- [ ] Procédure de revue humaine documentée (critères accepter/refuser)
- [ ] 15-20 guides SEO rédigés avant lancement (le SEO met 3-6 mois —
      commencer tôt)
- [ ] Landing + liste d'attente dès le mois 1 (mesurer l'appétence
      avant d'avoir fini le produit)
- [ ] Pilote : 20-30 dossiers réels bout en bout — valider taux de
      succès, délai, montant moyen AVANT d'ouvrir au public
- [ ] Kit presse + 3 témoignages documentés issus du pilote

## 6. Ce qui peut attendre (à ne PAS construire au début)

App mobile (le web responsive suffit largement), module encadrement
complet (attendre le sort du dispositif fin 2026), module dépôt de
garantie (extension année 2), B2B bailleurs (année 2-3), automatisation
totale de la revue (l'humain dans la boucle est une force au début),
tableau de bord partenaires sophistiqué (un email structuré suffit pour
2 avocats).

---

*Prochaine étape logique : prototyper le module DPE (API ADEME + règle
du gel) — c'est à la fois le test technique le plus important et la
démo qui convaincra l'avocat conseil et les premiers partenaires.*
