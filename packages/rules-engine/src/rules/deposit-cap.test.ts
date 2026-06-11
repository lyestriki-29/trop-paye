import { describe, it, expect } from "vitest";
import { evaluateDepositCap } from "./deposit-cap";
import { evaluateAll } from "../aggregate";
import type { RentEvent, RuleInput } from "../types";

const INITIAL = (rentCents: number): RentEvent => ({
  type: "INITIAL",
  date: "2022-01-01",
  rentCents,
  source: "déclaratif",
});

const mk = (
  dossier: Partial<RuleInput["dossier"]>,
  irl: RuleInput["referentials"]["irl"] = [],
): RuleInput => ({
  dossier: { dpeHistory: [], rentHistory: [], ...dossier },
  referentials: { irl, shieldRatePct: 3.5 },
  asOf: "2024-09-01",
});

describe("DEPOSIT_CAP (plafond du dépôt de garantie)", () => {
  it("vide, dépôt = 2 mois → 1 mois récupérable", () => {
    const r = evaluateDepositCap(
      mk({ furnished: false, rentHistory: [INITIAL(80000)], depositPaidCents: 160000 }),
    );
    expect(r?.outcome).toBe("IRREGULAR");
    expect(r?.recoverableCents).toBe(80000);
    expect(r?.confidence).toBe("MEDIUM");
  });

  it("meublé, dépôt = 2 mois → 0 (plafond 2 mois)", () => {
    const r = evaluateDepositCap(
      mk({ furnished: true, rentHistory: [INITIAL(80000)], depositPaidCents: 160000 }),
    );
    expect(r?.outcome).toBe("COMPLIANT");
    expect(r?.recoverableCents).toBe(0);
  });

  it("« je ne sais pas » (dépôt non déclaré) → cas non évalué (null), pas d'erreur", () => {
    const r = evaluateDepositCap(mk({ furnished: false, rentHistory: [INITIAL(80000)] }));
    expect(r).toBeNull();
  });

  it("dans le registre : dépôt non déclaré → aucun résultat DEPOSIT_CAP", () => {
    const v = evaluateAll(mk({ rentHistory: [INITIAL(80000)] }));
    expect(v.results.find((r) => r.ruleId === "DEPOSIT_CAP")).toBeUndefined();
  });

  it("agrégation : DEPOSIT_CAP + IRL s'additionnent (pas de fausse déduplication)", () => {
    const v = evaluateAll(
      mk(
        {
          revisionClause: true,
          revisionQuarter: "T2",
          furnished: false,
          depositPaidCents: 200000, // plafond 1 mois = 100000 → excédent 100000
          rentHistory: [
            { type: "INITIAL", date: "2022-01-01", rentCents: 100000, source: "quittance" },
            { type: "REVISION", date: "2023-02-01", rentCents: 110000, source: "quittance" },
          ],
        },
        [
          { quarter: "2021-T2", value: 130, verified: false },
          { quarter: "2022-T2", value: 135, verified: false },
        ],
      ),
    );
    const cap = v.results.find((r) => r.ruleId === "DEPOSIT_CAP");
    const irl = v.results.find((r) => r.ruleId === "IRL_OVERCHARGE");
    expect(cap?.recoverableCents).toBe(100000);
    expect(cap?.subsidiaryOf).toBeUndefined();
    expect(irl?.outcome).toBe("IRREGULAR");
    expect(v.totalRecoverableCents).toBe(
      (cap?.recoverableCents ?? 0) + (irl?.recoverableCents ?? 0),
    );
  });
});
