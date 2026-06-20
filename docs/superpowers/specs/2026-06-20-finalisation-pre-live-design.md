# Finalisation pré-live TropPayé — Design & plan exhaustif

**Date** : 2026-06-20
**Statut** : design validé en session de cadrage (grilling) — à transformer en plan d'implémentation.
**Contexte** : la DA « quittance » (Tranche 0 : chrome espace/admin + primitives) est posée.
Cette spec fige le **modèle métier réel** (clarifié en session) et liste **tout ce qui doit
fonctionner et être testé avant un premier live**.

---

## 1. Modèle métier verrouillé (corrige le code existant)

> Décisions prises par Lyes le 2026-06-20.

1. **L'argent ne transite JAMAIS par TropPayé.** Le bailleur rembourse le locataire en direct.
2. **Commission = 25 % du montant CONVENU** (saisi par l'admin), facturée au client via **lien Stripe**.
3. **L'admin acte seul** le « dossier gagné » et déclenche la facturation.
4. **Phase amiable par email, au nom du client**, depuis une **adresse dédiée par dossier**
   (domaine neutre, TropPayé discret). On ne touche jamais la vraie boîte du client.
5. **Cadence J0/J21/J35/J50 = emails amiables** (plus de LRE par défaut). **+ étape téléphone**
   (appel loggué par l'admin). La **LRE reste manuelle**, réservée à l'escalade formelle.

### Conséquence directe : code à RETIRER / RÉÉCRIRE
- **Supprimer le volet IBAN / reversement au locataire** : `payout_details`, `PayoutForm`,
  `savePayoutDetails`, mouvements `fund_movements` de type `OUT_TENANT`. Inutiles : l'argent ne
  passe pas par nous.
- **Réécrire `recordPayment()`** : ce n'est plus « encaisser puis splitter », c'est
  « constater le remboursement → facturer notre commission via Stripe → encaisser notre 25 % ».

---

## 2. Parcours cible (de bout en bout)

```
Diagnostic (verdict) ─► Signature mandat (eIDAS maison) ─► Phase AMIABLE
   │                                                          │
   │   Admin pilote depuis la fiche dossier :                 │
   │   • J0   email au bailleur (au nom du client)            │
   │   • J21  relance email                                   │
   │   • Jxx  APPEL téléphone (loggué à la main)              │
   │   • J35  relance email                                   │
   │   • J50  mise en demeure email                           │
   │   • (escalade) LRE manuelle / orientation judiciaire     │
   ▼                                                          ▼
Bailleur rembourse le locataire en direct ──► Admin saisit « remboursé X € »
   ▼
Lien Stripe (25 % de X) envoyé au client ──► Client paie ──► Dossier WON
   │
   └─ si impayé : relances automatiques (outbox)
```

---

## 3. Lots de travail (workstreams)

### A. Moteur email amiable (le gros morceau)
- **Adresse dédiée par dossier** : `dossier-<ref>@<domaine-neutre>`, nom affiché = « Prénom Nom » du client.
- **Envoi** via Brevo (templates **[AVOCAT]**), enregistré comme message sortant.
- **Réception** : webhook **inbound Brevo** → route par l'adresse destinataire → rattache la réponse
  du bailleur au bon dossier → l'affiche dans un **fil email côté admin**.
- **Fil email admin** : timeline IN/OUT (bailleur ↔ nous-au-nom-du-client), distinct de la
  messagerie client↔TropPayé.
- Tables : `landlord_emails` (id, dossier_id, direction IN|OUT, from_addr, to_addr, subject, body,
  message_id, in_reply_to, status, created_at). Adresse dérivée du dossier (pas de secret stocké).

### B. Messagerie admin ↔ client (libre) — *trou signalé par Lyes*
- Ajouter une **zone de réponse libre** dans `AdminActions` + action `sendAdminMessage(dossierId, body)`
  (insère `messages.sender = 'operator'`). Aujourd'hui l'admin ne peut que *demander une pièce* ou
  *refuser* — il ne peut PAS répondre.
- Le client voit la réponse dans `app/espace/[dossierId]/messages` (déjà en place).

### C. Fiche client visible côté admin — *trou de parité*
- Charger `profiles.{first_name, last_name, phone}` + email dans `getDossierAdmin()` et les afficher
  sur `app/admin/dossiers/[id]`. Aujourd'hui l'admin ne voit ni nom ni téléphone.
- Capter aussi le **téléphone du bailleur** (pour l'étape appel) — champ sur le dossier.

### D. Facturation Stripe (commission 25 %)
- Action admin `markRecovered(dossierId, amountCents)` :
  - écrit `dossiers.agreed_total_cents` + `recovered_confirmed_at`,
  - calcule `commission_cents = round(amount * 0.25)`,
  - crée un **Stripe Payment Link / Checkout**, stocke `stripe_session_id` + `url`,
  - **queue un email** au client avec le lien.
- **Webhook Stripe** `/api/stripe/webhook` : sur paiement réussi → `commission_status = PAID`,
  dossier → `WON`, log.
- **Relance impayé** : si non payé sous N jours → relances via outbox (réutilise `actions`/cron).
- Page client de confirmation de paiement (succès / échec).
- Tables : champs commission sur `dossiers` (`commission_cents`, `commission_status`
  PENDING|LINK_SENT|PAID|OVERDUE, `stripe_session_id`, `stripe_paid_at`).

### E. Emails réellement envoyés
- Brancher `EMAIL_PROVIDER=brevo` + clé. **Aujourd'hui `flushOutbox()` skip → rien ne part.**
- Vérifier le cycle complet : mandat signé, pièces reçues, courrier/relance, lien Stripe, reçu de paiement.

### F. Recherche / filtre dossiers admin
- Champ recherche (adresse, email, nom) + filtre par statut / `recovery_state` sur `/admin` et `/admin/pipeline`.

### G. Refonte DA « quittance » (Tranches 1-2 déjà planifiées)
- Espace client puis admin en cartes-reçus nb. Réf. `docs/refonte-da-quittance-espace-admin.md`.
- **Adapter** : retirer du parcours les écrans IBAN/versement (obsolètes), ajouter l'écran
  « facture / payer ma commission » côté client.

### H. Étape téléphone dans la séquence
- Nouveau type d'action `PHONE_CALL` (canal `PHONE`), **loggué manuellement** par l'admin :
  interlocuteur, date, issue, prochaine étape. Visible dans la timeline du dossier.
- Ajouter un champ `channel` (EMAIL|LRE|PHONE) sur `actions` pour distinguer les canaux.

---

## 4. Modèle de données — deltas

| Table | Changement |
|-------|-----------|
| `dossiers` | + `commission_cents`, `commission_status`, `stripe_session_id`, `stripe_paid_at`, `recovered_confirmed_at`, `landlord_phone`. (`agreed_total_cents` existe déjà.) |
| `actions` | + `channel` (EMAIL\|LRE\|PHONE) ; nouveau type `PHONE_CALL` ; les J0-J50 deviennent canal EMAIL. |
| `landlord_emails` | **NOUVELLE** : fil email amiable (IN/OUT) par dossier. |
| `messages` | inchangée ; l'admin écrit désormais `sender='operator'` en texte libre. |
| `payout_details` | **SUPPRIMÉE** (IBAN client inutile). Migration de retrait + purge chiffrée. |
| `fund_movements` | **DÉPRÉCIÉE** pour OUT_TENANT ; ne garder qu'un log d'encaissement commission, ou remplacer par les champs commission sur `dossiers`. |
| `profiles` | inchangée ; exposée à l'admin via service_role (lecture sur la fiche dossier). |

---

## 5. Clés & configuration à fournir

- **Stripe** : `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (facturation 25 %).
- **Brevo** : clé API **envoi** + **inbound** (réception réponses bailleur) + `EMAIL_PROVIDER=brevo`.
- **Domaine neutre** pour les adresses dédiées : DNS **SPF + DKIM + DMARC** (délivrabilité).
- **LRE** (AR24/Maileva) : *plus tard*, seulement si escalade automatisée. Manuel au premier live.
- Déjà OK : IGN, ADEME, INSEE, `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, clé de chiffrement.

---

## 6. Sécurité / RGPD (non négociable)

- **Jamais** d'accès à la boîte perso du client : uniquement l'adresse dédiée → le bailleur ne voit
  pas la vraie adresse du client, on ne lit pas son courrier.
- `landlord_emails` contient de la PII (bailleur) → RLS service_role only, rétention définie,
  suppression en cascade avec le dossier.
- **Stripe** : aucune donnée carte stockée (PCI délégué à Stripe).
- Login démo 1 clic : bridé `NODE_ENV !== production` (double garde) — comptes de test à **purger**
  avant clone client (`client@troppaye.test`, `admin@troppaye.test`, `rls-a/b`, dossiers de démo).
- Pas de log de PII ; pièces et identités chiffrées.

---

## 7. Points juridiques [AVOCAT] à border avant live

- **Mandat** : doit couvrir explicitement la **représentation amiable par email au nom du client**.
- **Contenu des emails amiables** (J0-J50, mise en demeure) : templates validés avocat, mot pour mot.
- **Facture de commission** : mentions légales conformes (TVA / franchise, SIREN, etc.).
- **Opposabilité de la signature maison** (eIDAS « simple »).
- **Valeurs réglementaires** encore en `TODO_VERIFIER` (gel F/G, bouclier 3,5 %).

---

## 8. CHECKLIST DE TESTS PRÉ-LIVE (exhaustive)

> À repasser en **vert** avant tout client réel. e2e existants = 20 verts en cloud (à étendre).

### 8.1 Auth & accès
- [ ] Connexion client par code email (SMTP réel) — un mail arrive.
- [ ] Connexion admin ; non-admin → redirigé (rôle vérifié en base).
- [ ] Login démo 1 clic invisible & inopérant si `NODE_ENV=production`.
- [ ] Déconnexion ; session expirée → redirection login.

### 8.2 Tunnel diagnostic (non-régression DA)
- [ ] Parcours complet jusqu'au verdict (4 états) — identique à avant.
- [ ] Primitives partagées (Field/Button/QuittanceCard) inchangées hors scope `.nb`.

### 8.3 Espace client
- [ ] Liste dossiers, ouverture d'un dossier, onglets (Aperçu/Pièces/Mandat/Messages/Facture).
- [ ] Upload de pièces (chiffré), statut, types acceptés.
- [ ] Signature mandat → transition d'état + preuve scellée.
- [ ] Messagerie : le client envoie, reçoit une réponse **admin libre**.
- [ ] Profil : édition nom/prénom/téléphone, préférence emails.
- [ ] **Plus d'écran IBAN/versement** (retiré).
- [ ] Écran « payer ma commission » : ouvre le lien Stripe, paie, voit le reçu.

### 8.4 Back-office admin
- [ ] Fiche dossier affiche **nom + prénom + téléphone + email** du client.
- [ ] Téléphone du bailleur saisi/visible.
- [ ] **Répondre librement** au client (message operator) → reçu côté client.
- [ ] Voir & télécharger les pièces ; vérifier intégrité signature (HMAC ✓/✗).
- [ ] Recherche/filtre dossiers (adresse, nom, statut).
- [ ] Transitions de statut (validation, refus, pause, escalade).

### 8.5 Moteur email amiable
- [ ] Envoi J0 au bailleur depuis l'adresse dédiée (nom du client affiché, TropPayé discret).
- [ ] **Réponse du bailleur ingérée** (webhook inbound) et affichée dans le fil admin du bon dossier.
- [ ] Relances J21/J35/J50 partent et sont tracées.
- [ ] Étape **téléphone** : l'admin loggue un appel (interlocuteur, issue) → visible en timeline.
- [ ] Cadence pilotée par `actions`/cron (canal EMAIL), idempotente.

### 8.6 Facturation Stripe (25 %)
- [ ] `markRecovered(X)` → commission = 25 % de X, lien Stripe créé, email envoyé au client.
- [ ] Paiement Stripe réussi → **webhook** → dossier `WON`, `commission_status=PAID`.
- [ ] Paiement échoué/abandonné → dossier reste en attente, relançable.
- [ ] **Impayé** : relances automatiques après N jours.
- [ ] Montants en centimes, cohérents, affichés en vert (faveur locataire) / mono tabular.

### 8.7 Emails (outbox réel)
- [ ] `EMAIL_PROVIDER=brevo` + clé → `flushOutbox()` envoie vraiment.
- [ ] Chaque événement clé déclenche le bon email (mandat, pièces, relance, lien Stripe, reçu).
- [ ] Respect de la préférence `email_notifications`.

### 8.8 Sécurité / RLS / IDOR
- [ ] Un client ne peut pas lire/écrire le dossier d'un autre (RLS, tests existants).
- [ ] `landlord_emails` inaccessible au client.
- [ ] Webhooks (Stripe, Brevo inbound, cron) protégés (signature/secret, timing-safe).
- [ ] Aucune PII en clair dans les logs.

### 8.9 RGPD
- [ ] Suppression de compte → cascade (dossiers, pièces, emails, preuves) effective.
- [ ] Purge des comptes/données de démo avant clone client.

### 8.10 DA, accessibilité, perf
- [ ] Espace + admin en DA quittance cohérente (Tranches 1-2 terminées).
- [ ] `prefers-reduced-motion` respecté, focus visibles, contrastes AA.
- [ ] Pas de régression Lighthouse (cf. pièges connus).

---

## 9. Hors scope V1 (assumé)
- Délégation OAuth Gmail/Outlook (vraie adresse du client) → après le premier live.
- LRE automatisée (prestataire branché).
- Orientation judiciaire automatisée / chiffrée (reste manuelle, jamais auto).

---

## 10. Ordre d'exécution proposé (tranches verticales)

1. **C + B** (fiche client admin + messagerie admin libre) — petits, débloquent l'opérationnel, faible risque.
2. **D + Stripe** (facturation 25 %) — cœur business, testable de bout en bout.
3. **A + H** (moteur email amiable + étape téléphone) — le plus lourd (inbound), à isoler.
4. **E** (brancher emails réels) — transverse, à valider après A/D.
5. **Nettoyage** : retrait IBAN/payout, réécriture `recordPayment`.
6. **F** (recherche admin) + **G** (DA Tranches 1-2).

Chaque tranche : `pnpm typecheck` + `pnpm test` verts, les **20 e2e** non cassés, puis extension de la
suite e2e pour la nouvelle surface.
