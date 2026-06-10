# QA T3→T6 — Walkthrough & vérifications

Guide de revue « vivante » à dérouler quand tu testes le site finalisé. Tout tourne en
local (Supabase Docker + mocks). Aucun euro, courrier ou email réel.

## Démarrer

```bash
pnpm db:start                       # Supabase local (Docker)
pnpm db:reset                       # applique migrations + seed.sql (référentiels)
pnpm --filter @troppaye/web db:seed-demo   # comptes + dossiers de démo (chaque état)
pnpm dev                            # http://localhost:3000
```

Comptes de démo : `admin@troppaye.test` (back-office) et `client@troppaye.test` (espace).
Connexion = magic link local : le lien s'affiche dans les logs `supabase` (Inbucket
`http://localhost:54324`).

## Parcours bout-en-bout (happy path)

1. **Diagnostic** `/diagnostic` — questionnaire → soumettre → page verdict (tampon + count-up).
2. **Mandat** — « Lancer la récupération » → connexion (le dossier anonyme est **réclamé**)
   → page mandat (récap, 25 %, consentement) → **Signer** : PDF figé, hash + preuve.
3. **Pièces** — ajouter `bail` + `quittance` (chiffrées) → le dossier passe en **IN_REVIEW**.
4. **Espace** `/espace/[id]` — frise de suivi, montants, pièces (déchiffrées via `/api/pieces`),
   messagerie scriptée.
5. **Back-office** `/admin` (compte admin) — file de revue → **Valider** (bloqué si
   confiance LOW) → la séquence J0/J21/J35/J50 est planifiée → `RECOVERY`.
6. **Pipeline** — détail dossier → **Avancer le temps** (exécute le courrier suivant, mock
   LRE) ; **Réponse bailleur → pause** (aucune relance ne part) ; **Reprendre** ;
   **Contestation → escalade** (verrou) ; **Enregistrer le paiement** → `WON`
   (fund_movements IN / commission / reversement).
7. **Cron** (séquence automatique) :
   ```bash
   curl -X POST http://localhost:3000/api/cron/run-due-actions -H "x-cron-secret: $CRON_SECRET"
   ```
   N'exécute que les actions dues, **saute** les dossiers PAUSED/LOCKED, idempotent.

## Vérifications de sécurité (à confirmer)

- **IDOR** : connecté en client A, tenter `/espace/<dossierId de B>` et
  `/api/pieces/<piece de B>` → doit renvoyer 404 (RLS + check ownership).
- **Claim** : un dossier déjà possédé par un autre compte n'est pas réclamable (page mandat → 404).
- **Cron** : sans header `x-cron-secret` → 401.
- **Chiffrement** : les objets du bucket `pieces` sont des octets chiffrés (illisibles) ;
  seul `/api/pieces/[id]` (owner/admin) les déchiffre.
- **LOW bloquant** : un dossier IN_REVIEW en confiance LOW ne peut pas être validé.
- **RLS** : `outbox_emails`, `fund_movements`, `signature_proofs` ne sont jamais écrits côté
  client (service_role only).

## Reste à faire (hors de ce push)

- **Playwright e2e** : la suite n'est pas branchée (le parcours dépend de Géoplateforme/ADEME
  réels + auth magic link). À installer une fois le flux validé visuellement.
- **[AVOCAT]** : mandat + lettres J0-J50 sont des **brouillons placeholder** — à remplacer par
  le copy-deck validé avant toute prod. Barème 25 % = placeholder verrouillé.
- **[AVOCAT]** : effet d'une baisse de loyer sur le plafond IRL (moteur) — à valider.
- Emails = outbox (table `outbox_emails`) ; LRE + paiements = mock derrière ports.

## Durcissement différé (revue adversariale — à planifier)

Corrigés dans ce push : erreurs d'insert/état incohérent, idempotence (claim + transitions
atomiques anti double-validation/paiement), garde-fou `recovery_state` atomique, en-têtes
sécurité pièces, `timingSafeEqual` cron, vérif HMAC de signature, `access_logs` admin.

Restent (défense en profondeur, non bloquants pour la démo) :
- **Hashage du `session_token`** en base (actuellement en clair ; risque seulement en cas de
  compromission BD — le cookie est httpOnly/secure). Hasher avant stockage + à la comparaison.
- **Versioning/rotation des clés** `PIECES_ENCRYPTION_KEY` / `SIGNATURE_SECRET` (colonne
  `key_version` + multi-clés) pour permettre une rotation sans re-chiffrer l'historique.
- **Atomicité multi-tables stricte** via fonctions RPC Postgres (les écritures sont déjà
  error-checkées + protégées par un claim atomique, mais le tout-ou-rien complet exige une
  transaction serveur).
