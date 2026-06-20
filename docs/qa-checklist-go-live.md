# Checklist QA — avant mise en ligne (TropPayé)

But : recensement **exhaustif** de ce qui doit être vérifié avant le live. À tenir à jour.

Légende couverture :
- ✅ **auto-vitest** : couvert par `pnpm test` (unitaire/intégration, hors ligne).
- 🎭 **e2e** : couvert (ou à couvrir) par Playwright `pnpm e2e` (besoin Supabase **local** :55321).
- 👁️ **manuel** : à vérifier à la main (navigateur / inspection).
- ❌ **non couvert** : aucun test aujourd'hui → à écrire.

Priorité : **P0** = bloquant live · **P1** = important · **P2** = confort.

> ⚠️ Contrainte d'exécution : le `global-setup` e2e **refuse Supabase cloud**
> (`Refus : Supabase hors local`). Pour lancer la suite : `pnpm db:start` →
> seed démo → env pointant `:55321` → `pnpm e2e`. Le dev cloud est lent
> (proxy 30 s–2 min/req) : éviter les smokes lourds dessus.

---

## 1. Moteur juridique — `packages/rules-engine` (déterministe, pur)
- [ ] ✅ P0 — Gel F/G : trop-perçu sur hausses **post-24/08/2022** uniquement.
- [ ] ✅ P0 — Bouclier 3,5 % : T3-2022 → T1-2024, **même hors F/G**, distinct du gel.
- [ ] ✅ P0 — Décence / interdiction de louer G(2025)/F(2028) : **orientation judiciaire, jamais chiffrée** en répétition auto.
- [ ] ✅ P0 — Les 3 régimes restent **distincts** (pas de cumul/confusion).
- [ ] ✅ P0 — `effectiveFrom`/`effectiveTo` : droit applicable selon **dates du dossier**, jamais date du jour.
- [ ] ✅ P0 — Indexation IRL (série INSEE 001515333) : `irlSuggestionCents` correct.
- [ ] ✅ P0 — Montants en **centimes (int)**, jamais de float.
- [ ] ✅ P1 — Coloc : on **× n** seulement les montants par-personne, **jamais le dépôt**.
- [ ] ✅ P1 — Règles COMPUTED gatées sur champ optionnel via `requiredInputs`.
- [ ] ✅ P0 — Chaque verdict porte : règle (id+version), base légale, calcul détaillé (audit JSON), score de confiance (HIGH|MEDIUM|LOW).
- [ ] ✅ P1 — Données externes (DPE, IRL) **injectées en paramètres** (zéro I/O dans le moteur).

## 2. Tunnel diagnostic public — `/diagnostic`
- [ ] 👁️ P0 — **Mois/Année dans n'importe quel ordre** (fix `025e3ec`) : saisie année→mois ET mois→année acceptées.
- [ ] 👁️ P0 — **Récap pleine largeur** (fix `bae5104`) : à la fin, le récap passe pleine largeur (rail droit masqué), CTA « Voir mon résultat » actif si soumettable.
- [ ] 👁️ P0 — Édition d'une réponse depuis le récap puis retour : pas de casse, état restauré.
- [ ] 👁️ P0 — **Suggestion IRL en un tap** sur une hausse (référentiels chargés).
- [ ] 👁️ P1 — Pièces exactes au stepper, **> 4 autorisé**, bouton « − » inactif si vide.
- [ ] 👁️ P0 — Parcours complet adresse → verdict sans blocage (saut tunnel gardé).
- [ ] 👁️ P1 — Verdict nb : 4 états (favorable / orientation / hors-champ / incomplet) rendus correctement.
- [ ] ❌ P1 — Persistance brouillon (localStorage `tp_diagnostic_active_v1`) : reprise après refresh.
- [ ] 👁️ P1 — Géocodage **Géoplateforme IGN** (`data.geopf.fr`) : adresse valide → coordonnées ; adresse inconnue → message clair.
- [ ] 👁️ P1 — Encadrement Paris (point-in-polygon) : loyer de référence trouvé ; **2 trous parisiens** gérés (fallback modélisé).

