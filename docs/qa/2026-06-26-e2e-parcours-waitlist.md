# Plan de test E2E — Parcours waitlist (arrivée → diagnostic → email → réception admin)

**Date** : 2026-06-26
**Contexte** : lancement léger **waitlist** (`MANDATE_ENABLED=false`). Capture email **anonyme**
(table `leads`), **aucun email auto** envoyé (Brevo en outbox). L'admin reçoit les leads dans
`/admin/funnel`. Plan de lancement : `docs/superpowers/plans/2026-06-26-lancement-leger-waitlist.md`.

---

## 1. Résumé & portée

**Objectif** : prouver qu'un visiteur réel peut arriver, faire un diagnostic jusqu'au verdict,
laisser ses coordonnées, et que ce contact remonte côté admin avec les **informations importantes**.

**Dans le scope**
- Arrivée site public → tunnel diagnostic → verdict (4 états).
- Capture email/téléphone post-verdict (anonyme, table `leads`) + consentement.
- Réception côté admin : `/admin/funnel` (file « Leads capturés ») + fiche dossier `/admin/dossiers/[id]`.
- Cas négatifs/limites de la capture (validation, consentement, rate-limit, propriété de session).

**Étendu au parcours complet (choix 2026-06-26)** — couverts en **§9**, mais **gated** :
- Espace authentifié, signature mandat, upload pièces → login (SMTP+template `{{ .Token }}`) + `MANDATE_ENABLED=true`.

**Hors scope (tout court)**
- Facturation Stripe, moteur email amiable (J0/J21/J35/J50), LRE.
- Envoi réel d'emails de **notification** (Brevo non branché → outbox) ; ≠ email de **connexion** (cas B, cf. §2).

## 2. L'étape « réception du mail » — 3 sous-cas (à trancher)

> Point critique : en waitlist, **aucun email n'est envoyé au visiteur** par la capture.

| Cas | Email concerné | Testable maintenant ? | Quoi tester |
|---|---|---|---|
| **A — Waitlist (défaut)** | Aucun | ✅ Oui | La capture crée un `lead` + event `email_capture` ; le contact apparaît dans `/admin/funnel`. **Pas d'assertion sur une boîte mail.** |
| **B — Code de connexion** | Magic-link Supabase (code 6 chiffres) | ⚠️ Gated | Nécessite SMTP Brevo + template `{{ .Token }}` + SPF/DKIM (gate G-opt). À tester seulement si on expose le login/espace. Le code arrive → saisie sur `/login` → session. |
| **C — Récap / notif** | Email transactionnel (Brevo) | ❌ Non (différé) | `flushOutbox()` skip tant que `EMAIL_PROVIDER=brevo` absent. Quand branché : asserter l'entrée outbox puis l'email reçu. |

