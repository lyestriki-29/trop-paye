import { describe, expect, it } from "vitest";
import { evaluateRange } from "./range";
import type { RuleInput } from "./types";

// Snapshot minimal : un retard de dépôt clair (chiffré HIGH, identique bas/haut).
const baseReferentials = { irl: [], shieldRatePct: 3.5 };
function depositInput(monthlyRentCents: number): RuleInput {
  return {
    asOf: "2026-06-12",
    referentials: baseReferentials,
    dossier: {
      dpeHistory: [],
      rentHistory: [{ date: "2024-01-01", type: "INITIAL", rentCents: monthlyRentCents, source: "déclaratif" }],
      deposit: {
        depositCents: monthlyRentCents,
        leaveDate: "2026-01-10",
        edlConforme: true,
        monthlyRentCents,
      },
    },
  };
}

describe("evaluateRange", () => {
  it("bas == haut quand les deux inputs sont identiques → pas de fourchette", () => {
    const input = depositInput(80000);
    const range = evaluateRange(input, input);
    expect(range.totalRecoverableLowCents).toBe(range.totalRecoverableHighCents);
    expect(range.isRange).toBe(false);
    expect(range.futureMonthlySavingCents).toBe(range.low.totalFutureMonthlySavingCents);
  });

  it("compose min/haut même si les inputs sont fournis à l'envers (garde-fou)", () => {
    const low = depositInput(80000); // dépôt plus petit → recouvrable plus faible
    const high = depositInput(120000);
    const swapped = evaluateRange(high, low); // volontairement inversés
    expect(swapped.totalRecoverableLowCents).toBeLessThanOrEqual(swapped.totalRecoverableHighCents);
    expect(swapped.isRange).toBe(true);
  });

  it("fourchette réelle : bas exclut une estimation que haut inclut", () => {
    // bas = dépôt à 0 (NSP neutralisé), haut = dépôt déclaré.
    const high = depositInput(100000);
    const low: RuleInput = {
      ...high,
      dossier: { ...high.dossier, deposit: undefined },
    };
    const range = evaluateRange(low, high);
    expect(range.totalRecoverableLowCents).toBeLessThan(range.totalRecoverableHighCents);
    expect(range.isRange).toBe(true);
    // Les deux bornes gardent leur audit trail.
    expect(range.high.results.length).toBeGreaterThan(0);
  });
});