## 3. Site public / SEO / DA
- [ ] 👁️ P0 — `/design-lab` renvoie **404** (lab supprimé) ; site public intact.
- [ ] 👁️ P0 — Home, « Comment ça marche », barème, FAQ : rendu correct, pas d'erreur console.
- [ ] 👁️ P1 — Redirections **308** des pages retirées du public (nb-1).
- [ ] 👁️ P1 — `robots.ts` : surfaces privées hors index, sitemap déclaré.
- [ ] 👁️ P1 — OG image `/api/og/[verdictId]` : montant + type + ville, **jamais l'adresse**.
- [ ] 👁️ P2 — DA : montants en Spline Sans Mono `tabular-nums`, vert `refund` si en faveur locataire.
- [ ] 👁️ P1 — `prefers-reduced-motion` respecté **partout** (pas d'anim forcée).
- [ ] 👁️ P2 — Marque orange #FF7A1A (vert réservé aux montants), logo tampon.

## 4. Auth — magic link / OTP
- [ ] 🎭 P0 — Connexion via magic link / **OTP code** (login prod = code) → `/espace`.
- [ ] 👁️ P0 — Callback `/auth/callback` : token valide → session ; token périmé/réutilisé → erreur propre.
- [ ] 👁️ P1 — SMTP Brevo (clé `xsmtpsib`) : l'email de connexion **part** en prod.
- [ ] 👁️ P1 — Déconnexion + expiration de session.
- [ ] 👁️ P0 — Accès `/espace`, `/admin`, `/mandat` **sans session** → redirigé/refusé.

## 5. Espace client (`/espace`) — 5 specs e2e existantes
- [ ] 🎭 P0 — Aperçu dossier (`espace-apercu`).
- [ ] 🎭 P0 — Compte (`espace-compte`).
- [ ] 🎭 P0 — Messages (`espace-messages`).
- [ ] 🎭 P0 — Pièces : upload / lecture (`espace-pieces`).
- [ ] 🎭 P0 — Versement (`espace-versement`).
- [ ] 🎭 P0 — **Gate étude** : dossier `MANDATE_PENDING` → étude gatée tant que bail + quittance absents.
- [ ] ❌ P1 — États dossier (SCHEDULED|PAUSED|LOCKED) affichés correctement côté client.

## 6. Mandat & signature (eIDAS simple, maison)
- [ ] ❌ P0 — Signature du mandat : flux complet, horodatage, preuve conservée.
- [ ] ❌ P0 — `withAuth` sur chaque Server Action : session + **ownership** + validation zod.
- [ ] ❌ P1 — Barème mandat (`BaremeMandat`) : commission au succès affichée, copy §3 verbatim.
- [ ] ❌ P1 — Re-signature / mandat déjà signé : idempotent, pas de double.

## 7. Courriers & templates — `packages/templates`
- [ ] ❌ P0 — Tout courrier/message vient de `packages/templates` (**jamais de juridique improvisé**).
- [ ] ❌ P0 — Contenu **[AVOCAT]** non altéré dans le sens.
- [ ] 👁️ P0 — `scripts/check-copy.mjs` **bloque le build** si `[AVOCAT]` non validé (copy §7).
- [ ] ❌ P1 — Placeholders TODO_COPY visibles tant que non validés ; rien de « brouillon » en prod.

## 8. Séquences de relance (cron J0/J21/J35/J50)
- [ ] ❌ P0 — Route interne sécurisée par `CRON_SECRET` (refus sans secret).
- [ ] ❌ P0 — **Idempotence** : verrou par `action.id`, pas de double envoi.
- [ ] ❌ P0 — Lit `recovery_state` (SCHEDULED|PAUSED|LOCKED) **avant tout envoi** ; PAUSED/LOCKED → rien.
- [ ] ❌ P1 — `scheduled_at` respecté (fuseau **Europe/Paris**).
- [ ] ❌ P1 — Reprise après échec : pas de rejeu d'une action déjà traitée.

## 9. Paiements & LRE (MOCK derrière des ports)
- [ ] ❌ P0 — Paiement = **mock** : aucun appel réel ; le port renvoie un résultat déterministe.
- [ ] ❌ P0 — LRE = **mock** : envoi simulé, statut traçable.
- [ ] ❌ P1 — Emails de notif = **outbox** tant que pas de clé Resend/Brevo (rien ne part sinon).
- [ ] ❌ P1 — Commission au succès : calcul + déclenchement corrects.

## 10. RGPD & sécurité
- [ ] ❌ P0 — **RLS active sur toutes les tables** ; un user ne voit que ses dossiers.
- [ ] ❌ P0 — `proxy.ts` (ex-middleware) **n'est pas** une autorisation (juste routing).
- [ ] ❌ P0 — Pièces sensibles **chiffrées** (chiffrement applicatif, mitigation Cloud Act).
- [ ] ❌ P0 — **Aucun log de PII**.
- [ ] ❌ P0 — Suppression **en cascade** dès le début (suppression compte → tout part).
- [ ] ❌ P1 — Données 100 % en France (résidence) — cloud actuel = **Irlande** (décision Lyes, FR mise de côté) → à tracer pour conformité.
- [ ] ❌ P1 — Tentative d'accès cross-user (IDOR) sur dossier/pièce/message → refus.

## 11. Back-office / admin (`/admin`)
- [ ] ❌ P0 — Accès réservé au rôle admin (RLS + `withAuth`).
- [ ] ❌ P1 — Vue dossiers, changement d'état, déclenchement/pause relances.
- [ ] ❌ P2 — Pas de PII exposée hors nécessité.

## 12. Données réglementaires (référentiels)
- [ ] ✅ P0 — IRL série 001515333 seedée (migration `0008`) ; vérifié cloud 20/10/3/3.
- [ ] 👁️ P1 — Encadrement Paris : millésimes 2019-2025, ODbL, géo-rattachement.
- [ ] 👁️ P1 — ADEME slug `dpe03existant` : DPE récupéré par adresse.
- [ ] 👁️ P0 — Valeurs réglementaires **TODO_VERIFIER** levées avant prod.

## 13. Build prod & déploiement
- [ ] 👁️ P0 — `pnpm build` passe (= `check-copy.mjs` + `next build`).
- [ ] 👁️ P0 — `pnpm typecheck` + `pnpm lint` verts.
- [ ] 👁️ P0 — Variables d'env prod présentes (Supabase, CRON_SECRET, SMTP, APP_URL).
- [ ] 👁️ P1 — Coolify : build du Dockerfile OK, déploiement manuel déclenché.
- [ ] 👁️ P1 — Migrations appliquées cloud (`db push --db-url DIRECT_URL`) + seed référentiels.
- [ ] 👁️ P1 — `legal-entity.ts` : mentions éditeur gatées, encart démo tant que société non immatriculée.

## 14. Accessibilité & perf
- [ ] ❌ P1 — Lighthouse : pas de régression (H1 jamais `opacity:0`, CSS 200, filmstrip OK).
- [ ] ❌ P1 — Navigation clavier + focus visibles sur le tunnel.
- [ ] ❌ P2 — Contrastes (DA saturée) conformes WCAG AA.

## 15. Cross-cutting (invariants)
- [ ] ✅ P0 — Montants centimes (int), dates **ISO**, fuseau **Europe/Paris** partout.
- [ ] 👁️ P1 — Pas de tirets longs (—) dans la copy (style maison).
- [ ] 👁️ P2 — `tabular-nums` sur tous les montants.

---

## Bloquants live connus (hors test)
- **Validation avocat** : copy §7 `[AVOCAT]` bloque le build prod tant que non validée.
- **Immatriculation société** : encart démo affiché tant que pas immatriculée.
- **Résidence des données** : cloud actuel = Irlande (à arbitrer vs exigence « 100 % France »).
