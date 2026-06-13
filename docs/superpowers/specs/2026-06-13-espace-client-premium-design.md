# Espace client TropPayé — refonte premium « centre de gestion »

Date : 2026-06-13
Statut : validé en cadrage (maquettes approuvées), à transformer en plan d'implémentation.

## 1. Objectif

Transformer l'espace client (`/espace`) — aujourd'hui minimaliste (liste + page
dossier basique) — en un **centre de gestion premium** où le locataire suit ET
pilote tout son dossier, dans la DA « dossier d'instruction » de TropPayé
(papier, montants en mono `tabular-nums`, vert `refund`, tampons, fourchette
proéminente, `prefers-reduced-motion` respecté).

**Non-objectifs** : refonte du back-office `/admin` ; refonte du moteur de règles
(inchangé) ; tout texte juridique définitif (les libellés restent brouillon
`TODO_COPY`, `[AVOCAT]` non validé reste hors prod).

## 2. Périmètre (11 modules, validés)

1. Vue d'accueil multi-dossiers (KPIs agrégés + liste) — affichée seulement si ≥2 dossiers ; sinon entrée directe dans le dossier.
2. Onglet **Aperçu** : carte verdict (fourchette + calcul détaillé + confiance), strip KPI, timeline, rail collant.
3. **Timeline** premium (étapes J0/J21/J35/J50, tampons).
4. Onglet **Pièces** : dépôt glisser-déposer (chiffré), statuts.
5. **Checklist d'étude** : bail + dernière quittance ⇒ étude lançable (DPE auto, ancienne quittance optionnelle).
6. Onglet **Mandat** : voir + signer (eIDAS simple maison), barème 25 %, PDF.
7. Onglet **Versement** : RIB (IBAN chiffré), montant net après commission, suivi Récupéré→Programmé→Versé.
8. Onglet **Messages** : fil avec l'équipe.
9. **Profil & RGPD** : coordonnées, préférence notifications, export, suppression en cascade.
10. **Notifications / activité** : flux d'événements (cloche).
11. **Prendre contact** : RDV en ligne + WhatsApp.

## 3. Architecture (option A — workspace dossier à onglets)

### Navigation & routes
- `/espace` : si ≥2 dossiers → vue d'accueil (KPIs agrégés + liste) ; si 1 seul → `redirect` vers son dossier ; si 0 → état vide + CTA diagnostic.
- `/espace/[dossierId]` : **workspace** à onglets. Onglet via segment :
  `/espace/[dossierId]` (Aperçu) · `…/pieces` · `…/mandat` · `…/messages` · `…/versement`.
  (Sous-routes plutôt que `?tab=` : meilleur SEO/back-button, chaque onglet est un Server Component isolé.)
- `/espace/compte` : profil & RGPD (hors dossier).
- Contact (RDV/WhatsApp) et Notifications = **overlays** déclenchés depuis le header (pas de route dédiée), donc disponibles partout.

### Shell (layout commun)
`app/espace/[dossierId]/layout.tsx` : header (logo, cloche+badge, boutons Contact, menu compte) + barre d'onglets (pastille = action requise / non-lu). Le `layout.tsx` racine de `/espace` garde l'auth (`requireAuthPage`).

