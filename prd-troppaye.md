# TropPayé — PRD (Product Requirements Document)
### v1.0 — juin 2026 — Périmètre V1 (lancement public)

---

## 1. Vision et objectifs

**Vision.** Tout locataire français peut savoir en 2 minutes si son
loyer est irrégulier, et récupérer son argent sans effort, sans
connaissance juridique et sans risque financier.

**Objectifs V1 (6 premiers mois après lancement public)**
| Métrique | Cible | Mesure |
|---|---|---|
| Diagnostics complétés | 10 000 | événement verdict_affiché |
| Taux diagnostic → mandat signé | ≥ 4 % | funnel |
| Taux de succès amiable (dossiers DPE/IRL) | ≥ 55 % | dossiers WON / (WON+LOST) |
| Délai médian mandat → encaissement | ≤ 75 jours | pipeline |
| NPS post-reversement | ≥ 60 | email post-succès |
| Matching DPE automatique | ≥ 60 % des adresses | logs module DPE |

**Anti-objectifs V1 (non-goals — ne PAS construire)**
App mobile native · module encadrement-plafond complet · analyse OCR
des décomptes de charges · B2B bailleurs · multi-langue · paiement CB
du bailleur (virement uniquement) · automatisation totale de la revue
(l'humain valide chaque dossier) · chat temps réel.

## 2. Personas

**P1 — Léa, 27 ans, locataire urbaine (cible primaire).** Studio ou T2
dans une métropole, bail récent, logement ancien possiblement F/G.
Découvre TropPayé via TikTok ou un guide SEO. Ne connaît rien au droit,
ne veut AUCUN conflit direct avec son bailleur, n'a pas 40 € à risquer.
Besoin : savoir vite, déléguer tout, être tenue au courant.

**P2 — Karim, 35 ans, locataire sortant.** Vient de déménager, dépôt
de garantie non restitué depuis 2 mois. Besoin : récupérer dépôt +
pénalités sans y passer ses soirées.

**P3 — Opérateur TropPayé (interne).** Valide les dossiers, suit le
pipeline, traite les réponses des bailleurs avec les scripts, déclenche
les escalades. Besoin : tout voir en un écran, ne jamais improviser de
réponse juridique.

## 3. Périmètre fonctionnel V1

Modules moteur : DPE_FREEZE, IRL_OVERCHARGE (5 sous-cas), DEPOSIT_LATE.
Parcours : diagnostic anonyme → verdict → mandat signé → recouvrement
piloté → encaissement → reversement. Surfaces : site public, espace
client, back-office. Périmètre légal : recouvrement amiable uniquement ;
toute contestation de fond part en escalade partenaire (V1 : export du
dossier en PDF + email au partenaire ; pas de portail partenaire).

---

## 4. Épopées et user stories (avec critères d'acceptation)

### ÉPOPÉE A — Diagnostic public

**A1. Saisir mon adresse et identifier mon logement**
En tant que visiteur anonyme, je saisis mon adresse pour que TropPayé
identifie mon logement et son DPE.
Critères d'acceptation :
- [ ] Autocomplétion BAN dès 3 caractères, sélection clavier possible
- [ ] Si DPE trouvé via ADEME : carte de confirmation « Est-ce bien
      votre logement ? » (classe, surface, date du DPE) avec Oui / Non
- [ ] Si plusieurs DPE candidats : liste de désambiguïsation (surface,
      étage si dispo), max 5
- [ ] Si aucun DPE : champ n° DPE 13 caractères (avec aide visuelle
      « où le trouver ») OU « je ne connais pas mon DPE » → le
      diagnostic continue sans le module DPE (dégradé documenté)
- [ ] Réponse ADEME mise en cache (clé banId, TTL 30 j)
- [ ] Aucune donnée nominative demandée à cette étape

**A2. Renseigner mon bail et mes augmentations**
- [ ] Une question par écran, retour arrière sans perte, autosave
      (session anonyme persistée, reprise par lien si email donné)
- [ ] Chaque champ financier a une aide « où trouver ce montant ? »
- [ ] Timeline d'augmentations : ajouter/supprimer une augmentation
      (date + nouveau montant), 0 à N entrées
- [ ] Validation zod partagée front/back (packages/shared)

**A3. Recevoir mon verdict**
- [ ] Le moteur évalue TOUTES les règles actives et agrège (cumul sans
      double comptage, cf. annexe typologie)
- [ ] Verdict irrégulier : séquence animée (charte §4) → montant
      récupérable + économie mensuelle + base légale en français
      simple + score de confiance + date limite de prescription
- [ ] Verdict conforme : page rassurante + proposition de veille
      gratuite (alerte si future augmentation) + modules dépôt/sortie
      proposés
- [ ] INSUFFICIENT_DATA : liste claire de ce qui manque + comment
      l'obtenir
- [ ] Email demandé APRÈS un aperçu du verdict (montant flouté ou
      fourchette), débloqué à la saisie — jamais avant
- [ ] Mention visible : « Estimation informative à partir de données
      publiques — ceci n'est pas un conseil juridique »
- [ ] Image OG dynamique générée par verdict (montant + tampon),
      bouton de partage
- [ ] Performance : verdict rendu < 3 s après la dernière réponse

### ÉPOPÉE B — Mandat

**B1. Comprendre le barème et signer le mandat**
- [ ] Écran barème : 25 % au succès, 0 € sinon, slider d'exemple
      interactif (trop-perçu → part locataire / part TropPayé)
- [ ] Récapitulatif complet du dossier modifiable avant signature
- [ ] Signature électronique Yousign des 2 documents (mandat + CGU),
      preuve stockée, PDF du mandat dans l'espace client
- [ ] Le mandat reprend les données EXACTES du verdict (montants,
      fondement) — généré depuis packages/templates
- [ ] Clause d'annulation : stop possible à tout moment (rappel à
      l'écran), conformément au mandat validé avocat

**B2. Fournir mes pièces**
- [ ] Checklist générée depuis missingData : bail (obligatoire),
      2 dernières quittances (obligatoire), pièces conditionnelles par
      module (quittance pré-augmentation, EDL sortie + remise des clés
      pour le dépôt)
- [ ] Upload drag & drop desktop + capture photo mobile ; jpg/png/pdf ;
      compression client ; 15 Mo max/pièce
- [ ] Statuts par pièce : reçue / illisible (motif) / validée —
      modifiables par l'opérateur, notifiés au client
- [ ] Le dossier peut être soumis incomplet sur les pièces optionnelles
      mais JAMAIS sans bail + quittances

### ÉPOPÉE C — Dashboard client

**C1. Suivre mon dossier**
- [ ] Frise verticale (charte §6) : étapes datées en langage humain,
      étape courante mise en évidence, pièces jointes consultables
      (PDF des courriers, AR)
- [ ] Carte « Prochaine étape » : action suivante + qui agit + date
      prévue, toujours présente
- [ ] Carte montants en mono : réclamé / récupéré / votre part /
      commission — mise à jour en temps réel
- [ ] Email à CHAQUE changement d'étape (templates dédiés)
- [ ] Messagerie asynchrone : réponses opérateur sous templates ;
      bandeau permanent information ≠ conseil ; détection de mots-clés
      juridiques sensibles → suggestion d'escalade à l'opérateur

### ÉPOPÉE D — Back-office opérateur

**D1. Revue des dossiers entrants**
- [ ] File triée par ancienneté avec scoring (force du verdict,
      complétude) ; actions : valider / demander pièce (motif templaté)
      / refuser (motif templaté, email au client)
- [ ] SLA affiché : objectif < 48 h ; dossiers en retard mis en avant
- [ ] La validation déclenche automatiquement la planification du
      courrier J0

**D2. Piloter le pipeline de recouvrement**
- [ ] Vue kanban par étape (J0 → J21 → J35 → J50 → encaissé / escaladé
      / clos) avec filtres (module, ville, montant)
- [ ] Séquence automatique : génération PDF depuis templates + envoi
      (LRE pour relances, papier pour J0) + suivi AR via webhooks ;
      PAUSE automatique de la séquence dès réception d'une réponse
      bailleur
- [ ] Tagging des réponses : PAIEMENT / CONTESTATION_FORME /
      CONTESTATION_FOND / DEMANDE_DELAI — CONTESTATION_FOND verrouille
      les relances et propose l'escalade (export PDF dossier + email
      partenaire pré-rempli)
