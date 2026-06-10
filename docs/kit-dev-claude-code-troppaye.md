# TropPayé — Kit de développement pour Claude Code
### Spécification technique exécutable — v1.0, juin 2026
### Usage : placer la section 1 dans le CLAUDE.md du repo ; les sections suivantes servent de specs de référence par milestone.

---

## 1. CLAUDE.md (à placer à la racine du repo)

```markdown
# TropPayé

Plateforme web qui détecte les loyers irréguliers (France) et récupère
le trop-perçu pour le compte des locataires (commission au succès).

## Stack
- Monorepo pnpm : `apps/web` (Next.js 14+, App Router, TypeScript —
  front public, espace client, back-office ET API via Route Handlers
  + Server Actions : pas de backend séparé en V1),
  `packages/rules-engine` (lib pure TS, zéro dépendance réseau),
  `packages/templates`, `packages/shared` (types zod partagés)
- PostgreSQL hébergé en France : base managée Scaleway/OVH (recommandé)
  ou conteneur Docker sur le VPS — accès via Prisma uniquement.
  Auth : magic links via Auth.js (NextAuth v5) + envoi d'emails par
  Resend ou Brevo. Stockage des pièces : Scaleway Object Storage
  (S3-compatible, bucket privé, chiffrement). Argument de marque :
  100 % des données hébergées en France.
- Séquences de relance (J0/J21/J35/J50) : table `Action` avec
  `scheduledAt` + cron système sur le VPS (ou pg_cron) qui appelle une
  route interne sécurisée exécutant les actions dues
- Déploiement : Docker (next build standalone) sur VPS Scaleway/OVH,
  reverse proxy Caddy ou Nginx (TLS auto), CI GitHub Actions ;
  un docker-compose.prod.yml décrit l'ensemble
- Tests : Vitest. Le rules-engine vise 100 % de couverture.

## Principes non négociables
1. Le moteur de règles (`packages/rules-engine`) est PUR : fonctions
   déterministes, aucune I/O. Les données externes (DPE, IRL) sont
   passées en paramètres. Tout est testable hors ligne.
2. Toute règle juridique porte `effectiveFrom` / `effectiveTo`.
   Le droit applicable dépend des dates du dossier, jamais de la date
   du jour.
3. Tout verdict référence : la règle appliquée (id + version), la base
   légale (texte), le calcul détaillé (audit trail JSON), un score de
   confiance (HIGH | MEDIUM | LOW).
4. Montants en centimes (integer), dates en ISO, fuseaux Europe/Paris.
5. Jamais de texte juridique improvisé : tous les courriers et messages
   viennent de templates versionnés dans `packages/templates`,
   considérés comme du contenu validé par l'avocat (ne pas modifier
   le sens, seulement le rendu).
6. RGPD : pas de log de données personnelles ; pièces stockées
   chiffrées ; suppression en cascade implémentée dès le début.

## Commandes
pnpm dev / pnpm test / pnpm lint / pnpm db:migrate / pnpm db:seed
```

---

## 2. Schéma de base de données (Prisma — extraits de référence)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  // auth par magic link : pas de mot de passe
  firstName     String?
  lastName      String?
  phone         String?
  createdAt     DateTime @default(now())
  dossiers      Dossier[]
}

model Dossier {
  id            String   @id @default(cuid())
  userId        String?  // null tant que diagnostic anonyme
  status        DossierStatus // DRAFT, DIAGNOSED, MANDATE_PENDING,
                // IN_REVIEW, RECOVERY, ESCALATED, WON, LOST, CLOSED
  // Le logement
  addressLabel  String
  banId         String?  // identifiant Base Adresse Nationale
  inseeCode     String?  // commune → zonages
  surfaceM2     Decimal?
  rooms         Int?
  furnished     Boolean?
  constructionPeriod String?
  // Le bail
  leaseSignedAt DateTime?
  leaseRenewedAt DateTime?
  initialRentCents Int?
  currentRentCents Int?
  chargesCents  Int?
  revisionClause Boolean?
  revisionQuarter String? // ex "T2" — trimestre IRL de référence
  previousTenantRentCents Int? // pour module relocation
  depositCents  Int?
  // DPE
  dpeNumber     String?
  dpeClass      String?  // A-G
  dpeDate       DateTime?
  dpeSource     DpeSource // ADEME_API | USER_INPUT | DOCUMENT
  rentHistory   RentEvent[]
  verdicts      Verdict[]
  pieces        Piece[]
  actions       Action[]
  fundMovements FundMovement[]
  mandate       Mandate?
}

