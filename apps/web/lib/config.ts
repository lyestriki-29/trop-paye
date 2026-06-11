/**
 * Drapeaux de site (config statique, versionnée).
 *
 * `legalReviewDone` : tant que la relecture avocat du récit fondateur n'est pas
 * actée, AUCUNE mention « validé par avocat » ne doit apparaître dans le DOM
 * (garde-fou spec notre-histoire). Passer à `true` UNIQUEMENT sur décision Lyes,
 * après validation écrite de l'avocat.
 */
export const siteFlags = {
  legalReviewDone: false,
} as const;
