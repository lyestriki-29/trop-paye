import type {
  Confidence,
  DossierSnapshot,
  RuleId,
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

  // Anti double-comptage des bases qui mesurent un même excès de loyer. Le gel
  // F/G et l'IRL chiffrent une HAUSSE illégale ; l'encadrement chiffre le
  // DÉPASSEMENT du plafond — or la hausse est incluse dans le dépassement (et
  // réciproquement selon les cas), donc les sommer sur-estime le recouvrable. On
  // ne retient que la base la plus élevée ; les autres deviennent subsidiaires
  // (non sommées). [AVOCAT] : périmètre exact à confirmer (V1 prudente, jamais
  // de sur-promesse). Immuable : on ne mute pas les RuleResult, on reconstruit.
  const OVERAGE_RULES: RuleId[] = ["DPE_FREEZE", "IRL_OVERCHARGE", "ENCADREMENT"];
  const overage = results.filter(
    (r) => OVERAGE_RULES.includes(r.ruleId) && r.outcome === "IRREGULAR",
  );
  let merged = results;
  if (overage.length > 1) {
    const primary = overage.reduce((a, b) => (a.recoverableCents >= b.recoverableCents ? a : b));
    merged = results.map((r) =>
      overage.some((o) => o.ruleId === r.ruleId) && r.ruleId !== primary.ruleId
        ? { ...r, subsidiaryOf: primary.ruleId }
        : r,
    );
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
