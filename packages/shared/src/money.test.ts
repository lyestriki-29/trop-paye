import { describe, it, expect } from "vitest";
import { eurosToCents, centsToEuros, formatEUR } from "./money";

const norm = (s: string) => s.replace(/ | /g, " ");

describe("money", () => {
  it("convertit euros <-> centimes", () => {
    expect(eurosToCents(14.37)).toBe(1437);
    expect(centsToEuros(1437)).toBe(14.37);
  });

  it("formate un montant rond sans décimales", () => {
    expect(norm(formatEUR(143700))).toBe("1 437 €");
  });

  it("formate un montant non rond avec décimales", () => {
    expect(norm(formatEUR(143750))).toBe("1 437,50 €");
  });

  it("force les décimales quand demandé", () => {
    expect(norm(formatEUR(143700, { decimals: true }))).toBe("1 437,00 €");
  });
});