- [ ] Aucune zone de texte libre vers le bailleur : uniquement des
      templates avec variables (garde-fou juridique)

**D3. Encaissements et reversements**
- [ ] Saisie d'un encaissement (date, montant, référence) rattaché au
      dossier ; rapprochement assisté par référence
- [ ] Calcul automatique commission/part locataire ; génération de la
      facture ; marquage du reversement effectué (virement manuel V1)
      → étape « Reversé » sur la frise + email
- [ ] Export comptable mensuel (CSV) des FundMovements du compte dédié

### ÉPOPÉE E — Moteur & données (déjà spécifiée au kit, rappel des AC transverses)
- [ ] 100 % de couverture de tests sur rules-engine ; fixtures
      « vérité terrain » versionnées
- [ ] Chaque verdict porte ruleVersion + computation rejouable
- [ ] Jobs : import IRL trimestriel (alerte si indice manquant),
      refresh des référentiels, cron des actions dues (idempotent)

## 5. Exigences non fonctionnelles

**Sécurité** : OWASP top 10 ; pièces en bucket privé, URLs signées
courtes ; chiffrement at-rest et in-transit ; rate limiting sur le
diagnostic (anti-scraping ADEME et anti-abus) ; journaux d'accès aux
dossiers (qui a vu quoi).
**RGPD** : consentement explicite à la création de compte ; export et
suppression de compte en self-service (cascade complète, pièces
incluses) ; rétention : dossiers clos purgés des pièces à +24 mois ;
aucun tracker tiers hors mesure d'audience exemptée ou consentie.
**Accessibilité** : AA ; navigation clavier complète du questionnaire ;
prefers-reduced-motion ; labels et erreurs explicites.
**Performance** : LCP < 2,5 s sur la home et les guides (SSG) ;
diagnostic utilisable en 3G ; images optimisées next/image.
**Fiabilité** : sauvegardes quotidiennes testées ; les webhooks
(Yousign, LRE) sont idempotents et rejouables ; aucune action de la
séquence ne peut partir deux fois (verrou par Action.id).
**Observabilité** : Sentry (erreurs), métriques funnel (événements :
diagnostic_démarré, verdict_affiché, email_capturé, mandat_signé,
J0_envoyé, encaissé, reversé).

## 6. Risques produit et mitigations (V1)
Verdict erroné envoyé à un bailleur = risque n°1 → revue humaine
obligatoire + fixtures vérité terrain + score de confiance bloquant
(LOW ne peut pas partir en J0). Couverture ADEME insuffisante →
parcours n° DPE soigné + mesure continue du taux de matching.
Conversion email trop basse → A/B sur l'aperçu de verdict (fourchette
vs montant flouté) via le design-lab.
