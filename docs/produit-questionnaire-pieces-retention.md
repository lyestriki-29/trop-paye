# Note produit — pièces au questionnaire, dépôt de garantie, rétention d'info

**Origine** : réflexion Lyes 2026-06-11 (« quels documents demander pour être plus
accurate ? on ne parle ni de la révision IRL ni du dépôt de garantie dans le
questionnaire ; et ne pas donner toutes les billes pour que le locataire ne
fasse pas les démarches lui-même »). Statut : à arbitrer, rien d'implémenté.

## 1. Documents : quoi demander, et QUAND

Constat moteur : la confiance passe à HIGH quand la source des loyers est
`quittance` (vs `déclaratif`). Aujourd'hui le diagnostic est 100 % déclaratif
(voulu : 2 minutes, anonyme jusqu'au verdict — structure-site §4) et les pièces
n'arrivent qu'au mandat (bail + 2 quittances).

| Pièce | Ce qu'elle fiabilise | Où la demander |
|---|---|---|
| Bail | date signature, clause de révision, trimestre IRL, loyer initial | Mandat (déjà) ; upload OPTIONNEL post-verdict « fiabilisez votre estimation » |
| Quittances / virements | historique réel des loyers → confiance HIGH | Idem — optionnel post-verdict, jamais avant |
| DPE (numéro) | classe + date opposables | Déjà au questionnaire (n° 13 caractères) |
| Avis d'échéance | loyer CC/HC + charges réelles (lève l'estimation 2,50 €/m²) | Optionnel post-verdict |
| Annonce / bail précédent | loyer du locataire précédent (règle zone tendue, future) | Plus tard (module relocation) |
| EDL sortie + lettre de départ | branche dépôt de garantie | Parcours dépôt dédié (cf. §2) |

**Principe retenu à valider** : AUCUN upload avant le verdict (conversion), un
écran « fiabilisez votre estimation » APRÈS la capture/verdict qui promet un
passage MEDIUM → HIGH (déjà supporté par le moteur, zéro changement de règle).

## 2. Dépôt de garantie

La règle `DEPOSIT_LATE` existe dans le moteur mais aucun écran ne la nourrit.
Deux options :
- **A (reco)** : parcours dédié court « J'ai quitté mon logement » (date remise
  des clés, EDL conforme O/N, montant, remboursé O/N/partiel) — 4 questions,
  activable depuis le verdict conforme (le rebond du copy deck §2 « Vous
  quittez bientôt votre logement ? Vérifiez aussi votre dépôt » existe déjà).
- B : brancher ces questions dans le tunnel principal (alourdit la promesse
  « 2 minutes » pour un cas minoritaire → déconseillé).

## 3. Rétention d'info (ne pas donner les billes du DIY)

Tension assumée : la marque promet « chaque calcul cite sa source » (confiance),
mais le mode d'emploi de la réclamation est NOTRE valeur. Ligne de crête :

- **On montre** : le montant, le niveau de confiance, la base légale (nom de la
  loi), la prescription — ce qui prouve le sérieux et déclenche le mandat.
- **On garde** : la décomposition mois par mois, la formule appliquée, les
  modèles de courrier, les délais/destinataires de la procédure, la stratégie
  de relance (J0/J21/J35/J50). → vivent dans l'admin et les courriers, jamais
  sur le verdict public.
- **Guides SEO** : informer sur LES DROITS (ça, tout internet l'a) + CTA outil ;
  jamais de « comment réclamer vous-même » pas à pas, pas de modèles de lettre.
- À auditer : la page verdict actuelle expose-t-elle trop de détail de calcul ?
  (audit trail JSON à réserver à l'admin). → revue dédiée.

## Décisions attendues de Lyes
1. Go/no-go écran « fiabilisez votre estimation » post-verdict (upload optionnel).
2. Go/no-go parcours dépôt de garantie court (option A).
3. Validation de la ligne de crête §3 + revue de la page verdict sous cet angle.
