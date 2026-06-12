import { evaluateAll } from "./aggregate";
import type { RuleInput, VerdictGlobal, VerdictRange } from "./types";

/**
 * Évalue le dossier sur deux scénarios (bas/haut) et compose la fourchette.
 * Garde-fou : `low = min`, `high = max` des deux totaux, indépendamment de
 * l'ordre des arguments (sûreté pour un cas non monotone). La baisse de loyer
 * retenue est celle du scénario qui porte le total recouvrable le plus bas
 * (engagement prudent). PUR : appelle `evaluateAll` deux fois, ne mute rien.
 */
export function evaluateRange(inputLow: RuleInput, inputHigh: RuleInput): VerdictRange {
  const a = evaluateAll(inputLow);
  const b = evaluateAll(inputHigh);
  const low: VerdictGlobal = a.totalRecoverableCents <= b.totalRecoverableCents ? a : b;
  const high: VerdictGlobal = low === a ? b : a;
  return {
    low,
    high,
    totalRecoverableLowCents: low.totalRecoverableCents,
    totalRecoverableHighCents: high.totalRecoverableCents,
    futureMonthlySavingCents: low.totalFutureMonthlySavingCents,
    isRange: low.totalRecoverableCents !== high.totalRecoverableCents,
    asOf: inputLow.asOf,
  };
}
