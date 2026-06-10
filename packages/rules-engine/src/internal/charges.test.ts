import { describe, it, expect } from "vitest";
import {
  CHARGES_ESTIMATE_EUR_PER_M2_CENTS,
  ccToHcCents,
  estimateMonthlyChargesCents,
} from "./charges";

describe("ccToHcCents", () => {
  it("convertit exactement en centimes (CC − charges)", () => {
    expect(ccToHcCents(102_185, 12_000)).toBe(90_185);
    expect(ccToHcCents(100_000, 1)).toBe(99_999);
  });

  it("charges = 0 → HC = CC (mode CC sans charges)", () => {
    expect(ccToHcCents(95_000, 0)).toBe(95_000);
  });

  it("charges ≥ CC → invalide (null)", () => {
    expect(ccToHcCents(80_000, 80_000)).toBeNull();
    expect(ccToHcCents(80_000, 80_001)).toBeNull();
  });

  it("montants non valides → null (CC ≤ 0, charges < 0, non entiers)", () => {
    expect(ccToHcCents(0, 0)).toBeNull();
    expect(ccToHcCents(-100, 0)).toBeNull();
    expect(ccToHcCents(100_000, -1)).toBeNull();
    expect(ccToHcCents(100_000.5, 0)).toBeNull();
    expect(ccToHcCents(100_000, 0.5)).toBeNull();
  });
});

describe("estimateMonthlyChargesCents", () => {
  it("estime au barème 2,50 €/m²/mois (TODO_VERIFIER)", () => {
    expect(CHARGES_ESTIMATE_EUR_PER_M2_CENTS).toBe(250);
    expect(estimateMonthlyChargesCents(45)).toBe(11_250);
    expect(estimateMonthlyChargesCents(20)).toBe(5_000);
  });

  it("arrondit au centime entier (surfaces décimales)", () => {
    expect(estimateMonthlyChargesCents(33.3)).toBe(8_325);
    expect(estimateMonthlyChargesCents(33.333)).toBe(8_333);
  });
});
