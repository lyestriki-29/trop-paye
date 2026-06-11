import type { ComputationStep, RuleInput, RuleResult } from "../types";

const RULE_ID = "DEPOSIT_CAP" as const;
const RULE_VERSION = "1989-art22-cap";
const LEGAL_BASIS =
  "Dépôt de garantie — loi du 06/07/1989 art. 22 : plafond de 1 mois de loyer hors charges (logement vide) ou 2 mois (meublé). TODO_VERIFIER : loyer HC de référence (date de signature présumée).";

/**
 * Plafond du dépôt de garantie (LOT 1, COMPUTED). Compare le dépôt versé au
 * plafond légal (1 mois HC vide / 2 mois meublé) ; l'excédent est récupérable
 * immédiatement. Loyer de référence = loyer initial HC du snapshot. Déclaratif
 * → confiance MEDIUM. Distinct de DEPOSIT_LATE (retard de restitution, LOT 3).
 *
 * Renvoie `null` (cas non évalué, jamais d'erreur) si le dépôt n'est pas déclaré
 * (« je ne sais pas / pas de dépôt ») ou si aucun loyer de référence n'existe.
 */
export function evaluateDepositCap(input: RuleInput): RuleResult | null {
  const { dossier } = input;
  const paid = dossier.depositPaidCents;
  if (paid === undefined) return null;

  const initial = dossier.rentHistory.find((r) => r.type === "INITIAL");
  if (!initial) return null;

  const months = dossier.furnished ? 2 : 1;
  const cap = initial.rentCents * months;
  const recoverable = Math.max(0, paid - cap);

  const steps: ComputationStep[] = [
    { label: `Plafond légal du dépôt (${months} mois de loyer HC)`, cents: cap },
    { label: "Dépôt de garantie versé", cents: paid },
    { label: "Excédent récupérable", cents: recoverable },
  ];

  return {
    ruleId: RULE_ID,
    ruleVersion: RULE_VERSION,
    outcome: recoverable > 0 ? "IRREGULAR" : "COMPLIANT",
    confidence: "MEDIUM",
    recoverableCents: recoverable,
    futureMonthlySavingCents: 0,
    legalBasis: LEGAL_BASIS,
    computation: { ruleId: RULE_ID, ruleVersion: RULE_VERSION, steps },
  };
}
