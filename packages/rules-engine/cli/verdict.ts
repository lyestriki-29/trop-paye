import { readFileSync } from "node:fs";
import { evaluateAll } from "../src/aggregate";
import type { RuleInput, RuleResult } from "../src/types";

const eur = (cents: number): string =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

const RULE_LABEL: Record<string, string> = {
  DPE_FREEZE: "Gel des loyers (passoire F/G)",
  IRL_OVERCHARGE: "Révision IRL",
  DEPOSIT_LATE: "Dépôt de garantie",
};

function renderRule(r: RuleResult): string {
  const head = `  • ${RULE_LABEL[r.ruleId] ?? r.ruleId} — ${r.outcome} (confiance ${r.confidence})`;
  const lines: string[] = [head];
  if (r.subsidiaryOf) lines.push(`    ↳ subsidiaire de ${r.subsidiaryOf} (non compté)`);
  if (r.outcome === "IRREGULAR") {
    lines.push(`    récupérable : ${eur(r.recoverableCents)}  ·  économie future : ${eur(r.futureMonthlySavingCents)}/mois`);
    if (r.actionDeadline) lines.push(`    date limite d'action : ${r.actionDeadline}`);
  }
  if (r.missingData?.length) lines.push(`    données manquantes : ${r.missingData.join(", ")}`);
  return lines.join("\n");
}

function main(): void {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const path = args.find((a) => !a.startsWith("--"));
  if (!path) {
    console.error("Usage: pnpm verdict <fixture.json> [--json]");
    process.exit(1);
  }

  const input = JSON.parse(readFileSync(path, "utf8")) as RuleInput;
  const verdict = evaluateAll(input);

  if (asJson) {
    console.log(JSON.stringify(verdict, null, 2));
    return;
  }

  const title =
    verdict.outcome === "IRREGULAR"
      ? "VOUS AVEZ TROP PAYÉ"
      : verdict.outcome === "COMPLIANT"
        ? "RIEN À SIGNALER"
        : "DONNÉES INSUFFISANTES";

  console.log("");
  console.log(`  ╶─ TropPayé · verdict (${verdict.asOf}) ─╴`);
  console.log("");
  console.log(`  ${title}  ·  confiance ${verdict.confidence}`);
  if (verdict.outcome === "IRREGULAR") {
    console.log(`  Total récupérable : ${eur(verdict.totalRecoverableCents)}`);
    console.log(`  Économie à venir  : ${eur(verdict.totalFutureMonthlySavingCents)}/mois`);
  }
  console.log("");
  console.log("  Détail par fondement :");
  for (const r of verdict.results) console.log(renderRule(r));
  if (verdict.signals.length > 0) {
    console.log("");
    console.log("  Signaux d'orientation (non chiffrés) :");
    for (const s of verdict.signals) console.log(`  ⚑ ${s}`);
  }
  console.log("");
  console.log("  Estimation informative à partir de données publiques — ceci n'est pas un conseil juridique.");
  console.log("");
}

main();
