/**
 * Identité légale de l'éditeur — SOURCE UNIQUE (footer + page légale).
 *
 * Tant que la société n'existe pas, `ready: false` → AUCUNE mention inventée
 * n'est affichée publiquement : un encart neutre « version de démonstration »
 * est montré à la place (phase de test, choix Lyes 2026-06-14).
 *
 * Au jour J (société immatriculée + RC pro souscrite + adhésion médiateur) :
 * remplir les 4 champs ci-dessous PUIS passer `ready` à true — APRÈS validation
 * [AVOCAT]. Valeurs réglementaires = TODO_VERIFIER. Ne JAMAIS inventer ces données.
 */
export const LEGAL_ENTITY = {
  /** ⚠️ true UNIQUEMENT quand tout est figé et validé [AVOCAT]. Sinon mentions masquées. */
  ready: false,

  /** Raison sociale immatriculée (à figer). */
  raisonSociale: "{RAISON SOCIALE}",
  /** Ville du tribunal judiciaire du siège = procureur compétent (provisoire : Paris). */
  villeTribunal: "Paris",
  /** Assureur de la RC professionnelle (à souscrire). */
  assureurRC: "{assureur}",
  /** Médiateur de la consommation agréé (adhésion à finaliser). */
  mediateur: "{organisme}",
} as const;

/** Adresse de contact opérateur (publique) — destinataire des notifications de rappel. */
export const CONTACT_EMAIL = "contact@troppaye.fr";