model RentEvent {
  id        String @id @default(cuid())
  dossierId String
  date      DateTime
  type      RentEventType // INITIAL, REVISION, RENEWAL, RELOCATION,
                          // REGULARISATION_CHARGES
  rentCents Int
  source    String // "quittance", "déclaratif", "bail"
}

model Verdict {
  id          String @id @default(cuid())
  dossierId   String
  ruleId      String   // ex "DPE_FREEZE", "IRL_OVERCHARGE"
  ruleVersion String
  outcome     VerdictOutcome // IRREGULAR, COMPLIANT, INSUFFICIENT_DATA
  confidence  Confidence // HIGH, MEDIUM, LOW
  recoverableCents Int  // dans la fenêtre de prescription
  futureMonthlySavingCents Int
  actionDeadline DateTime? // date limite légale d'action si applicable
  legalBasis  String
  computation Json     // audit trail complet du calcul
  computedAt  DateTime @default(now())
}

model Mandate {
  id          String @id @default(cuid())
  dossierId   String @unique
  signedAt    DateTime?
  signatureProviderRef String? // id Yousign
  feeRateBps  Int @default(2500) // 25,00 % en basis points
  status      MandateStatus
  pdfUrl      String?
}

model Action { // chaque événement du pipeline de recouvrement
  id          String @id @default(cuid())
  dossierId   String
  type        ActionType // LETTER_J0, REMINDER_J21, PROPOSAL_J35,
              // FINAL_NOTICE_J50, LANDLORD_REPLY, ESCALATION,
              // PAYMENT_RECEIVED, PAYOUT_SENT
  scheduledAt DateTime?
  executedAt  DateTime?
  payload     Json     // ex : ref AR24, contenu réponse bailleur taguée
}

model FundMovement { // compte dédié — traçabilité R124
  id          String @id @default(cuid())
  dossierId   String
  direction   String // IN (bailleur) | OUT_TENANT | OUT_FEE
  amountCents Int
  reference   String
  occurredAt  DateTime
}

// Référentiels (versionnés)
model IrlIndex   { quarter String @id; value Decimal; publishedAt DateTime }
model TenseZoneCommune { inseeCode String @id; effectiveFrom DateTime;
                         effectiveTo DateTime? }
model FeeCapZone { inseeCode String @id; zone String /* TRES_TENDUE |
                   TENDUE | NORMALE */ ; effectiveFrom DateTime }
model LegalRule  { id String; version String; effectiveFrom DateTime;
                   effectiveTo DateTime?; params Json;
                   @@id([id, version]) }
```

---

## 3. Spécification du moteur de règles (packages/rules-engine)

### Interface commune

```typescript
type RuleInput = {
  dossier: DossierSnapshot       // données saisies + pièces extraites
  referentials: Referentials     // IRL, zones, plafonds — injectés
  asOf: Date                     // date d'évaluation
}
type RuleResult = {
  ruleId: string; ruleVersion: string
  outcome: 'IRREGULAR' | 'COMPLIANT' | 'INSUFFICIENT_DATA'
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  recoverableCents: number       // borné par la prescription
  futureMonthlySavingCents: number
  actionDeadline?: Date
  missingData?: string[]         // pilote les questions de relance UX
  computation: ComputationTrace  // chaque étape, pour l'audit et le PDF
}
```

### Règle DPE_FREEZE (V1 — la plus importante)

```
ENTRÉES : dpeClass, dpeDate, rentHistory[], leaseSignedAt
LOGIQUE :
  si dpeClass ∉ {F, G} → COMPLIANT
  si dpeClass inconnu → INSUFFICIENT_DATA (missingData: ["dpe"])
  augmentations = rentHistory où type ∈ {REVISION, RENEWAL, RELOCATION}
                  et date ≥ 2022-08-24
                  et rentCents > loyer précédent dans l'historique
  si aucune → COMPLIANT
  sinon :
    loyerLégal = dernier loyer avant la 1re augmentation illégale
    tropPerçu = Σ sur chaque mois depuis cette augmentation :
                (loyer payé - loyerLégal), borné à la fenêtre de
                prescription de 3 ans glissants avant asOf
    futureMonthlySaving = loyer actuel - loyerLégal
    confidence = HIGH si dpeSource = ADEME_API et quittances uploadées
               = MEDIUM si historique déclaratif
CAS LIMITES À TESTER :
  - nouveau DPE meilleur entre deux augmentations (le gel cesse à la
    date du nouveau DPE ≤ E)
  - plusieurs DPE pour la même adresse (prendre celui dont la surface
    correspond ± 10 %, sinon INSUFFICIENT_DATA + demande du n° DPE)
  - bail signé après l'augmentation (relocation : comparer au loyer
    du précédent locataire si connu)
