import { describe, it, expect } from "vitest";
import { evaluateDepositLate } from "./deposit-late";
import type { DepositInput, RuleInput } from "../types";

const mk = (deposit: DepositInput | undefined, asOf: string): RuleInput => ({
  dossier: { dpeHistory: [], rentHistory: [], ...(deposit ? { deposit } : {}) },
  referentials: { irl: [], shieldRatePct: 3.5 },
  asOf,
});

const DEP = {
  depositCents: 100000,
  monthlyRentCents: 90000,
  edlConforme: true,
};

describe("DEPOSIT_LATE", () => {
  it("1. restitution intégrale dans le délai → COMPLIANT", () => {
    const r = evaluateDepositLate(
      mk({ ...DEP, leaveDate: "2024-01-10", refundDate: "2024-02-05", refundCents: 100000 }, "2024-03-01"),
    );
    expect(r.outcome).toBe("COMPLIANT");
    expect(r.recoverableCents).toBe(0);
  });

  it("2. non restitué, EDL conforme (1 mois) : principal + pénalité 10 %/mois entamé", () => {
    const r = evaluateDepositLate(mk({ ...DEP, leaveDate: "2024-01-10" }, "2024-03-15"));
    // délai → 2024-02-10 ; 2 mois entamés au 2024-03-15 ; pénalité 2×9000
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBe(118000); // 100000 + 18000
    expect(r.actionDeadline).toBe("2024-02-10");
  });

  it("2B. nouvelle adresse non communiquée : principal seul, sans majoration", () => {
    const r = evaluateDepositLate(
      mk({ ...DEP, leaveDate: "2024-01-10", addressTransmitted: false }, "2024-03-15"),
    );
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBe(100000);
    expect(r.computation.steps).toContainEqual({
      label: "Majoration 10 %/mois neutralisée : nouvelle adresse non communiquée au bailleur (art. 22)",
      cents: 0,
    });
  });

  it("2C. nouvelle adresse communiquée : comportement identique au cas sans champ", () => {
    const r = evaluateDepositLate(
      mk({ ...DEP, leaveDate: "2024-01-10", addressTransmitted: true }, "2024-03-15"),
    );
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBe(118000);
    expect(r.actionDeadline).toBe("2024-02-10");
  });

  it("3. EDL non conforme → délai de 2 mois", () => {
    const r = evaluateDepositLate(
      mk({ ...DEP, edlConforme: false, leaveDate: "2024-01-10" }, "2024-03-15"),
    );
    // délai → 2024-03-10 ; 1 mois entamé ; 100000 + 9000
    expect(r.recoverableCents).toBe(109000);
    expect(r.actionDeadline).toBe("2024-03-10");
  });

  it("4. restitution partielle tardive sans justificatif : solde + pénalité", () => {
    const r = evaluateDepositLate(
      mk(
        { ...DEP, leaveDate: "2024-01-10", refundCents: 60000, refundDate: "2024-04-10" },
        "2024-05-01",
      ),
    );
    // solde 40000 ; retard délai 2024-02-10 → 2024-04-10 = 2 mois ; pénalité 18000
    expect(r.recoverableCents).toBe(58000);
  });

  it("5. retenues justifiées réduisent le principal", () => {
    const r = evaluateDepositLate(
      mk({ ...DEP, leaveDate: "2024-01-10", justifiedRetentionCents: 30000 }, "2024-03-15"),
    );
    // solde 70000 ; 2 mois entamés ; pénalité 18000
    expect(r.recoverableCents).toBe(88000);
  });

  it("6. restitution intégrale mais tardive → pénalité seule", () => {
    const r = evaluateDepositLate(
      mk(
        { ...DEP, leaveDate: "2024-01-10", refundCents: 100000, refundDate: "2024-04-10" },
        "2024-05-01",
      ),
    );
    // principal 0 ; 2 mois entamés ; pénalité 18000
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBe(18000);
  });

  it("7. pas de données de dépôt → COMPLIANT (module non applicable)", () => {
    const r = evaluateDepositLate(mk(undefined, "2024-05-01"));
    expect(r.outcome).toBe("COMPLIANT");
    expect(r.recoverableCents).toBe(0);
  });
});
