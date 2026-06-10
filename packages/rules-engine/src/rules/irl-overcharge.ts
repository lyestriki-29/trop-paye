import type {
  ComputationStep,
  IrlIndexEntry,
  Referentials,
  RuleInput,
  RuleResult,
} from "../types";
import { eachMonth, maxISO, shiftISO } from "../internal/dates";

const RULE_ID = "IRL_OVERCHARGE" as const;
const RULE_VERSION = "2024-04";
const PRESCRIPTION_YEARS = 3;
const SHIELD_FROM = "2022-07-01"; // T3 2022
const SHIELD_TO = "2024-03-31"; // T1 2024
const LEGAL_BASIS =
  "Révision IRL — loi du 06/07/1989 art. 17-1 (clause de révision requise, plafond = variation de l'IRL du trimestre de référence) ; bouclier loyer 3,5 % T3-2022→T1-2024 (lois 16/08/2022 et 07/07/2023).";

const day = (iso: string): string => iso.slice(0, 10);
const byDateAsc = (a: { date: string }, b: { date: string }): number =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : 0;

function irlValue(ref: Referentials, year: number, q: string): IrlIndexEntry | undefined {
  return ref.irl.find((e) => e.quarter === `${year}-${q}`);
}

export function evaluateIrlOvercharge(input: RuleInput): RuleResult {
  const { dossier, referentials, asOf } = input;
  const steps: ComputationStep[] = [];
  const todo: string[] = [];
  const base = (partial: Partial<RuleResult>): RuleResult => ({
    ruleId: RULE_ID,
    ruleVersion: RULE_VERSION,
    outcome: "COMPLIANT",
    confidence: "MEDIUM",
    recoverableCents: 0,
    futureMonthlySavingCents: 0,
    legalBasis: LEGAL_BASIS,
    computation: {
      ruleId: RULE_ID,
      ruleVersion: RULE_VERSION,
      steps,
      ...(todo.length ? { todoVerifier: todo } : {}),
    },
    ...partial,
  });

  const rents = [...dossier.rentHistory].sort(byDateAsc);
  if (rents.length === 0 || !rents.some((r) => r.type === "REVISION")) {
    steps.push({ label: "Aucune révision de loyer" });
    return base({ outcome: "COMPLIANT", confidence: "HIGH" });
  }

  const clause = dossier.revisionClause;
  const q = dossier.revisionQuarter;

  type Point = { date: string; legal: number };
  const points: Point[] = [];
  let prevLegal = rents[0]!.rentCents;
  let usedUnverified = false;
  let allSourcesQuittance = true;
  let firstOverchargeDate: string | undefined;

  for (const ev of rents) {
    if (ev.type !== "REVISION") {
      prevLegal = ev.rentCents;
      points.push({ date: day(ev.date), legal: prevLegal });
      continue;
    }
    if (ev.source !== "quittance") allSourcesQuittance = false;

    if (clause === false) {
      // Sans clause de révision, aucune indexation n'est permise : tout est indu.
      if (ev.rentCents > prevLegal && !firstOverchargeDate) firstOverchargeDate = day(ev.date);
      points.push({ date: day(ev.date), legal: prevLegal });
      continue;
    }

    if (!q) {
      return base({
        outcome: "INSUFFICIENT_DATA",
        confidence: "LOW",
        missingData: ["revisionQuarter"],
      });
    }
    const yearN = Number(day(ev.date).slice(0, 4));
    const irlN = irlValue(referentials, yearN, q);
    const irlPrev = irlValue(referentials, yearN - 1, q);
    if (!irlN || !irlPrev) {
      return base({ outcome: "INSUFFICIENT_DATA", confidence: "LOW", missingData: ["irl"] });
    }
    if (!irlN.verified || !irlPrev.verified) {
      usedUnverified = true;
      todo.push(`IRL ${irlN.quarter}/${irlPrev.quarter} (valeurs à vérifier)`);
    }
    let allowed = Math.round((prevLegal * irlN.value) / irlPrev.value);
    const d = day(ev.date);
    if (d >= SHIELD_FROM && d <= SHIELD_TO) {
      const shield = Math.round(prevLegal * (1 + referentials.shieldRatePct / 100));
      allowed = Math.min(allowed, shield);
    }
    const legal = Math.min(ev.rentCents, allowed);
    if (ev.rentCents > allowed && !firstOverchargeDate) firstOverchargeDate = d;
    points.push({ date: d, legal });
    prevLegal = legal;
  }

  if (!firstOverchargeDate) {
    steps.push({ label: "Révisions conformes à l'IRL" });
    return base({ outcome: "COMPLIANT", confidence: allSourcesQuittance ? "HIGH" : "MEDIUM" });
  }

  const legalAt = (dateISO: string): number => {
    const t = day(dateISO);
    let v = points[0]!.legal;
    for (const p of points) {
      if (p.date <= t) v = p.legal;
      else break;
    }
    return v;
  };
  const paidAt = (dateISO: string): number => {
    const t = day(dateISO);
    let v = rents[0]!.rentCents;
    for (const r of rents) {
      if (day(r.date) <= t) v = r.rentCents;
      else break;
    }
    return v;
  };

  const prescriptionStart = shiftISO(asOf, { years: -PRESCRIPTION_YEARS });
  const windowStart = maxISO(firstOverchargeDate, prescriptionStart);
  let recoverable = 0;
  for (const month of eachMonth(windowStart, asOf)) {
    const diff = paidAt(month) - legalAt(month);
    if (diff > 0) recoverable += diff;
  }
  const future = Math.max(0, paidAt(asOf) - legalAt(asOf));

  const confidence =
    allSourcesQuittance && !usedUnverified && clause !== undefined ? "HIGH" : "MEDIUM";

  steps.push({ label: "Loyer légal à ce jour", cents: legalAt(asOf) });
  steps.push({ label: "Trop-perçu récupérable (fenêtre 3 ans)", cents: recoverable });
  steps.push({ label: "Économie mensuelle à venir", cents: future });

  return base({
    outcome: recoverable > 0 || future > 0 ? "IRREGULAR" : "COMPLIANT",
    confidence,
    recoverableCents: recoverable,
    futureMonthlySavingCents: future,
    actionDeadline: shiftISO(firstOverchargeDate, { years: PRESCRIPTION_YEARS }),
  });
}