```

### Règle IRL_OVERCHARGE (V1)

```
ENTRÉES : revisionClause, revisionQuarter, rentHistory[], irlIndices[]
LOGIQUE par révision r de l'historique :
  si revisionClause = false → toute révision est indue en totalité
  loyerMaxAutorisé = loyerPrécédent × IRL(trimestreRef, annéeN)
                                    / IRL(trimestreRef, annéeN-1)
  borne bouclier : si la révision prend effet entre 2022-10 et 2024-03,
    plafonner la variation à 3,5 % (paramètre LegalRule versionné)
  si rentAprès > loyerMaxAutorisé → indu mensuel = différence
  rétroactivité : tout rappel facturé pour une période antérieure à
    la demande de révision est indu (post-ALUR)
  tropPerçu = Σ indus mensuels sur fenêtre 3 ans
ARRONDIS : IRL appliqué avec la précision INSEE (2 décimales),
  résultat arrondi au centime — fixer la convention et la tester.
```

### Règle DEPOSIT_LATE (V1)

```
ENTRÉES : depositCents, leaveDate (remise des clés), edlConforme (bool),
          refundDate?, refundCents?, justificatifsFournis (bool)
LOGIQUE :
  délai = 1 mois si edlConforme sinon 2 mois
  si refund absent ou partiel sans justificatifs après délai :
    dû = depositCents - (retenues justifiées)
    pénalité = 10 % du loyer mensuel (hors charges) × nb de mois
               de retard ENTAMÉS depuis l'expiration du délai
  confidence HIGH si dates documentées (EDL uploadé)
