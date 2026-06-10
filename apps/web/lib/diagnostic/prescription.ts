import type { RuleResult } from "@troppaye/rules-engine";

/**
 * Prescription affichée au verdict (fenêtre glissante 3 ans) — [AVOCAT].
 *
 * Date affichée = min(`actionDeadline`) des résultats IRREGULAR comptés
 * (non subsidiaires) = expiration du mois le plus ancien encore récupérable.
 * Si ce min est déjà passé (1re irrégularité > 3 ans), la fenêtre glisse
 * DÉJÀ : le mois le plus ancien encore récupérable (asOf − 3 ans) expire
 * en continu → on borne au jour d'évaluation (max(min, asOf)), jamais une
 * date passée avec un futur (« ne seront plus récupérables »).
 * Logique pure, testée dans `prescription.test.ts`.
 */
export interface PrescriptionInfo {
  /** ISO YYYY-MM-DD — à formater côté UI (`frenchDate`). */
  deadline: string;
  /** Échéance ≤ 1 an → mise en avant sobre ; sinon mention discrète. */
  urgent: boolean;
}

const day = (iso: string): string => iso.slice(0, 10);

/** ISO + n années (UTC — les dates moteur sont des jours calendaires). */
function addYearsISO(iso: string, years: number): string {
  const d = new Date(`${day(iso)}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export function prescriptionInfo(
  results: ReadonlyArray<RuleResult>,
  asOf: string,
): PrescriptionInfo | null {
  const deadlines = results.flatMap((r) =>
    r.outcome === "IRREGULAR" && !r.subsidiaryOf && r.actionDeadline
      ? [day(r.actionDeadline)]
      : [],
  );
  if (deadlines.length === 0) return null;

  const min = deadlines.reduce((a, b) => (a <= b ? a : b));
  const today = day(asOf);
  const deadline = min < today ? today : min; // fenêtre déjà glissante → plancher asOf
  return { deadline, urgent: deadline <= addYearsISO(today, 1) };
}
