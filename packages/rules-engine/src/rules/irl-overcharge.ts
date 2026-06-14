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
export const LEGAL_BASIS =
  "Révision IRL — loi du 06/07/1989 art. 17-1 (clause de révision requise, plafond = variation de l'IRL du trimestre de référence) ; bouclier loyer 3,5 % T3-2022→T1-2024 (lois 16/08/2022 et 07/07/2023).";

const day = (iso: string): string => iso.slice(0, 10);
const byDateAsc = (a: { date: string }, b: { date: string }): number =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : 0;

/**
 * Dernier indice publié du trimestre de référence à une année donnée (ou avant).
 * Évite d'utiliser un indice futur/non encore publié, et tolère un seed partiel.
 * TODO_VERIFIER [AVOCAT] : règle exacte de l'indice applicable (calendrier de publication INSEE).
 */
function irlForYearOrBefore(ref: Referentials, year: number, q: string): IrlIndexEntry | undefined {
  let best: IrlIndexEntry | undefined;
  for (const e of ref.irl) {
    const parts = e.quarter.split("-");
    if (parts[1] !== q || parts[0] === undefined) continue;
    const y = Number(parts[0]);
    if (y <= year && (best === undefined || y > Number(best.quarter.split("-")[0]))) best = e;
  }
  return best;
}

/**
 * Calcule le loyer IRL suggéré (en centimes) pour une révision anniversaire.
 *
 * @param baseCents      Loyer initial du bail (centimes HC).
 * @param revisionQuarter Trimestre de référence IRL du bail (ex. "T2").
 * @param anniversaryYear Année de l'anniversaire (ex. 2024).
 * @param irl            Tableau des indices IRL disponibles (depuis les référentiels).
 * @returns Loyer indexé en centimes, ou null si les indices nécessaires sont absents.
 *
 * Formule : loyer_n = round(loyer_0 × IRL_n / IRL_(n-1))
 * TODO_VERIFIER [AVOCAT] : calcul itératif vs direct selon la jurisprudence applicable.
 */
export function irlSuggestionCents(
  baseCents: number,
  revisionQuarter: string,
  anniversaryYear: number,
  irl: IrlIndexEntry[],
): number | null {
  const ref: Referentials = { irl, shieldRatePct: 3.5, agencyFees: { capsByZone: { TRES_TENDUE: { feePerM2Cents: 0, edlPerM2Cents: 0 }, TENDUE: { feePerM2Cents: 0, edlPerM2Cents: 0 }, RESTE: { feePerM2Cents: 0, edlPerM2Cents: 0 } }, zoneByInsee: {} } };
  const irlN = irlForYearOrBefore(ref, anniversaryYear, revisionQuarter);
  const irlPrev = irlN ? irlForYearOrBefore(ref, Number(irlN.quarter.split("-")[0]) - 1, revisionQuarter) : undefined;
  if (!irlN || !irlPrev) return null;
  return Math.round((baseCents * irlN.value) / irlPrev.value);
}

export function evaluateIrlOvercharge(input: RuleInput): RuleResult {
  const { dossier, referentials, asOf } = input;
  const steps: ComputationStep[] = [];
  const todo: string[] = [];
  // Loyers HC estimés depuis du CC (spec questionnaire §2) : audit + plafond MEDIUM.
  const rentEstimated = dossier.rentEstimated === true;
  if (rentEstimated) {
    steps.push({ label: "Loyers hors charges estimés depuis des montants charges comprises" });
  }
  // Loyers reconstitués depuis la part d'un colocataire (LOT 1.3) : audit + plafond MEDIUM.
  const rentFromShare = dossier.rentReconstructedFromShare === true;
  if (rentFromShare) {
    steps.push({ label: "Loyers reconstitués depuis la part d'un colocataire (× nombre de colocataires)" });
  }
  // Trimestre déduit du mois de signature (spec questionnaire §3) : trace seule,
  // pas de double pénalité de confiance (saisie déjà déclarative).
  if (dossier.revisionQuarterSource === "DEDUCED") {
    steps.push({ label: "Trimestre IRL déduit du mois de signature du bail" });
  }
  const base = (partial: Partial<RuleResult>): RuleResult => {
    const result: RuleResult = {
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
    };
    if ((rentEstimated || rentFromShare) && result.confidence === "HIGH") result.confidence = "MEDIUM";
    return result;
  };

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
    const irlN = irlForYearOrBefore(referentials, yearN, q);
    const irlPrev = irlN
      ? irlForYearOrBefore(referentials, Number(irlN.quarter.split("-")[0]) - 1, q)
      : undefined;
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
