import type { Confidence, DpeClass, RuleInput, RuleResult, VerdictGlobal } from "./types";
import { evaluateDpeFreeze } from "./rules/dpe-freeze";
import { evaluateIrlOvercharge } from "./rules/irl-overcharge";
import { evaluateDepositLate } from "./rules/deposit-late";

const RANK: Record<Confidence, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
const lowest = (cs: Confidence[]): Confidence =>
  cs.length === 0 ? "LOW" : cs.reduce((a, b) => (RANK[a] <= RANK[b] ? a : b), "HIGH");

function latestDpeClassAt(input: RuleInput): DpeClass | undefined {
  const target = input.asOf.slice(0, 10);
  const before = input.dossier.dpeHistory.filter((d) => d.date.slice(0, 10) <= target);
  const pool = before.length > 0 ? before : input.dossier.dpeHistory;
  if (pool.length === 0) return undefined;
  return pool.reduce((m, d) => (d.date > m.date ? d : m), pool[0]!).class;
}

/**
 * Exécute toutes les règles à la date, agrège les IRREGULAR, déduplique
 * les périodes qui se recouvrent (jamais deux fois le même euro) et produit
 * le verdict global. Les signaux (ex. interdiction de louer G/F) sont
 * d'orientation — JAMAIS chiffrés en répétition automatique.
 */
export function evaluateAll(input: RuleInput): VerdictGlobal {
  const results: RuleResult[] = [
    evaluateDpeFreeze(input),
    evaluateIrlOvercharge(input),
    evaluateDepositLate(input),
  ];

  // Anti double-comptage : si DPE_FREEZE et IRL_OVERCHARGE sont tous deux
  // irréguliers (même augmentation de loyer), retenir le recouvrable le plus
  // élevé ; l'autre devient subsidiaire (non sommé).
  const dpe = results.find((r) => r.ruleId === "DPE_FREEZE")!;
  const irl = results.find((r) => r.ruleId === "IRL_OVERCHARGE")!;
  // Immuable : le moteur est PUR — on ne mute pas les RuleResult, on reconstruit le tableau.
  let merged = results;
  if (dpe.outcome === "IRREGULAR" && irl.outcome === "IRREGULAR") {
    const demoted = dpe.recoverableCents >= irl.recoverableCents ? "IRL_OVERCHARGE" : "DPE_FREEZE";
    const primary = demoted === "IRL_OVERCHARGE" ? "DPE_FREEZE" : "IRL_OVERCHARGE";
    merged = results.map((r) => (r.ruleId === demoted ? { ...r, subsidiaryOf: primary } : r));
  }

  const counted = merged.filter((r) => r.outcome === "IRREGULAR" && !r.subsidiaryOf);
  const totalRecoverableCents = counted.reduce((s, r) => s + r.recoverableCents, 0);
  const totalFutureMonthlySavingCents = counted.reduce(
    (s, r) => s + r.futureMonthlySavingCents,
    0,
  );

  const signals: string[] = [];
  const cls = latestDpeClassAt(input);
  const asOfDay = input.asOf.slice(0, 10);
  if (cls === "G" && asOfDay >= "2025-01-01") {
    signals.push(
      "Logement classé G : interdiction de mise en location depuis le 01/01/2025 (décence énergétique). Orientation possible vers une action judiciaire — non chiffrée automatiquement. [AVOCAT]",
    );
  }
  if (cls === "F" && asOfDay >= "2028-01-01") {
    signals.push(
      "Logement classé F : interdiction de mise en location depuis le 01/01/2028 (décence énergétique). Orientation judiciaire, non chiffrée automatiquement. [AVOCAT]",
    );
  }
  // Complément de loyer (retour Lyes 2026-06-11) : licite uniquement en zone
  // d'encadrement pour des caractéristiques exceptionnelles ; contestation
  // dans les 3 mois suivant la signature (CDC). Signal d'orientation, JAMAIS
  // chiffré automatiquement. TODO_VERIFIER [AVOCAT] : base art. 140 loi ELAN.
  if (input.dossier.rentSupplementDeclared) {
    signals.push(
      "Complément de loyer mentionné au bail : il n'est licite qu'en zone d'encadrement, pour des caractéristiques exceptionnelles du logement, et se conteste dans les 3 mois suivant la signature du bail. À examiner en revue. Orientation, jamais chiffrée automatiquement. [AVOCAT]",
    );
  }

  let outcome: VerdictGlobal["outcome"];
  if (counted.length > 0) outcome = "IRREGULAR";
  else if (results.some((r) => r.outcome === "INSUFFICIENT_DATA")) outcome = "INSUFFICIENT_DATA";
  else outcome = "COMPLIANT";

  const relevant = counted.length > 0 ? counted : merged.filter((r) => r.outcome !== "INSUFFICIENT_DATA");
  const confidence = lowest(relevant.map((r) => r.confidence));

  return {
    outcome,
    totalRecoverableCents,
    totalFutureMonthlySavingCents,
    confidence,
    results: merged,
    signals,
    asOf: input.asOf,
  };
}
