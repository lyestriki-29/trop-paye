import type { ComputationStep, RuleInput, RuleResult } from "../types";
import { shiftISO } from "../internal/dates";

const RULE_ID = "DEPOSIT_LATE" as const;
const RULE_VERSION = "1989-art22";
const LEGAL_BASIS =
  "Dépôt de garantie — loi du 06/07/1989 art. 22 : restitution sous 1 mois (EDL de sortie conforme) ou 2 mois ; à défaut, majoration de 10 % du loyer mensuel hors charges par mois de retard entamé.";

const day = (iso: string): string => iso.slice(0, 10);

/** Nombre de mois de retard ENTAMÉS entre le délai légal et la date de fin. */
function monthsStarted(deadline: string, end: string): number {
  let m = 0;
  while (shiftISO(deadline, { months: m }) < day(end)) m++;
  return m;
}

export function evaluateDepositLate(input: RuleInput): RuleResult {
  const { dossier, asOf } = input;
  const steps: ComputationStep[] = [];
  const base = (partial: Partial<RuleResult>): RuleResult => ({
    ruleId: RULE_ID,
    ruleVersion: RULE_VERSION,
    outcome: "COMPLIANT",
    confidence: "HIGH",
    recoverableCents: 0,
    futureMonthlySavingCents: 0,
    legalBasis: LEGAL_BASIS,
    computation: { ruleId: RULE_ID, ruleVersion: RULE_VERSION, steps },
    ...partial,
  });

  const dep = dossier.deposit;
  if (!dep) {
    steps.push({ label: "Module dépôt non renseigné" });
    return base({ outcome: "COMPLIANT" });
  }
  if (!dep.leaveDate) {
    return base({ outcome: "INSUFFICIENT_DATA", confidence: "LOW", missingData: ["leaveDate"] });
  }

  const delayMonths = dep.edlConforme ? 1 : 2;
  const deadline = shiftISO(dep.leaveDate, { months: delayMonths });
  const lateEnd = dep.refundDate ?? asOf;
  const started = monthsStarted(deadline, lateEnd);

  if (started === 0) {
    steps.push({ label: `Restitution dans le délai légal (${delayMonths} mois)` });
    return base({ outcome: "COMPLIANT", actionDeadline: deadline });
  }

  const refunded = dep.refundCents ?? 0;
  const justified = dep.justifiedRetentionCents ?? 0;
  const principal = Math.max(0, dep.depositCents - justified - refunded);
  const penaltyPerMonth = Math.round(dep.monthlyRentCents * 0.1);
  const penalty = penaltyPerMonth * started;
  const recoverable = principal + penalty;

  steps.push({ label: "Solde du dépôt encore dû", cents: principal });
  steps.push({ label: `Pénalité 10 %/mois × ${started} mois entamés`, cents: penalty });

  return base({
    outcome: recoverable > 0 ? "IRREGULAR" : "COMPLIANT",
    recoverableCents: recoverable,
    actionDeadline: deadline,
  });
}
