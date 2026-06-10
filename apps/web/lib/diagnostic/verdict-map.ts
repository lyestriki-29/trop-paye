import type { Confidence, Outcome, RuleResult, VerdictGlobal } from "@troppaye/rules-engine";

export interface VerdictRow {
  outcome: string;
  confidence: string;
  total_recoverable_cents: number;
  total_future_monthly_saving_cents: number;
  results: unknown;
  signals: unknown;
  as_of: string;
}

/** Reconstruit un `VerdictGlobal` typé depuis une ligne `verdicts` (Json → types moteur). */
export function mapVerdictRow(v: VerdictRow): VerdictGlobal {
  return {
    outcome: v.outcome as Outcome,
    confidence: v.confidence as Confidence,
    totalRecoverableCents: v.total_recoverable_cents,
    totalFutureMonthlySavingCents: v.total_future_monthly_saving_cents,
    results: (v.results as RuleResult[]) ?? [],
    signals: (v.signals as string[]) ?? [],
    asOf: v.as_of,
  };
}
