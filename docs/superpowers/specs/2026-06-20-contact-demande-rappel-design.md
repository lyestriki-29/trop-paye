# Contact — Demande de rappel — Design

**Date** : 2026-06-20
**Statut** : design validé en session de cadrage (Lyes).
**Contexte** : la `ContactDialog` de l'espace client est aujourd'hui un placeholder
(« Un vrai agenda intégré arrive bientôt »), avec un squelette de boutons WhatsApp /
Cal.com gatés sur des variables d'env non posées. L'espace a déjà une messagerie async
fonctionnelle. On remplace le placeholder par une **demande de rappel native**, cohérente
avec l'étape téléphone du modèle amiable (cf. [[troppaye-modele-prelive]]).

---

## 1. Décisions verrouillées

1. **Demande de rappel native** (pas de booking externe Cal.com).
2. **File dédiée côté admin** (« Rappels à passer ») + **email de notification** à
   `contact@troppaye.fr` (adresse à créer par Lyes).
3. **Créneau préféré** = 4 choix simples : *Dès que possible / Matin / Après-midi / Soir*.
4. On **garde le bouton WhatsApp** (env-gated, voie rapide optionnelle). On **retire** le
   bouton Cal.com (remplacé par le formulaire natif).

> ⚠️ **Email** : `EMAIL_PROVIDER=outbox` aujourd'hui → l'email à `contact@troppaye.fr` est
> **mis en file (outbox)** mais réellement envoyé seulement une fois Brevo branché. La notif
> est codée maintenant (prête), sa livraison réelle suit la tranche « emails réels ».

---

## 2. Modèle de données

Nouvelle table **`callback_requests`** :

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `dossier_id` | uuid NOT NULL | FK `dossiers(id)` **ON DELETE CASCADE** |
| `phone` | text NOT NULL | numéro à rappeler (prérempli du profil, éditable) |
| `subject` | text NOT NULL | sujet court |
| `preferred_slot` | text NOT NULL | `ASAP` \| `MORNING` \| `AFTERNOON` \| `EVENING` (CHECK) |
| `status` | text NOT NULL DEFAULT `'PENDING'` | `PENDING` \| `DONE` (CHECK) |
| `created_at` | timestamptz NOT NULL DEFAULT now() | |
| `handled_at` | timestamptz NULL | posé au passage en `DONE` |

Index : `idx_callback_requests_dossier` sur `dossier_id` ; index partiel sur
`status = 'PENDING'` pour la file admin.

**RLS** (dans la même migration `0009`, style des migrations récentes qui regroupent
table + RLS) :
- `callback_select_own` : `select` to authenticated `using (owns_dossier(dossier_id))`.
- `callback_insert_own` : `insert` to authenticated `with check (owns_dossier(dossier_id))`.
- Pas de policy update/delete client → l'admin gère via service_role.

---

## 3. Côté client (espace)

`components/espace/ContactDialog.tsx` : le placeholder devient un **formulaire de rappel**.

- Champs : **Sujet** (`Field`), **Créneau préféré** (4 boutons/segments), **Téléphone**
  (`Field`, prérempli depuis `profiles.phone`, éditable, requis).
- Bouton **« Demander à être rappelé »** → Server Action `requestCallback`.
- À la réussite : confirmation « Nous vous rappelons au {phone}. » + reset.
- Le **bouton WhatsApp** (env `NEXT_PUBLIC_WHATSAPP`) reste rendu en bas si la variable est
  posée. Le bouton Cal.com est retiré.
- Le composant reçoit `dossierId` et le `phone` initial en props (le `[dossierId]/layout`
  les transmet — le téléphone vient de `profiles`, déjà chargé ou à charger dans le layout).

