# Plan LOT 3 — mini-tunnel « logement quitté » (dépôt de garantie seul)

**Date** : 2026-06-12 · **Branche** : feat/refonte-phase2 · **Exécution** : Codex 5.5 xhigh, revue Claude.

## Décision de périmètre (arbitrage Lyes 2026-06-12)
- **Dépôt seul.** Le volet préavis du backlog #9 est DIFFÉRÉ : nouvelle règle
  juridique à créer ([AVOCAT], TODO_VERIFIER) et inerte tant que le dataset
  `zoneByInsee` n'est pas chargé (backlog #4). Le dépôt est la grosse somme
  facile : principal jusqu'à 1-2 mois de loyer + pénalité 10 %/mois de retard,
  règle `DEPOSIT_LATE` déjà codée et testée (7 cas, confiance HIGH).
- **Zéro question ajoutée au tunnel principal** (promesse « 2 minutes »).
  Module post-verdict opt-in, option A de la note produit
  `docs/produit-questionnaire-pieces-retention.md` §2.

## Architecture (calquée sur les boosters, pattern éprouvé)
Le gabarit est le module boosters : carte sous le verdict, aperçu live client
(moteur pur), brouillon localStorage, submit = server action qui re-évalue
côté serveur (source de vérité) et versionne un nouveau verdict.

## Étapes

### 1. Lib pure `apps/web/lib/diagnostic/deposit-tunnel.ts` (+ tests)
- `depositAnswersSchema` (zod) : `leaveDate` (ISO, requise), `edlConforme`
  (boolean, requis), montant du dépôt en NOMBRE DE MOIS (arbitrage Lyes
  2026-06-12) : `depositMonths` (`1 | 2 | 3`) OU `depositCents` exact
  (int centimes > 0) si « autre » — exactement un des deux ; restitution :
  `refunded` (`"NO" | "PARTIAL" | "FULL"`) + si PARTIAL/FULL `refundCents` et
  `refundDate` ; `justifiedRetentionCents` optionnel.
- Conversion mois → centimes dans le merge : `depositMonths ×` loyer INITIAL
  hors charges du snapshot (le dépôt est fixé à la signature, pas au loyer
  courant).
- **COLOCATION EXCLUE du mini-tunnel** (arbitrage Lyes 2026-06-12) : si le
  dossier est une colocation (`isShared` / `rentBasis = "SHARE"`), le module
  ne s'affiche PAS et le schema/server action refusent les réponses (le dépôt
  d'un bail unique de coloc appartient à tous les colocataires, cas trop
  ambigu pour un déclaratif court). On affinera si le locataire recontacte.
- `mergeDepositAnswers(snapshot, answers)` : PUR, sémantique REMPLAÇANTE
  (purge `snapshot.deposit` puis repose depuis answers). `monthlyRentCents`
  sourcé du loyer courant du snapshot ; ne JAMAIS multiplier le dépôt par
  `tenantCount` (piège coloc documenté).
- `answersFromSnapshot(snapshot)` pour pré-remplir (y compris pré-remplissage
  de `depositCents` depuis `depositPaidCents` si déjà saisi via booster
  DEPOSIT_CAP — champs distincts, ne pas les fusionner).
- Critère : tests Vitest (merge, rétractation, pré-remplissage, coloc).

### 2. Server action `apps/web/app/diagnostic/[verdictId]/deposit-actions.ts`
- Même squelette que `booster-actions.ts` : parse zod + vérif session token
  (cookie httpOnly vs `dossiers.session_token`), merge, `evaluateAll()`
  serveur, UPDATE `engine_snapshot`, INSERT nouveau verdict versionné,
  `trackEvent("deposit_tunnel_applique")`, retourne le nouveau `verdictId`.
- Critère : test du parse + refus sans session valide (même niveau que les
  tests boosters existants).

### 3. UI `apps/web/app/diagnostic/[verdictId]/DepositModule.tsx`
- 4 questions, une carte : DateField (remise des clés, max = aujourd'hui),
  ChoiceField EDL conforme O/N, dépôt en ChoiceField « 1 mois / 2 mois /
  3 mois / autre » (« autre » ouvre un MoneyField pour le montant exact ;
  afficher l'équivalent en € calculé sous le choix en mois), ChoiceField
  remboursé NON/PARTIEL/TOTAL (+ champs conditionnels montant/date).
- Le module ne se rend pas du tout pour un dossier colocation (cf. §1).
- Aperçu live : `mergeDepositAnswers` + `evaluateAll` côté client, montant
  via `<Amount favorable>` (Spline Sans Mono, tabular-nums).
- Brouillon `localStorage` `tp_deposit_{dossierId}` (débounce 400 ms, comme
  les boosters), pré-rempli via `answersFromSnapshot`.
- Textes : brouillons marqués « brouillon », recensés au copy deck (§2bis),
  AUCUN texte juridique improvisé.

### 4. Branchement page verdict
- `VerdictView.tsx` : afficher `DepositModule` sous les mêmes conditions que
  les boosters (`outcome !== "INSUFFICIENT_DATA"`).
- `VerdictCompliant.tsx` : le rebond existant « Vous quittez bientôt votre
  logement ? Vérifiez aussi votre dépôt de garantie. » devient un CTA qui
  scrolle/ancre vers le module (texte du copy deck §2 inchangé, mot pour mot).

### 5. Copy deck
- `docs/copy-deck-troppaye.md` : §2bis « Mini-tunnel dépôt » avec les libellés
  brouillon + liste TODO_COPY pour validation Lyes/avocat.

### 6. Vérification (Claude, après exécution Codex)
- `pnpm typecheck` + `pnpm test` (145 tests existants + nouveaux) + `pnpm lint`.
- Revue du diff complet (sécurité server action, RGPD : pas de PII en log,
  centimes int, dates ISO).

## Hors périmètre
- Règle préavis (lot séparé, avec avocat + zonage).
- Page d'entrée SEO autonome « j'ai quitté mon logement » (pourra réutiliser
  le module plus tard).
- Modification du moteur : AUCUNE (DEPOSIT_LATE inchangé).
