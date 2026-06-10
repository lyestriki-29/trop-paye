import { describe, it, expect } from "vitest";
import { evaluateDepositLate } from "./rules/deposit-late";
import { evaluateIrlOvercharge } from "./rules/irl-overcharge";
import type { RuleInput } from "./types";

// Régressions issues de la revue de code (multi-agents).
describe("régressions revue de code", () => {
  it("dépôt : départ le 31 → délai au 28/29 (pénalité bien détectée, pas de débordement)", () => {
    const input: RuleInput = {
      dossier: {
        dpeHistory: [],
        rentHistory: [],
        deposit: {
          depositCents: 100000,
          monthlyRentCents: 90000,
          edlConforme: true,
          leaveDate: "2024-01-31",
        },
      },
      referentials: { irl: [], shieldRatePct: 3.5 },
      asOf: "2024-03-01",
    };
    const r = evaluateDepositLate(input);
    expect(r.actionDeadline).toBe("2024-02-29");
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBe(109000); // 100000 + 1 mois × 9000
  });

  it("IRL : indice de l'année de révision non seedé → repli sur l'année publiée (pas INSUFFICIENT)", () => {
    const input: RuleInput = {
      dossier: {
        dpeHistory: [],
        revisionClause: true,
        revisionQuarter: "T2",
        rentHistory: [
          { type: "INITIAL", date: "2022-01-01", rentCents: 100000, source: "quittance" },
          { type: "REVISION", date: "2023-02-01", rentCents: 110000, source: "quittance" },
        ],
      },
      referentials: {
        irl: [
          { quarter: "2021-T2", value: 130, verified: false },
          { quarter: "2022-T2", value: 135, verified: false },
        ],
        shieldRatePct: 3.5,
      },
      asOf: "2024-02-01",
    };
    const r = evaluateIrlOvercharge(input);
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBeGreaterThan(0);
  });
});