**Server Action** `app/espace/[dossierId]/actions.ts:requestCallback` :
- `withAuth` + ownership (mécanique existante des actions de l'espace).
- Validation zod : `subject` (1..200), `preferred_slot` ∈ enum, `phone` (format FR souple, non vide).
- Insère la ligne `callback_requests` (status `PENDING`).
- **Queue un email** à `CONTACT_EMAIL` via `queueEmail({ dossierId, toEmail: CONTACT_EMAIL, subject, body, template: "callback_request" })` (outbox).
- Retourne `{ ok: true }` | `{ error }`.

---

## 4. Côté admin

Nouvelle page **`app/admin/rappels/page.tsx`** (« Rappels à passer »), modelée sur
`/admin/courriers` :
- Liste des `callback_requests` `PENDING`, triées par `created_at` (les plus anciens d'abord).
- Par ligne : **téléphone** cliquable (`tel:`), **sujet**, **créneau** (libellé FR),
  **date**, lien vers la fiche dossier.
- Bouton **« Marquer rappelé »** → Server Action admin `markCallbackDone(id)` (`requireAdmin`,
  claim atomique sur `status='PENDING'`) → `status='DONE'`, `handled_at=now()`.
- Lien **« Rappels »** dans la nav admin (`app/admin/layout.tsx`) avec **compteur** des PENDING.

Lecture : `lib/admin/read.ts:listPendingCallbacks()` (service_role) + un `countPendingCallbacks()`
pour le badge de nav.

---

## 5. Configuration

- **`CONTACT_EMAIL`** : **constante** = `contact@troppaye.fr` (adresse publique, pas un secret),
  centralisée dans `lib/content/legal-entity.ts`.
- `NEXT_PUBLIC_WHATSAPP` : inchangé (bouton optionnel).

---

## 6. Sécurité / RGPD

- Le **téléphone** est une PII → jamais loggé ; stocké en clair dans `callback_requests`
  (nécessaire pour rappeler), couvert par la RLS + suppression en cascade avec le dossier.
- RLS stricte : un client ne lit/insère QUE les rappels de SES dossiers (`owns_dossier`).
- L'admin lit tout via service_role uniquement (jamais exposé au navigateur).
- Email à `contact@troppaye.fr` : contient le sujet + le dossier, pas plus que nécessaire.

---

## 7. Tests

- **Unitaire (vitest)** : validation zod de `requestCallback` (sujet vide, slot invalide,
  téléphone vide → erreurs ; cas nominal → ok). Pur, sans I/O (extraire le validateur).
- **e2e (Playwright, cloud opt-in)** : client ouvre Contact → remplit → envoie → un
  `callback_requests` PENDING existe (vérité base) ; admin voit la ligne sur `/admin/rappels`
  et peut « Marquer rappelé » → `DONE`.
- **RLS** : étendre `rls-isolation.spec.ts` — un client B ne lit pas le rappel d'un client A.

---

## 8. Hors scope (YAGNI)

- Pas de prise de RDV calendaire (Cal.com) ni de créneaux horaires précis.
- Pas de relance automatique si le rappel n'est pas traité (la file suffit au premier live).
- Pas de lien automatique vers une action `PHONE_CALL` du dossier (l'étape téléphone de la
  séquence reste la Tranche H ; le rappel peut y être relié plus tard).
- Pas d'envoi réel de l'email tant que Brevo n'est pas branché (outbox).

---

## 9. Fichiers concernés

- **Migration** : `supabase/migrations/0009_callback_requests.sql` (table + index + RLS,
  fichier unique — prochain numéro après `0008_seed_referentiels.sql`).
- **Client** : `components/espace/ContactDialog.tsx` (réécrit),
  `app/espace/[dossierId]/actions.ts` (+ `requestCallback`),
  `app/espace/[dossierId]/layout.tsx` (passer `phone` + `dossierId` à ContactDialog).
- **Admin** : `app/admin/rappels/page.tsx` (nouveau), `app/admin/rappels/actions.ts` ou
  ajout dans `app/admin/actions.ts` (`markCallbackDone`), `app/admin/layout.tsx` (lien + compteur),
  `lib/admin/read.ts` (`listPendingCallbacks`, `countPendingCallbacks`).
- **Config** : `CONTACT_EMAIL`.
- **Types** : régénérer `lib/supabase/database.types.ts` après la migration.