```

(Modules V2+ — RELOCATION_TENSE_ZONE, AGENCY_FEES_CAP, etc. : specs à
détailler au moment de la vague, même gabarit.)

### Agrégateur

`evaluateAll(dossier)` exécute toutes les règles actives à la date,
agrège les IRREGULAR, déduplique les périodes qui se recouvrent
(ne jamais compter deux fois le même euro : si DPE_FREEZE et
IRL_OVERCHARGE couvrent la même augmentation, retenir le fondement au
recouvrable le plus élevé et mentionner l'autre en subsidiaire),
et produit le VerdictGlobal affiché à l'utilisateur.

---

## 4. Intégrations externes (contrats)

### 4.1 ADEME — Observatoire DPE (gratuit, open data)
- Base : `https://data.ademe.fr/data-fair/api/v1/datasets/`
  dataset logements existants post-07/2021 (vérifier le slug exact au
  démarrage : « dpe03existant » / « dpe-v2-logements-existants » —
  l'ADEME renomme parfois ses jeux de données).
- Requête par adresse : `?qs=adresse_ban:"<adresse normalisée BAN>"`
  ou par champ `numero_dpe` (saisie utilisateur, 13 caractères).
- Champs utiles : `etiquette_dpe`, `date_etablissement_dpe`,
  `surface_habitable_logement`, `adresse_ban`, `numero_dpe`.
- Rate limit anonyme ~600 req/60 s : mettre un cache (clé = banId,
  TTL 30 j) et une file de repli.
- Stratégie de matching : BAN id exact → sinon adresse + surface ±10 %
  → sinon demander le n° DPE à l'utilisateur (figure sur le bail ou
  l'annonce). TOUJOURS afficher le DPE trouvé pour confirmation
  utilisateur (« Est-ce bien votre logement ? Surface 42 m², 3e étage »).

### 4.2 Base Adresse Nationale
- `https://api-adresse.data.gouv.fr/search/?q=...` → autocomplétion,
  banId, inseeCode (clé des zonages). Gratuit, sans clé.

### 4.3 IRL INSEE
- Série trimestrielle (identifiant série INSEE à fixer au démarrage) ;
  import trimestriel via job + table IrlIndex ; seed initial avec
  l'historique depuis 2018 (fenêtre 3 ans + marge).

### 4.4 Signature électronique (Yousign — API REST)
- Flux : créer procédure → 2 documents (mandat PDF généré + CGU) →
  signataire (email/SMS OTP) → webhook `procedure.finished` →
  stocker preuve + passer Mandate.status = SIGNED.

### 4.5 Lettre recommandée électronique (AR24 ou équivalent)
- Envoi LRE qualifiée (valeur légale identique au recommandé papier
  pour un destinataire particulier ayant consenti — sinon bascule
  courrier papier via prestataire hybride type Merci Facteur).
- Webhooks : déposé / AR signé / refusé / négligé → Action.payload.
- Le choix LRE vs papier est une règle métier : papier par défaut
  pour le courrier J0 (plus de poids psychologique), LRE pour les
  relances (coût).

### 4.6 Paiements
- Encaissement bailleur : virement avec référence dossier sur le
  compte DÉDIÉ (rapprochement par référence ; un lien de paiement CB
  peut être proposé en plus).
- Reversement locataire : virement SEPA sortant.
- ⚠️ Le compte dédié R124 est un compte bancaire classique fléché,
  PAS un compte Stripe : valider le montage exact (banque + éventuel
  PSP) avec l'avocat et la banque AVANT de coder ce module.
  En attendant : rapprochement manuel assisté dans le back-office.

---

## 5. User stories par milestone (backlog Claude Code)

### M0 — Socle (semaine 1)
- Monorepo, CI (lint + tests), Prisma + migrations, seed des
  référentiels (IRL historique, zones tendues), auth magic link.

### M1 — Rules engine V1 (semaines 2-3)
- DPE_FREEZE, IRL_OVERCHARGE (5 sous-cas), DEPOSIT_LATE + agrégateur.
- 50+ tests unitaires incluant les cas limites listés §3 et les
  30-50 cas réels « vérité terrain » (fixtures JSON).
- CLI interne : `pnpm verdict fixtures/cas-017.json` → verdict lisible.

### M2 — Diagnostic public (semaines 3-5)
- Parcours 4 étapes (cf. doc structure §4) : autocomplétion BAN,
  appel ADEME avec confirmation visuelle du logement, formulaire
  bail/historique, page verdict (montant, explication, base légale,
  confiance, deadline, mention « information, pas conseil »).
- Email capturé seulement après verdict partiel ; reprise de session.
- Page verdict partageable (image OG dynamique avec le montant —
  levier viral).

### M3 — Tunnel mandat + espace client (semaines 5-7)
- Upload pièces (bail, quittances, EDL), checklist dynamique pilotée
  par missingData du verdict ; intégration Yousign ; espace de suivi
  (frise des Actions) ; emails transactionnels.

### M4 — Back-office + pipeline (semaines 7-10)
- File de revue (valider / demander pièce / refuser avec motif),
  génération PDF des courriers depuis templates, séquence BullMQ
  J0/J21/J35/J50 avec pause automatique si LANDLORD_REPLY,
  tagging des réponses (PAIEMENT / CONTESTATION_FORME /
  CONTESTATION_FOND → escalade), saisie des FundMovements +
  rapprochement manuel, reversement et facture de commission.

### M5 — Contenu & SEO (parallèle, dès M2)
- Pages guides en MDX, sitemap, schema.org FAQPage, OG images.

---

## 6. Courriers types (squelettes — CONTENU À VALIDER PAR L'AVOCAT)

Templates dans `packages/templates`, variables entre {{ }}.
Mentions obligatoires R124-4 sur CHAQUE courrier de recouvrement :
identité et coordonnées de la société, fondement et montant détaillé
de la créance (principal/frais), modalités de paiement, rappel que
les frais de recouvrement amiable restent à la charge du créancier.

- `lettre-J0-dpe.md` : notification du mandat, exposé factuel (classe
  DPE, dates, montants — issus de computation), demande de
  remboursement de {{recoverable}} et régularisation du loyer à
  {{legalRent}}, délai de réponse 21 jours, coordonnées de paiement
  (compte dédié + référence).
- `relance-J21.md`, `proposition-J35.md` (option échéancier),
  `dernier-avis-J50.md` (annonce de la transmission du dossier).
- Variantes par fondement (IRL, dépôt) et par destinataire
  (bailleur particulier / SCI / agence mandataire).

## 7. Définition de « prêt à lancer » (checklist produit)

- [ ] Les 3 règles V1 passent 100 % des fixtures vérité terrain
- [ ] Taux de couverture ADEME mesuré sur 200 adresses tests réelles
      (objectif > 60 % de matching auto ; sinon renforcer le parcours
      n° DPE)
- [ ] Un dossier complet exécuté en sandbox de bout en bout
      (diagnostic → mandat signé → J0 généré → encaissement simulé →
      reversement simulé) en < 30 min de travail humain
- [ ] Templates validés par l'avocat (version figée, hash en base)
- [ ] Pentest minimal (OWASP top 10) + sauvegardes testées
- [ ] Mentions légales, CGU, bandeau cookies, registre RGPD en place
```

---

*Ce kit + les 3 documents précédents (BP v2, structure & prérequis,
typologie des cas) forment le dossier complet. Reste côté fondateur :
nom/domaine/marque, comptes prestataires, avocat conseil, et le brief
design (charte visuelle) — à faire avant M2.*
