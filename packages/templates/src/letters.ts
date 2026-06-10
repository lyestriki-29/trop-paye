/**
 * Courriers de la séquence de relance — BROUILLONS [AVOCAT], ne pas utiliser en prod.
 * Texte placeholder neutre. Variables : {{...}}. À remplacer par le copy-deck avocat.
 */

const BANNER = "**[AVOCAT] — Brouillon non validé. Ne pas utiliser en production.**";

export const LETTER_J0 = `# Mise en demeure amiable (J0)

${BANNER}

Objet : régularisation d'un trop-perçu de loyer — {{tenantAddress}}
Date : {{date}} · Dossier : {{dossierRef}}

Madame, Monsieur {{landlordName}},

Agissant pour le compte de {{tenantName}}, locataire du logement situé {{tenantAddress}},
nous vous invitons à régulariser à l'amiable un trop-perçu estimé à **{{recoverableAmount}}**.

[AVOCAT — exposé des fondements, demande, délai de réponse de {{deadlineDays}} jours,
mentions légales : à rédiger et valider.]

_Information générale — ceci n'est pas un conseil juridique._
`;

export const LETTER_J21 = `# Relance (J21)

${BANNER}

Date : {{date}} · Dossier : {{dossierRef}}

Madame, Monsieur {{landlordName}},

Sauf erreur de notre part, notre courrier du {{previousDate}} concernant {{tenantName}}
est resté sans réponse. Nous vous renouvelons notre invitation à régulariser le
trop-perçu estimé à **{{recoverableAmount}}**. [AVOCAT — corps à valider.]

_Information générale — ceci n'est pas un conseil juridique._
`;

export const LETTER_J35 = `# Proposition de règlement (J35)

${BANNER}

Date : {{date}} · Dossier : {{dossierRef}}

Madame, Monsieur {{landlordName}},

Dans un esprit de résolution amiable, nous vous proposons les modalités de règlement
suivantes concernant le dossier de {{tenantName}}. [AVOCAT — proposition et conditions
à rédiger et valider.]

_Information générale — ceci n'est pas un conseil juridique._
`;

export const LETTER_J50 = `# Dernier avis avant clôture amiable (J50)

${BANNER}

Date : {{date}} · Dossier : {{dossierRef}}

Madame, Monsieur {{landlordName}},

Faute de régularisation, nous vous adressons un dernier avis amiable concernant le
trop-perçu estimé à **{{recoverableAmount}}** dû à {{tenantName}}. [AVOCAT — suite de la
démarche et orientation éventuelle à valider.]

_Information générale — ceci n'est pas un conseil juridique._
`;
