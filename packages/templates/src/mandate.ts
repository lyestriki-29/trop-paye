/**
 * Mandat de recouvrement — BROUILLON [AVOCAT], ne pas utiliser en production.
 * Texte placeholder neutre : aucun engagement juridique réel. À remplacer mot pour
 * mot par le copy-deck validé par l'avocat. Variables : {{...}}.
 */
export const MANDATE_TEMPLATE = `# Mandat de recouvrement amiable

**[AVOCAT] — Brouillon non validé. Ne pas utiliser en production.**

Référence du dossier : {{dossierRef}}
Date : {{date}}

## Entre les soussignés

**Le mandant** : {{tenantName}}, locataire du logement situé {{tenantAddress}}.

**Le mandataire** : TropPayé, agissant pour le compte du mandant dans le cadre d'une
démarche amiable de récupération de trop-perçu de loyer.

## Objet du mandat

Le mandant confie au mandataire le soin d'entreprendre, en son nom, les démarches
amiables visant à récupérer le trop-perçu estimé à **{{recoverableAmount}}**, sur le
fondement des éléments du diagnostic.

## Rémunération

La rémunération du mandataire est fixée à **{{feeRatePct}} %** des sommes effectivement
récupérées, exclusivement en cas de succès. [AVOCAT — barème et mentions R.124-4 à valider.]

## Étendue et durée

[AVOCAT — périmètre du mandat amiable, exclusion du conseil juridique, faculté de
rétractation, durée et révocation : à rédiger et valider.]

## Consentement

Le mandant déclare avoir pris connaissance du présent mandat et y consentir
expressément par signature électronique simple.

_Information générale — ceci n'est pas un conseil juridique._
`;
