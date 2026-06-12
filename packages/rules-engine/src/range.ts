import { evaluateAll } from "./aggregate";
import type {
  DossierSnapshot,
  Referentials,
  RuleInput,
  VerdictGlobal,
  VerdictRange,
} from "./types";

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

/**
 * Construit la fourchette à partir d'UN snapshot, en faisant varier la seule
 * hypothèse du complément de loyer (décision Lyes 2026-06-12) :
 * - borne basse : complément JAMAIS chiffré (loyer supposé tout compris) → zéro
 *   double-comptage, plancher garanti ;
 * - borne haute : complément chiffré si déclaré (OUI) ou incertain (NSP), à
 *   condition que le contexte le rende illégal (F/G ou critère 3DS) ; sinon
 *   identique à la borne basse.
 * Le reste du dossier est inchangé. PUR.
 */
export function evaluateSnapshotRange(
  snapshot: DossierSnapshot,
  referentials: Referentials,
  asOf: string,
): VerdictRange {
  const lowSnapshot: DossierSnapshot = {
    ...snapshot,
    rentSupplementDeclared: undefined,
  };
  const highSnapshot: DossierSnapshot =
    snapshot.rentSupplementDeclared === true
      ? snapshot
      : snapshot.rentSupplementUncertain === true
        ? { ...snapshot, rentSupplementDeclared: true }
        : snapshot;
  return evaluateRange(
    { dossier: lowSnapshot, referentials, asOf },
    { dossier: highSnapshot, referentials, asOf },
  );
}
