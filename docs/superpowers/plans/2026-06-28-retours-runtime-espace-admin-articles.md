# Plan — Retours runtime (espace client, admin, articles, bug pièces)

**Date** : 2026-06-28
**Contexte** : tests runtime de Lyes (login démo, données fake). 6 retours remontés.
**Scope** : essentiellement le **parcours complet** (espace client + admin + articles),
donc **post-waitlist**. Le premier live waitlist (capture email) n'est PAS bloqué par ça.

**Légende statut** : 🟢 prêt à coder · 🟠 décisions de design à trancher avant code.

---

## Phase 0 — 🟢 Bug upload pièces (#1) · FIX IMMÉDIAT

**Symptôme** : ajouter un document (bail/quittance) → page « Un problème technique est survenu ».
**Cause** (log serveur) : `Error: Body exceeded 1 MB limit` — l'upload passe par une
**Server Action**, et Next.js bloque tout body > 1 Mo par défaut.

**Correctif** :
1. `next.config.ts` → `experimental.serverActions.bodySizeLimit = "10mb"` (un bail PDF ou
   une photo de quittance dépasse 1 Mo).
2. (UX) Validation **côté client** dans le composant d'upload : refuser proprement un fichier
   trop lourd avec un message clair, AVANT l'envoi (évite un aller-retour serveur inutile).

**Critère de test** : uploader un PDF de ~3 Mo → pièce acceptée, pas de page d'erreur.
Uploader un fichier > 10 Mo → message clair, pas de crash.

---

## Phase 1 — 🟠 Dashboard admin centralisé (#3 + #4)

**Constat #3** : `admin/page.tsx` n'affiche que la « File de revue » (dossiers en attente
d'étude = `IN_REVIEW`). Un dossier juste diagnostiqué n'y est pas → impression qu'il a disparu.
**Demande #4** : une page d'accueil admin qui centralise infos + messagerie + « qui nous a
contactés », visible dès l'arrivée.

**Approche** : refondre `admin/page.tsx` en **tableau de bord d'accueil** :
- **KPIs** en haut : leads capturés (à recontacter), rappels en attente, dossiers par statut.
- **Derniers contacts** : flux unifié leads (`leads`) + demandes de rappel (`callback_requests`),
  les plus récents d'abord, avec lien vers la fiche.
- **Messagerie** : dossiers avec messages client non lus.
- **Raccourcis** vers Dossiers / Funnel / Rappels / Courriers / Articles.
- La « File de revue » actuelle devient une **carte** du dashboard (pas la page entière).

**Décisions à trancher** :
- D1 : on **remplace** la file de revue par le dashboard, ou on **ajoute** le dashboard au-dessus ?
- D2 : quels KPIs prioritaires en haut (top 3-4) ?
- D3 : « messagerie » = juste un compteur + liste, ou un vrai aperçu des derniers messages ?

**Critère de test** : à l'arrivée sur `/admin`, je vois les leads + rappels + dossiers récents
sans avoir à fouiller ; chaque ligne mène à la fiche.

---

## Phase 2 — 🟠 Refonte espace client : chat en sidebar + pièces (#2)

**Demande** : retirer l'onglet **Messages**, mettre le **chat dans une sidebar droite fixe**,
avec le **bouton de dépôt des pièces dans cette sidebar**.
**État actuel** : `espace/[dossierId]/layout.tsx` → onglets Aperçu / Pièces / Mandat / Messages
(`WorkspaceTabs`).

**Approche** : passer le layout en **2 colonnes** (contenu principal + sidebar droite persistante) :
- Sidebar = chat client↔admin (ex-onglet Messages) + bouton « Déposer mes pièces ».
- Onglets restants : Aperçu / Mandat (+ Pièces ?).

**Décisions à trancher** :
- D4 : **mobile** (majorité du trafic) — la sidebar fixe devient quoi ? (volet coulissant /
  bouton flottant qui ouvre le chat). Crucial, sinon ça casse sur téléphone.
- D5 : l'onglet **Pièces** disparaît-il complètement (tout passe par le bouton sidebar), ou
  reste-t-il en plus ?
- D6 : le **dépôt de pièces** dans la sidebar = panneau qui s'ouvre, ou redirige vers la page pièces ?

**Critère de test** : sur desktop, chat visible en permanence à droite + dépôt de pièces
accessible depuis la sidebar ; sur mobile, le chat reste atteignable sans casser la lecture.

---

## Phase 3 — 🟠 Articles : exposition publique (#5) + preview génération (#6)

**#5** : les articles admin (`admin/articles`, table `articles`) ne sont **pas** visibles sur
le site public. ⚠️ Les anciens `/guides` ont été **volontairement retirés** (redirect → `/`,
2026-06-14). Donc réexposer = **choix produit** (SEO/contenu).
**#6** : `admin/articles/generate-form.tsx` génère un brouillon sans **prévisualisation** avant
génération.

**Décisions à trancher** :
- D7 : réexpose-t-on les articles publiquement ? Sous quelle URL (`/articles`, `/blog`, `/guides`) ?
  (impacte SEO + les redirections 308 existantes).
- D8 : preview #6 = montrer quoi avant de générer ? (titre + plan/structure proposés à valider,
  puis génération du contenu complet).

**Critère de test** : (#5) un article publié est accessible et lié depuis le site ;
(#6) je vois un aperçu/structure avant de lancer la génération du brouillon.

---

## Ordre recommandé & effort

1. **Phase 0** (bug pièces) — maintenant, 🟢 sûr. `Max`.
2. **Phase 1** (dashboard) — la plus rentable, répond à #3+#4. Cadrer D1-D3 puis coder. `Max`.
3. **Phase 2** (espace client) — grosse refonte UI. Cadrer D4-D6 (surtout mobile) puis coder. `Max`.
4. **Phase 3** (articles) — indépendant. Cadrer D7-D8 puis coder. `Max`.

> Les phases 1-3 touchent du design : je **cadre les décisions Dx avec Lyes** avant de coder
> chacune (sinon je code à l'aveugle). Phase 0 ne nécessite aucune décision.
