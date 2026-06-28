# Lancement léger — mode WAITLIST

**Date** : 2026-06-26
**Décision cadre** : lancer en **waitlist** (`MANDATE_ENABLED=false`) — public + diagnostic +
verdict + **collecte d'emails**, signature mandat DÉSACTIVÉE le temps de border le juridique
(société + RC pro R124 + mandat validé avocat = chantier parallèle, non bloquant pour ce live).
**Source** : audit multi-agents (8 agents) + critique adversariale, 2026-06-26.
Spec de référence : `docs/superpowers/specs/2026-06-20-finalisation-pre-live-design.md`.

---

## 1. Réalité du parcours waitlist (vérifiée dans le code)

- **Capture email = ANONYME**, après le verdict, sur `/diagnostic/[verdictId]`
  (`RecapCaptureModule` → `submitLead` → table `leads`). **Aucun login requis.**
  Rate-limit + consentement séparé téléphone + version de consentement tracée. ✅
- L'écran « liste d'attente » de `/mandat/[dossierId]` (branche `!MANDATE_ENABLED`)
  **exige un login** (`requireAuthPage`). Il n'est donc PAS le point d'entrée du lead.
- **Conséquence clé** : `/admin/funnel` construit sa file « à recontacter » à partir des
  events `waitlist_rejointe`, **émis uniquement sur `/mandat` (login-gated)**. Les captures
  anonymes (`leads` / event `email_capture`) ne remontent que dans un **compteur**, pas dans
  la **liste actionnable**. → à corriger, sinon les leads collectés sont invisibles.
- En waitlist, le client n'atteint jamais `PayoutForm` (mandat désactivé) → le retrait
  Versement/IBAN devient de l'**hygiène**, pas un bloquant.

## 2. Gates côté Lyes (non-code, à lever avant ouverture)

| # | Gate | Pourquoi | Owner |
|---|------|----------|-------|
| G1 | `MANDATE_ENABLED=false` confirmé en prod | Verrou juridique : pas de mandat signé tant que société+RC pro+avocat absents | Lyes |
| G2 | **Valider la copy de consentement/collecte** du `RecapCaptureModule` (aujourd'hui `TODO_COPY [AVOCAT]` brouillon) | On collecte de la PII (email/tél) : le texte de consentement RGPD ne peut pas rester un brouillon non validé | Lyes / avocat |
| G3 | Confirmer que la prod = **projet Supabase neuf** (pas un clone de dev) | Si neuf, aucun compte de test n'y existe → pas de purge nécessaire | Lyes |
| G-opt | (optionnel) SMTP Brevo + template `{{ .Token }}` + SPF/DKIM + Redirect URLs | Débloque le **login client / espace**. Inutile pour une waitlist pure (capture anonyme), recommandé si on veut exposer l'espace | Lyes |

> ⚠️ Le login client attend un **code à 6 chiffres** (`{{ .Token }}`, `supabase/templates/magic_link.html`).
> Sans ce template collé dans Supabase Auth cloud, le login est cassé **même avec le SMTP branché**.
> Tant que G-opt n'est pas fait : ne PAS exposer de CTA dépendant du login (sinon parcours mort).

## 3. Phases de code

### P1 — Rendre la waitlist exploitable (le cœur)
**But** : tout visiteur avec verdict peut laisser son email SANS login, et l'admin voit/recontacte
TOUS ces leads.
- Surfacer les leads anonymes (`leads` / `email_capture`) dans `/admin/funnel` comme file de
  recontact actionnable (email, tél, adresse, date) — pas seulement `waitlist_rejointe`.
- Aligner la promesse « M'envoyer le récap » sur la réalité : soit (a) brancher Brevo pour
  envoyer vraiment, soit **(b, reco) reformuler en « on vous recontacte »** (zéro dépendance).
- Skill : `interface-design` (file admin) · `code-review`.
- **DoD** : un visiteur laisse son email sans compte → il apparaît dans la file admin avec email ;
  la copy ne promet rien qu'on ne tient pas ; `typecheck` vert.

### P2 — Sécurité & RGPD du live
**But** : ouvrir à de vrais utilisateurs sans risque évident.
- Vérifier en **build prod** (`NODE_ENV=production`) que `DevLoginButtons` + `dev-actions` sont inertes ;
  durcir la garde serveur si elle ne tient qu'au rendu.
- **RGPD** : remplacer le stub menteur de `/espace/compte` (« fonctionnalité en cours ») par un
  canal honnête (mailto `privacy@…`) OU wirer l'action serveur de suppression (la cascade DB existe).
  Prévoir une procédure de suppression des `leads` sur demande.
- Confirmer `MANDATE_ENABLED=false` dans l'env de prod ; neutraliser tout CTA login si G-opt non fait.
- Skill : `verify` · `security-review`.
- **DoD** : aucun bouton démo en prod ; aucune promesse RGPD non tenue ; flag waitlist confirmé.

### P3 — Hygiène : retirer la surface Versement/IBAN visible (client)
**But** : plus de code mort ni d'onglet Versement (l'argent ne transite jamais par TropPayé).
- Supprimer : page `espace/[dossierId]/versement`, onglet `versement` (layout.tsx), `PayoutForm`
  (espace + mandat), `PayoutTracker`, action `savePayoutDetails`, `getPayoutView` orphelin.
  Conserver `maskIban`/`netAfterFee` (réutiles pour Stripe plus tard), retirer `payoutStage`.
- **NE PAS toucher** la table `payout_details` ni `recordPayment` (admin-only, post-live) :
  sinon risque de casser l'encaissement. UI client seulement.
- Adapter e2e : supprimer `espace-versement.spec.ts`, retirer l'assertion onglet dans
  `espace-apercu.spec.ts`, rediriger le deny-all RLS de `rls-isolation.spec.ts` vers `mandate.pdf_url`.
- Skill : `code-review` · `qa-test-planner`.
- **DoD** : `grep PayoutForm/savePayoutDetails` = 0 côté espace/mandat ; `typecheck` + e2e verts.

### P4 — Filet de tests minimal du live waitlist
**But** : le parcours qui rapporte est couvert.
- e2e : diagnostic → verdict → **capture email anonyme** → lead visible dans l'admin.
- Run complet `typecheck` + `vitest` + e2e cloud verts.
- Skill : `qa-test-planner` · `verify`.
- **DoD** : parcours waitlist couvert e2e ; suite verte après les retraits de P3.

## 4. Reporté (passage « opérationnel » plus tard)
- SMTP Brevo + template `{{ .Token }}` + SPF/DKIM + Redirect URLs (dès qu'on veut le login/espace).
- `MANDATE_ENABLED=true` (après société + RC pro + mandat avocat).
- Facturation Stripe 25 % (colonnes commission, `markRecovered`, Payment Link, webhook).
- Moteur email amiable Brevo (`landlord_emails`, adresse dédiée, cadence J0/J21/J35/J50, inbound).
- `recordPayment` v2 + migration drop `payout_details` + retrait OUT_TENANT (revue `ultracode`).
- Confort ops (`landlord_phone`, action `PHONE_CALL`, recherche/filtre dossiers).
- Cohérence `.nb` du `ProfileForm` (cosmétique).

## 5. Ordre & première action
1. **G2** (copy consentement validée) — c'est le seul vrai prérequis légal de la waitlist.
2. **P1** (file de recontact admin) — sans elle, la waitlist ne sert à rien.
3. P2 (sécu/RGPD) → P3 (hygiène Versement) → P4 (tests).

**Première action code recommandée** : **P1** — surfacer les leads anonymes dans `/admin/funnel`
+ aligner la copy « récap ». Effort `Max`.
