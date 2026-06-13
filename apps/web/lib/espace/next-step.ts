import type { DossierStatus } from "@troppaye/shared";

export interface NextStep {
  text: string;
  href?: string;
  cta?: string;
}

/**
 * Calcule la prochaine étape à afficher pour un dossier selon son statut.
 * Extrait verbatim de `apps/web/app/espace/[dossierId]/page.tsx`.
 */
export function nextStep(status: DossierStatus, id: string): NextStep {
  switch (status) {
    case "DIAGNOSED":
      return {
        text: "Signez votre mandat pour lancer la démarche.",
        href: `/mandat/${id}`,
        cta: "Signer le mandat",
      };
    case "MANDATE_PENDING":
      return {
        text: "Ajoutez vos pièces (bail + quittance) pour lancer l'étude.",
        href: `/espace/${id}/pieces`,
        cta: "Ajouter mes pièces",
      };
    case "IN_REVIEW":
      return { text: "Votre dossier est en cours d'étude par nos équipes." };
    case "RECOVERY":
      return { text: "La démarche amiable est engagée auprès du bailleur." };
    case "ESCALATED":
      return { text: "Votre dossier suit une voie d'escalade." };
    case "WON":
      return { text: "Trop-perçu récupéré — bravo !" };
    case "LOST":
    case "CLOSED":
      return { text: "Ce dossier est clôturé." };
    default:
      return { text: "Diagnostic en cours." };
  }
}