**Choix retenu (2026-06-26) : parcours COMPLET jusqu'à l'espace** → email = **cas B** (code de
connexion). Le **§4** reste la base waitlist (cas A, testable tout de suite, sans email) ; le **§9**
étend au parcours authentifié complet (login par code → espace → mandat/pièces → réception admin
complète), avec son **gating** (SMTP+template pour l'email réel, `MANDATE_ENABLED=true` pour mandat/pièces).

## 3. Environnement & données de test

- **Cibles** : desktop (Chrome) + **webview mobile réelle** (iOS Safari + Android Chrome, via TikTok/Insta) — la majorité du trafic viendra de là.
- **Backend** : Supabase. e2e garde-fou : refuse une URL non-locale sauf `E2E_ALLOW_NONLOCAL_URL=<url exacte>`.
- **Flag** : `MANDATE_ENABLED=false`.
- **Adresse de test** (autocomplete IGN réel) : `6 rue du Bac, Paris`.
- **Jeu de données « trop-perçu positif »** : DPE inconnu, construction « Avant 1946 », non meublé,
  2 pièces, hors charges, loyer actuel **1500**, loyer de départ **1200**, bail **2020-01**,
  clause d'indexation **Oui / T1**. → verdict avec montant récupérable > 0.
- **Email marqueur jetable** : `e2e-waitlist+<timestamp>@troppaye.test` (minuscule : `leadSchema` normalise).
- **Compte admin** : profil `role = 'admin'` (magic-link service-role en setup).
- **Nettoyage** : supprimer le `lead` (par email marqueur) puis le `dossier` rattaché en fin de test.

## 4. Parcours principal (happy path)

### TC-E2E-001 — Visiteur anonyme : arrivée → verdict → capture → lead admin
**Priorité** : P0 · **Type** : E2E fonctionnel · **Auto** : `apps/web/e2e/waitlist-lead.spec.ts`

**Préconditions** : `MANDATE_ENABLED=false` ; storageState vide (visiteur non connecté) ; compte admin prêt.

**Étapes**
1. Aller sur `/diagnostic` (entrée tunnel).
   **Attendu** : le tunnel s'affiche, champ adresse visible.
2. Saisir l'adresse `6 rue du Bac, Paris`, choisir la 1ʳᵉ suggestion IGN.
   **Attendu** : adresse résolue, passage à l'étape logement.
3. Renseigner le logement : DPE « Je ne le connais pas », « Avant 1946 », « Non meublé », 2 pièces, pas de colocation.
   **Attendu** : chaque étape avance sans erreur.
4. Renseigner le loyer : « Hors charges », actuel `1500`, départ `1200`, dépôt facultatif, pas de complément.
   **Attendu** : champs acceptés, avance vers le bail.
5. Renseigner le bail : début `2020-01`, clause d'indexation « Oui » / « T1 », passer l'historique.
   **Attendu** : arrivée sur le récap.
6. Cliquer « Voir mon résultat ».
   **Attendu** : redirection vers `/diagnostic/<uuid>` (page verdict) ; **event funnel `verdict_affiche`**.
7. Sur la page verdict, vérifier le bloc résultat.
   **Attendu** : montant trop-perçu affiché (vert `refund`, mono `tabular-nums`), règle/base légale,
   score de confiance (HIGH|MEDIUM|LOW) ; module de capture présent.
8. Dans le module de capture : saisir l'email marqueur, cliquer « Être recontacté ».
   **Attendu** : la page se rafraîchit, le module **disparaît** (lead unique posé), pas d'erreur.
9. **(Base)** Vérifier la présence du `lead` : `select dossier_id from leads where email = <marqueur>`.
   **Attendu** : 1 ligne, `dossier_id` non nul, créée **sans connexion** ; event `email_capture`.
10. Se connecter en admin, aller sur `/admin/funnel`.
    **Attendu** : section **« Leads capturés : à recontacter »** visible ; l'email marqueur **et**
    l'adresse « rue du Bac » présents dans la file ; compteur « Emails capturés » incrémenté.
11. Cliquer l'adresse → fiche `/admin/dossiers/<id>`.
    **Attendu** : la fiche s'ouvre (cf. checklist §6).

**Post-conditions** : supprimer lead + dossier de test.

## 5. Cas additionnels (capture)

| ID | Cas | Priorité | Attendu |
|---|---|---|---|
| TC-CAP-002 | Email invalide (`abc`, vide, sans `@`) | P1 | Erreur de validation, pas d'insertion `leads`. |
| TC-CAP-003 | Téléphone saisi **sans** cocher le consentement | P1 | Bloqué : message « consentement téléphone requis », pas d'insertion. |
| TC-CAP-004 | Téléphone + consentement coché | P2 | Lead inséré avec `phone` + `consent_text_version` tracée. |
| TC-CAP-005 | Re-soumission (même dossier, email corrigé) | P2 | **Upsert** : 1 seule ligne `leads` (onConflict dossier_id), pas de doublon. |
| TC-CAP-006 | Rate-limit : > 5 tentatives / session (ou > 20 / IP) | P2 | Message « trop de tentatives », pas d'insertion supplémentaire. |
| TC-CAP-007 | Verdict d'un **tiers** (cookie de session absent/étranger) | P0 (sécu) | Capture refusée (erreur générique « introuvable / session expirée ») ; **pas d'oracle** d'existence d'UUID. |
| TC-CAP-008 | Page verdict vue **sans session** (tiers) | P1 | Affiche le **teaser anonymisé** (jamais l'adresse) ; **pas** de module de capture. |
| TC-CAP-009 | Verdict **conforme** (pas de trop-perçu) | P2 | Résultat « conforme » affiché ; le module de capture reste proposé ; lead captrable. |
| TC-CAP-010 | `prefers-reduced-motion` actif | P3 | Aucune animation bloquante ; parcours complet faisable. |

## 6. Réception admin — informations importantes à vérifier

> En waitlist, le dossier est **anonyme** (pas de compte) : l'identité nom/prénom n'existe **pas**
> encore (elle n'apparaît qu'après création de compte). Le **contact** vit dans `leads`.

**Dans `/admin/funnel` (file « Leads capturés »)** — pour chaque lead :
- [ ] Date de capture (`consent_at`, plus anciens d'abord).
- [ ] Adresse du dossier (lien cliquable vers la fiche).
- [ ] Statut du dossier (badge, ex. `DIAGNOSED`).
- [ ] **Email** (lien `mailto:`, en vert `refund`).
- [ ] Téléphone si fourni.
- [ ] Compteurs cohérents (verdicts affichés ≥ emails capturés).

**Dans `/admin/dossiers/[id]` (fiche)** :
- [ ] Adresse complète du logement.
- [ ] **Verdict** : montant récupérable (centimes → € en mono/tabular, vert), règle (id+version),
      base légale, **score de confiance**, audit trail (calcul détaillé).
- [ ] Statut = `DIAGNOSED` + timeline cohérente.
- [ ] Identité client (nom/prénom/tél) : **vide attendu** en waitlist anonyme (pas un bug).
- [ ] Pièces : aucune (normal, pas d'upload en waitlist).
- [ ] Accès **réservé admin** : un non-admin est redirigé (RLS + `requireAdminPage`).

## 7. Couverture automatisée & lacunes

| Brique | Auto existant | Statut |
|---|---|---|
| Tunnel → verdict | `e2e/diagnostic-tunnel.spec.ts` | ✅ |
| Capture anonyme → lead → funnel admin | `e2e/waitlist-lead.spec.ts` (nouveau) | ✅ |
| Schéma lead (email/téléphone/consentement) | `lib/leads/schema` (unit) | À confirmer |
| TC-CAP-007 (propriété de session) | — | ⚠️ Lacune e2e |
| TC-CAP-008 (teaser tiers) | — | ⚠️ Lacune e2e |
| TC-CAP-006 (rate-limit) | — | ⚠️ Lacune (unit possible) |
| Accès admin refusé à un non-admin | `e2e/rls-isolation.spec.ts` (partiel) | À étendre |

## 8. Critères de sortie & risques

**Sortie (go waitlist)**
- [ ] TC-E2E-001 vert sur desktop **et** webview mobile réelle.
- [ ] TC-CAP-007 (sécurité propriété de session) vert.
- [ ] Les infos importantes du §6 présentes côté admin.
- [ ] `pnpm typecheck` + Vitest verts ; suite e2e verte.

**Risques**
- Confusion « réception du mail » : en waitlist aucun email ne part (cf. §2) → ne pas tester une boîte mail.
- Webview mobile (cookies/redirects) : tester en conditions réelles, pas seulement desktop.
- Dossier anonyme sans identité : ne pas confondre « champ vide » et « bug ».
- Cas B (magic-link) dépend de G-opt (SMTP + template) : à ne planifier qu'une fois la config cloud faite.

---

## 9. Extension — Parcours COMPLET authentifié (choix : jusqu'à l'espace)

> Couvre l'email **cas B (code de connexion)** + l'espace client + la réception admin **complète**
> (avec identité). **Gating** : l'email réel exige SMTP Brevo + template `{{ .Token }}` (G-opt) ;
> mandat/pièces exigent `MANDATE_ENABLED=true` (verrou juridique).
> En **e2e**, le code est simulé via service-role (`generateLink`) → testable **sans boîte mail** ;
> en **QA prod manuelle**, il faut la config cloud pour recevoir un vrai code.

### 9.1 Dépendances à activer selon le niveau de test
| Étape | e2e (dev/cloud) | QA prod manuelle |
|---|---|---|
| Réception du code email | Simulé (`generateLink`) | **SMTP Brevo + template `{{ .Token }}` + SPF/DKIM** |
| Connexion par code | ✅ | ✅ (une fois SMTP ok) |
| Espace + profil | ✅ | ✅ |
| Signature mandat + pièces | `MANDATE_ENABLED=true` | **MANDATE_ENABLED=true** (= verrou juridique levé) |

### 9.2 TC-E2E-020 — Journey complète : diagnostic → code → espace → (mandat/pièces) → admin complet
**Priorité** : P0 · **Préconditions** : login exposé ; `MANDATE_ENABLED=true` pour mandat/pièces.
1. Jouer **TC-E2E-001** étapes 1-8 (jusqu'à la capture email comprise).
2. Déclencher la connexion : `/login` (ou CTA « avancer » → redirige vers login), saisir l'email.
   **Attendu** : message « code envoyé » ; en prod, un **email avec un code à 6 chiffres** arrive (cas B).
3. Saisir le code reçu.
   **Attendu** : `verifyLoginCode` ok → session créée → redirection (`next` ou `/espace`).
4. **Rattachement** : le dossier anonyme (même email/session) est réclamé.
   **Attendu** : il apparaît dans `/espace` (liste des dossiers).
5. Ouvrir le dossier → onglets Aperçu / Pièces / Mandat / Messages.
   **Attendu** : aperçu (verdict, KPI, timeline) cohérent ; **plus d'onglet Versement** (retiré en P3).
6. (Profil) `/espace/compte` : saisir nom, prénom, téléphone.
   **Attendu** : persisté sur le profil.
7. (Mandat, si activé) Signer le mandat.
   **Attendu** : transition `MANDATE_PENDING`, **preuve scellée** (hash + HMAC), PDF généré.
8. (Pièces) Uploader bail + quittance.
   **Attendu** : pièces **chiffrées** (AES-256-GCM), passage `IN_REVIEW`.
9. **Admin** `/admin/dossiers/<id>` : vérifier la **réception complète** (checklist §9.5).

### 9.3 Cas email/login (cas B)
| ID | Cas | Priorité | Attendu |
|---|---|---|---|
| TC-AUTH-021 | Code valide | P0 | Connexion, session, redirection. |
| TC-AUTH-022 | Code invalide / expiré | P1 | Erreur claire, pas de session. |
| TC-AUTH-023 | (Prod) 3 codes consécutifs depuis 3 adresses | P0 | Tous arrivent (SMTP Brevo, plus de plafond 2/h). |
| TC-AUTH-024 | Email réel **non classé spam** | P1 | Code en boîte de réception (SPF/DKIM ok) ; testé **webview mobile**. |
| TC-AUTH-025 | Redirect URLs cloud | P1 | `/auth/callback` autorisé (sinon le repli PKCE échoue). |

### 9.4 Cas espace
| ID | Cas | Priorité | Attendu |
|---|---|---|---|
| TC-ESP-026 | Liste + ouverture dossier + onglets | P1 | 4 onglets (aperçu/pièces/mandat/messages), **pas** de Versement. |
| TC-ESP-027 | Profil nom/prénom/tél | P1 | Sauvegardé, ré-affiché. |
| TC-ESP-028 | Signature mandat (`MANDATE_ENABLED=true`) | P0 | `MANDATE_PENDING` + preuve scellée. |
| TC-ESP-029 | Upload pièces (bail + quittance) | P0 | Chiffrées, `IN_REVIEW`. |
| TC-ESP-030 | Messagerie client↔admin | P1 | Client envoie, admin répond (operator), client voit la réponse. |
| TC-ESP-031 | Isolation : un autre user ne voit pas ce dossier | P0 (sécu) | RLS bloque (cf. `rls-isolation.spec.ts`). |

### 9.5 Réception admin COMPLÈTE (checklist)
- [ ] **Identité** : nom + prénom + téléphone + email du client (après profil rempli).
- [ ] Adresse + **verdict détaillé** (montant, règle+version, base légale, score de confiance, audit trail).
- [ ] **Pièces** téléchargeables + intégrité signature (HMAC ✓).
- [ ] Mandat : statut + **preuve scellée** consultable.
- [ ] Statut/timeline cohérents (`DIAGNOSED` → `MANDATE_PENDING` → `IN_REVIEW`).
- [ ] Répondre librement au client (message `operator`) → reçu côté client.
- [ ] Accès **réservé admin** (non-admin redirigé).

### 9.6 Couverture auto (extension) & lacunes
- Existant : `e2e/mandat.spec.ts` (signature, **gated** `MANDATE_ENABLED`), `e2e/espace-pieces.spec.ts`,
  `e2e/espace-messages.spec.ts` + `e2e/admin-dossier.spec.ts`, `e2e/rls-isolation.spec.ts`.
- **Lacunes** : login par code en e2e **explicite** (aujourd'hui implicite via global-setup) ;
  happy-path mandat **dé-skippé** (`MANDATE_ENABLED=true` en CI) ; rattachement dossier-après-login.

### 9.7 Pré-requis pour exécuter le §9 en prod (rappel gating)
1. **SMTP Brevo + template magic-link `{{ .Token }}`** (sinon aucun code ne part / pas saisissable).
2. **SPF/DKIM** du domaine expéditeur + **Redirect URLs** (`/auth/callback`).
3. **`MANDATE_ENABLED=true`** = décision juridique (société + RC pro + mandat avocat) — sinon mandat/pièces hors d'atteinte.
