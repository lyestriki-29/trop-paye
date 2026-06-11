# Plan — Page /notre-histoire + injections du récit fondateur

> Statut : **PROPOSÉ** (en attente de validation Lyes) · 2026-06-11
> Spec source : message Lyes « page /notre-histoire + injections du récit fondateur »

## Constat d'ancrage (vérifié dans le repo)

- `docs/copy-deck-troppaye.md` : **aucune section « notre-histoire »** (s'arrête à §6).
  → Chemin critique : le copy doit être écrit par Lyes AVANT la mise en prod.
  Le mécanisme TODO_COPY (Phase 0) permet de TOUT construire sans attendre.
- Réutilisables : `components/ui/QuittanceCard.tsx` (lignes + highlight + total),
  `components/ui/Stamp.tsx` + effet `tp-stamp` (globals.css), pattern
  `lib/content/temoignages.ts`, `SiteFooter`, étape signature dans
  `apps/web/app/mandat/[dossierId]/MandateForm.tsx`.
- Cas zéro = le cas réel (complément de loyer 120 €/mois sur F, déjà au moteur) ;
  le montant affiché doit néanmoins venir du copy deck (pas de chiffre en dur).

## Garde-fous non négociables (de la spec)

1. **Zéro copy improvisé** : toute string visible vient de
   `lib/content/notre-histoire.ts`, alimenté par le copy deck §7 (à créer).
   Entrée manquante = `TODO_COPY — <clé>` visible en dev, **build prod ÉCHOUE**.
2. **Nicolas** : « expert de la location » uniquement — jamais juriste/expert
   juridique (code, alt, métadonnées, JSON-LD). Test automatisé.
3. **« Validé par avocat »** : derrière `legalReviewDone` (config, `false` par
   défaut) → phrase absente du DOM tant que non validé. Test automatisé.
4. Tampon au scroll = la SEULE animation forte ; `prefers-reduced-motion` →
   aucun listener monté, tampon statique. Test automatisé.

## Phases (critère de test à chaque palier)

### Phase 0 — Contrat de copy + garde-fous (le socle)
- `docs/copy-deck-troppaye.md` : ajouter §7 « notre-histoire » en SQUELETTE
  (toutes les clés listées, valeurs `TODO_COPY` — Lyes remplit par édition).
- `apps/web/lib/content/notre-histoire.ts` : objet typé (hero quittance, 2 voix,
  bascule, méthode, preuve sociale, CTA, SEO title/description, alts, jobTitles,
  signature footer, phrases StoryTeaser/ReviewerReassurance/VerdictStoryLine).
- `apps/web/scripts/check-copy.mjs` : échoue si `TODO_COPY` dans
  `lib/content/**` — branché en prebuild prod (`next build`), pas en dev.
- `apps/web/lib/config.ts` : `legalReviewDone = false`.
- Test garde-fou Nicolas : grep interdit `juriste|expert juridique` sur les
  fichiers du périmètre notre-histoire.
- ✅ Critère : `pnpm build` échoue (copy manquant) ; dev affiche TODO_COPY ; tests verts.

### Phase 1 — QuittanceStamped (la pièce signature)
- `components/story/QuittanceStamped.tsx` (client) : compose `QuittanceCard`
  (ligne « Complément de loyer » en `highlight`) + `Stamp` tone="stamp".
- IntersectionObserver au scroll → déclenche `tp-stamp` ; reduced-motion →
  pas d'observer, tampon rendu statique d'emblée.
- ✅ Critère : test « reduced-motion ⇒ aucun IntersectionObserver instancié »
  (mock) + snapshot des 2 états.

### Phase 2 — Page /notre-histoire (statique) + SEO
- `app/notre-histoire/page.tsx` : 6 sections dans l'ordre fixe de la spec.
- `components/story/CaseProofList.tsx` + `lib/content/case-proof.json` (tableau
  vide versionné ; ligne d'état vide « Premier dossier en cours : le nôtre. »).
- Photos : `public/story/founder.jpg`, `public/story/nicolas.jpg` (placeholders
  < 100 ko), `next/image`, alts depuis le copy.
- JSON-LD : `Organization` + 2 `Person` (jobTitle = clés copy, pas d'invention)
  + `AboutPage` ; échappement `</script` comme sur la home.
- Métadonnées + sitemap + maillage (`/a-propos` existe : décider redirection 301
  ou coexistence — à trancher par Lyes, défaut proposé : 301 vers /notre-histoire).
- ✅ Critère : page statique (build), JSON-LD valide, typecheck, axe de nav ok.

### Phase 3 — Injections (4 composants, chacun branché à sa page)
- `StoryTeaser` → home v3 (position proposée : entre Confiance et Témoignage).
- `ReviewerReassurance` (prop `reviewerName`) → étape signature `MandateForm`.
- `VerdictStoryLine` → `VerdictSequenceLive` (UNIQUEMENT outcome IRREGULAR).
- Signature courte → `SiteFooter`.
- ✅ Critère : snapshots ; VerdictStoryLine absent sur COMPLIANT/INSUFFICIENT ;
  zéro régression visuelle ailleurs (vérif manuelle Lyes).

### Phase 4 — Design-lab : 2 variantes de la section 1
- (a) « Pièce à conviction » : quittance plein écran, tampon au scroll, récit
  en dessous — parti pris : choc documentaire, mobile-first.
- (b) « Salle d'instruction » : split-screen, quittance figée à gauche, récit
  défilant à droite — parti pris : lecture longue desktop, immersion.
- ✅ Critère : les 2 rendent dans /design-lab ; arbitrage Lyes ; la retenue est
  promue en prod, l'autre archivée (convention design-lab).

### Phase 5 — Clôture
- Suite de tests complète (TODO_COPY prod-fail, legalReviewDone, reduced-motion,
  snapshots variantes), typecheck, lint, poids images vérifié.
- Revue `/code-review` standard (page de contenu : pas besoin d'ultracode).
- ✅ Critère : CI verte + démo à Lyes (parcours réel).

## Dépendances bloquantes (côté Lyes)
1. **Le copy §7 en entier** (bloquant prod, pas bloquant dev).
2. Photos réelles founder/nicolas (placeholders en attendant).
3. jobTitle exacts pour le JSON-LD.
4. Arbitrages : variante (a)/(b) · sort de `/a-propos` · position StoryTeaser.

## Hors périmètre (acté)
- CaseProofList branchée sur la base réelle (viendra avec les vrais dossiers).
- Toute jurisprudence/storytelling juridique non validé [AVOCAT].

## Rappel backlog en cours (avant ce chantier)
- Revue ultracode LOT 2 (boosters) : **en attente** — recommandée avant merge.
- LOT 3 mini-tunnel « logement quitté » : spec prête, non démarré.
- `AVOCAT.md` transversal : non généré.
