import type {
  Confidence,
  DossierSnapshot,
  RuleInput,
  RuleResult,
  VerdictGlobal,
} from "./types";
import { CASE_REGISTRY } from "./registry";

const RANK: Record<Confidence, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
const lowest = (cs: Confidence[]): Confidence =>
  cs.length === 0 ? "LOW" : cs.reduce((a, b) => (RANK[a] <= RANK[b] ? a : b), "HIGH");

/** Cas évaluable : toutes ses clés requises sont présentes au snapshot. */
function hasRequiredInputs(
  snapshot: DossierSnapshot,
  keys: (keyof DossierSnapshot)[],
): boolean {
  return keys.every((k) => snapshot[k] !== undefined);
}

/**
 * Itère le registre de cas à la date, agrège les RuleResult IRREGULAR, déduplique
 * les périodes qui se recouvrent (jamais deux fois le même euro) et collecte les
 * signaux d'orientation — JAMAIS chiffrés en répétition automatique.
 */
export function evaluateAll(input: RuleInput): VerdictGlobal {
  const results: RuleResult[] = [];
  const signals: string[] = [];
  for (const def of CASE_REGISTRY) {
    if (!hasRequiredInputs(input.dossier, def.requiredInputs)) continue;
    const out = def.evaluate(input);
    if (out == null) continue;
    if (Array.isArray(out)) for (const s of out) signals.push(s.message);
    else results.push(out);
  }

  // Anti double-comptage : si DPE_FREEZE et IRL_OVERCHARGE sont tous deux
  // irréguliers (même augmentation de loyer), retenir le recouvrable le plus
  // élevé ; l'autre devient subsidiaire (non sommé).
  const dpe = results.find((r) => r.ruleId === "DPE_FREEZE");
  const irl = results.find((r) => r.ruleId === "IRL_OVERCHARGE");
  // Immuable : le moteur est PUR — on ne mute pas les RuleResult, on reconstruit le tableau.
  let merged = results;
  if (dpe && irl && dpe.outcome === "IRREGULAR" && irl.outcome === "IRREGULAR") {
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