### Découpage composants (chaque fichier une responsabilité, ≤ ~200 lignes)
- `components/espace/WorkspaceTabs.tsx` (client : nav onglets + pastilles)
- `components/espace/VerdictCard.tsx`, `KpiStrip.tsx`, `DossierTimeline.tsx`, `NextStepRail.tsx`, `StudyChecklist.tsx`
- `components/espace/PiecesDropzone.tsx` (client : drag&drop), `PieceRow.tsx`
- `components/espace/MandatePanel.tsx`, `PayoutForm.tsx`, `PayoutTracker.tsx`
- `components/espace/MessageThread.tsx` (réutilise l'existant `Messages.tsx`, relooké)
- `components/espace/ContactDialog.tsx` (RDV + WhatsApp), `NotificationsPanel.tsx`
- `app/espace/compte/*` (profil, RGPD)

## 4. Données (schéma EXISTANT, pas de big-bang DB)

| Module | Source | Écriture |
|---|---|---|
| Verdict / fourchette / calcul | `verdicts` (results, confidence, totals) | — (lecture) |
| Timeline | `actions` (type, scheduled_at, executed_at) + `dossiers.status/recovery_state` | — |
| Pièces | `pieces` (kind, status `RECEIVED/ILLEGIBLE/VALIDATED`) + Storage chiffré | upload action (réutilise l'upload chiffré de `/mandat`) |
| Checklist d'étude | dérivée de `pieces` (bail + quittance VALIDATED) | transition `MANDATE_PENDING → IN_REVIEW` (server action idempotente) |
| Mandat | `mandates` + `signature_proofs` | signature maison existante |
| Versement | `payout_details` (`iban_encrypted` AES-256 déjà en place) + `fund_movements` | upsert RIB chiffré |
| Messages | `messages` (sender `client/operator/system`) | insert (`sender='client'`, RLS `owns_dossier`) |
| Notifications/activité | **dérivée** de `actions` + `messages` + changements de `dossiers.status` (+ `outbox_emails`) | « marquer lu » différé (v2) |
| Profil/RGPD | `profiles` | maj coordonnées + **nouveau** `profiles.email_notifications boolean default true` ; export/délete via cascade existante |

**Seul ajout DB** : migration `profiles.email_notifications boolean` (+ éventuel `phone` si absent). Aucune autre table nouvelle pour la v1.

## 5. Logique « étude lançable » (gate)
Server action idempotente, déclenchée à la validation d'une pièce :
si `status='MANDATE_PENDING'` ET bail VALIDATED ET dernière quittance VALIDATED ⇒
`status='IN_REVIEW'` + `action` LETTER/REVIEW + notification. DPE non bloquant
(récupéré ADEME). Verrou par `dossier.id` (pas de double transition).

## 6. Sécurité / conformité
- Chaque page = `requireAuthPage` ; chaque server action = `withAuth` (session + ownership + zod). RLS `owns_dossier` sur toutes les tables (déjà en place).
- IBAN chiffré applicativement (`PIECES_ENCRYPTION_KEY`, jamais en clair côté client : afficher masqué `FR76 •••• 0117`).
- Aucun log de PII. Pièces chiffrées. Suppression compte = cascade (déjà existante).
- Montants en centimes, mono `tabular-nums`, `Europe/Paris`.

## 7. Décisions ouvertes (défauts recommandés, ajustables en revue)
- **RDV** : v1 = bouton **WhatsApp** (`wa.me/<num>`, n° en env `NEXT_PUBLIC_WHATSAPP`) + **Prendre RDV** ouvrant un **Cal.com** externe (URL en env). Un vrai calendrier maison (table `bookings`, créneaux) est plus lourd → **différé v2**. *(Reco : v1 lien externe.)*
- **Notifications** : v1 = flux dérivé (lecture), pas de table ni « marquer lu » persistant → **v2**.
- **Multi-dossiers** : la plupart des locataires ont 1 dossier ; la vue d'accueil agrégée est utile mais secondaire → livrée en dernier.

## 8. Gestion d'erreurs & états
États vides (0 dossier, 0 pièce, 0 message), chargement (skeletons sobres),
échec upload (type/poids), IBAN invalide (validation IBAN), pièce illisible
(`ILLEGIBLE` + message), action réseau échouée (toast + retry). Jamais de
plantage du login/onglet pour une dépendance secondaire (best-effort).

## 9. Tests
- Moteur inchangé (Vitest reste vert).
- Server actions : zod + ownership (tests unitaires), gate « étude lançable » (idempotence).
- E2E Playwright par tranche : upload pièce → checklist → passage IN_REVIEW ; envoi message ; saisie RIB ; signature mandat.
- RLS : un user ne voit/écrit pas le dossier d'un autre.

## 10. Livraison par phases (tranches verticales, chacune testable de bout en bout)
1. **Shell + Aperçu** (read-only premium) : layout onglets, VerdictCard+fourchette, KPIs, Timeline, NextStepRail, StudyChecklist (lecture). → gros gain visuel immédiat.
2. **Pièces** : dropzone chiffrée + statuts + gate « étude lançable ».
3. **Messages + Notifications** (flux dérivé).
4. **Mandat** (onglet) **+ Versement** (RIB chiffré + suivi).
5. **Compte/RGPD + Contact** (WhatsApp + RDV externe) + **vue multi-dossiers**.

Chaque phase : typecheck + tests verts + vérif visuelle avant la suivante.

## 11. DA / style (rappel)
Tokens charte v2 : ink `#2A2118`, paper `#FFFEFB/#FAF4EC`, refund `#0C8F63`,
stamp `#D64545`, accent `#FFD84D`, line `#EAE1D6`. Tailwind uniquement (pas de
CSS Modules). Montants `font-mono tabular`. Ombres « papier ». Réutiliser
`QuittanceCard`, `Stamp`, `Marker`, `Amount`, `Button`. `prefers-reduced-motion`
respecté partout.
