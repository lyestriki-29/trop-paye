/**
 * Conversion loyer « charges comprises » → hors charges (spec questionnaire §2).
 * PUR : le moteur ne voit jamais de CC — la conversion a lieu côté questionnaire
 * (`toSnapshot`), ce helper en garantit l'exactitude en centimes.
 */

/**
 * Barème d'estimation des charges mensuelles : 2,50 €/m²/mois.
 * TODO_VERIFIER — placeholder à remplacer par une source documentée (spec §2).
 */
export const CHARGES_ESTIMATE_EUR_PER_M2_CENTS = 250;

/** Charges mensuelles estimées depuis la surface (centimes entiers). */
export function estimateMonthlyChargesCents(surfaceM2: number): number {
  return Math.round(surfaceM2 * CHARGES_ESTIMATE_EUR_PER_M2_CENTS);
}

/**
 * HC = CC − charges. `null` si la saisie est invalide : montants non entiers,
 * CC ≤ 0, charges < 0 ou charges ≥ CC (erreur bloquante côté UI + zod).
 */
export function ccToHcCents(ccCents: number, chargesCents: number): number | null {
  if (!Number.isInteger(ccCents) || !Number.isInteger(chargesCents)) return null;
  if (ccCents <= 0 || chargesCents < 0) return null;
  if (chargesCents >= ccCents) return null;
  return ccCents - chargesCents;
}
