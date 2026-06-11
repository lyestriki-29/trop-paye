# Backlog produit — 20 améliorations candidates (2026-06-11)

> Proposées par Claude, arbitrage Lyes. Effort : S (< 1 j) · M (2-5 j) · L (semaines).
> ⭐ = top 5 recommandé court terme (pilote).

## A. Acquisition / SEO

1. ⭐ **5 guides DPE** (déjà spécifiés, go en attente) — S. Le contenu SEO le plus
   proche du métier ; gabarit `gabarit-guide` déjà en design-lab.
2. **Pages programmatiques par ville** `/loyer/{ville}` : loyers de référence,
   encadrement, stats locales + CTA diagnostic — M. Le gros volume SEO.
3. **Outil gratuit « Calculer la révision IRL de mon loyer »** — S/M. Le moteur
   sait déjà ; page outil + capture email. Aimant à liens (assos, presse).
4. ⭐ **« Ma commune est-elle en zone tendue ? »** — S. Double effet : page SEO
   + charge le dataset `zoneByInsee` qui ACTIVE la règle AGENCY_FEES_CAP
   (aujourd'hui inerte faute de zonage).
5. **Bookmarklet/extension « Vérifier cette annonce »** (SeLoger/LeBonCoin →
   pré-diagnostic) — M/L. Growth hack, à tester en bookmarklet d'abord.

## B. Funnel / produit

6. ⭐ **Vérification d'annonce AVANT signature** (v0 de l'idée marketplace de
   Lyes) : coller l'URL/les infos d'une annonce → check loyer de référence,
   DPE, complément, zone — M. Capte le locataire AVANT le bail (moment où il
   est le plus motivé) et alimente la marketplace plus tard.
7. **Marketplace d'annonces vérifiées** (idée Lyes complète) — XL, à PHASER :
   v0 = n° 6 ; v1 = badge « loyer vérifié TropPayé » sur les annonces
   d'agences partenaires (B2B, revenu de certification) ; v2 = marketplace.
   Avis honnête : marché biface (offre + demande à amorcer en même temps),
   NE PAS lancer pendant le pilote ; le badge v1 est le bon test de demande.
8. **Upload de quittances** → source « quittance » au lieu de déclaratif →
   confiance HIGH au moteur (déjà câblée) — M. Montants plus solides en revue.
9. **LOT 3 mini-tunnel « logement quitté »** (préavis + dépôt) — M. Spec prête.
10. **Reprendre mon diagnostic par lien magique** (continuer sur un autre
    appareil) — S. Le draft localStorage existe, il manque le transport.

## C. Confiance / preuve

11. **CaseProofList branchée sur les vrais dossiers anonymisés** + page
    /resultats vivante — S (une fois les premiers dossiers encaissés).
12. ⭐ **Page « Méthode & sources » générée depuis CASE_REGISTRY** : chaque
    règle, sa base légale, sa version, son statut de validation — S. Le
    registre (LOT 0) rend ça quasi gratuit ; très différenciant face aux
    concurrents boîte noire.
13. **AVOCAT.md + circuit de validation juridique** (transversal de la spec,
    en retard) — S. Agrège tous les marqueurs du code avec leur question.
14. **Audit accessibilité RGAA** — M. Crédibilité quasi-service-public.
15. **Témoignages vidéo Remotion** (packages/video déjà prêt) pour réseaux — M.

## D. Rétention / cycle de vie

16. ⭐ **Emails cycle de vie** sur l'outbox existante : verdict non réclamé
    J+1/J+7, rappel waitlist, relance dossier incomplet — S. Le levier de
    conversion le moins cher du backlog.
17. **Timeline du dossier dans l'espace client** (J0/J21/J35/J50, courriers,
    n° de suivi) — M. Réduit l'anxiété et les emails entrants.
18. **Alerte révision annuelle** : « votre bailleur peut réviser le {date} —
    vérifiez son calcul » — S/M. Récurrence gratuite, recapture annuelle.

## E. Ops / back-office

19. **File de revue priorisée** : consommer le flag `priority` des signaux
    (posé par le moteur, ignoré en aval aujourd'hui) + tri par potentiel — S.
20. **Funnel analytics enrichi** : conversion par étape du questionnaire,
    drop-off par champ, suivi `booster_applique` — M. Les events existent déjà.
