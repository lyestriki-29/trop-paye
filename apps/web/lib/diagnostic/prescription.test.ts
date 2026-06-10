import { describe, expect, it } from "vitest";
import type { RuleResult } from "@troppaye/rules-engine";
import { prescriptionInfo } from "./prescription";

/** RuleResult minimal valide (typage strict, pas de cast). */
function rule(partial: Partial<RuleResult>): RuleResult {
  return {
    ruleId: "DPE_FREEZE",
    ruleVersion: "test",
    outcome: "COMPLIANT",
    confidence: "HIGH",
    recoverableCents: 0,
    futureMonthlySavingCents: 0,
    legalBasis: "test",
    computation: { ruleId: "DPE_FREEZE", ruleVersion: "test", steps: [] },
    ...partial,
  };
}

const ASOF = "2026-06-10";

describe("prescriptionInfo", () => {
  it("null sans résultat IRREGULAR daté", () => {
    expect(prescriptionInfo([rule({})], ASOF)).toBeNull();
    expect(
      prescriptionInfo([rule({ outcome: "IRREGULAR" })], ASOF), // sans actionDeadline
    ).toBeNull();
  });

  it("prend le min des échéances des IRREGULAR comptés", () => {
    const info = prescriptionInfo(
      [
        rule({ outcome: "IRREGULAR", actionDeadline: "2028-03-01" }),
        rule({ ruleId: "IRL_OVERCHARGE", outcome: "IRREGULAR", actionDeadline: "2026-11-01" }),
      ],
      ASOF,
    );
    expect(info).toEqual({ deadline: "2026-11-01", urgent: true });
  });

  it("ignore les subsidiaires et les non-IRREGULAR", () => {
    const info = prescriptionInfo(
      [
        rule({
          outcome: "IRREGULAR",
          actionDeadline: "2026-08-01",
          subsidiaryOf: "IRL_OVERCHARGE",
        }),
        rule({ ruleId: "DEPOSIT_LATE", actionDeadline: "2026-07-01" }), // COMPLIANT
        rule({ ruleId: "IRL_OVERCHARGE", outcome: "IRREGULAR", actionDeadline: "2027-01-15" }),
      ],
      ASOF,
    );
    expect(info?.deadline).toBe("2027-01-15");
  });

  it("borne une échéance passée au jour d'évaluation (fenêtre déjà glissante)", () => {
    const info = prescriptionInfo(
      [rule({ outcome: "IRREGULAR", actionDeadline: "2025-09-01" })],
      ASOF,
    );
    expect(info).toEqual({ deadline: ASOF, urgent: true });
  });

  it("échéance à plus d'un an → non urgente (mention discrète)", () => {
    const info = prescriptionInfo(
      [rule({ outcome: "IRREGULAR", actionDeadline: "2028-03-01" })],
      ASOF,
    );
    expect(info).toEqual({ deadline: "2028-03-01", urgent: false });
  });

  it("échéance à un an jour pour jour → encore urgente (borne incluse)", () => {
    const info = prescriptionInfo(
      [rule({ outcome: "IRREGULAR", actionDeadline: "2027-06-10" })],
      ASOF,
    );
    expect(info?.urgent).toBe(true);
  });
});
