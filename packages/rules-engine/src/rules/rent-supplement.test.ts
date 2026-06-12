import { describe, expect, it } from "vitest";
import type { DossierSnapshot, RuleInput, RuleResult, Signal } from "../types";
import { evaluateRentSupplement } from "./rent-supplement";

const REF = { irl: [], shieldRatePct: 3.5 };
const ASOF = "2026-06-12";

function input(dossier: Partial<DossierSnapshot>): RuleInput {
  return {
    asOf: ASOF,
    referentials: REF,
    dossier: {
      dpeHistory: [],
      rentHistory: [{ date: "2024-01-01", type: "INITIAL", rentCents: 100000, source: "déclaratif" }],
      ...dossier,
    },
  };
}

const isResult = (out: RuleResult | Signal[] | null): out is RuleResult =>
  out !== null && !Array.isArray(out);

describe("evaluateRentSupplement", () => {
  it("pas de complément déclaré → null", () => {
    expect(evaluateRentSupplement(input({}))).toBeNull();
    expect(evaluateRentSupplement(input({ rentSupplementDeclared: false }))).toBeNull();
  });

  it("F/G, bail post-2022, montant connu → chiffré (montant × mois, MEDIUM)", () => {
    const out = evaluateRentSupplement(
      input({
        rentSupplementDeclared: true,
        rentSupplementCents: 15000,
        leaseSignedAt: "2024-01-01",
        dpeHistory: [{ class: "F", date: "2023-12-01", source: "ADEME_API" }],
      }),
    );
    expect(isResult(out)).toBe(true);
    if (!isResult(out)) return;
    expect(out.outcome).toBe("IRREGULAR");
    expect(out.confidence).toBe("MEDIUM");
    expect(out.futureMonthlySavingCents).toBe(15000);
    // 2024-01 → 2026-06 inclus = 30 mois ; recoverable = 15000 × 30.
    expect(out.recoverableCents).toBe(15000 * 30);
  });

  it("interdit, montant inconnu → estimation 9 % du loyer + todoVerifier", () => {
    const out = evaluateRentSupplement(
      input({
        rentSupplementDeclared: true,
        leaseSignedAt: "2025-01-01",
        dpeHistory: [{ class: "G", date: "2024-06-01", source: "ADEME_API" }],
      }),
    );
    expect(isResult(out)).toBe(true);
    if (!isResult(out)) return;
    // 9 % de 100000 = 9000.
    expect(out.futureMonthlySavingCents).toBe(9000);
    expect(out.computation.todoVerifier?.length).toBeGreaterThan(0);
  });

  it("critère 3DS coché hors F/G → chiffré", () => {
    const out = evaluateRentSupplement(
      input({
        rentSupplementDeclared: true,
        rentSupplementCents: 12000,
        leaseSignedAt: "2024-03-01",
        complementCriteria: ["sanitaires_palier"],
        dpeHistory: [{ class: "D", date: "2024-01-01", source: "ADEME_API" }],
      }),
    );
    expect(isResult(out)).toBe(true);
    if (!isResult(out)) return;
    expect(out.outcome).toBe("IRREGULAR");
  });

  it("hors F/G sans critère, sans caractéristique exceptionnelle → signal prioritaire « injustifié »", () => {
    const out = evaluateRentSupplement(
      input({
        rentSupplementDeclared: true,
        leaseSignedAt: "2024-03-01",
        dpeHistory: [{ class: "C", date: "2024-01-01", source: "ADEME_API" }],
      }),
    );
    expect(Array.isArray(out)).toBe(true);
    if (!Array.isArray(out)) return;
    expect(out[0]?.priority).toBe(true);
    expect(out[0]?.message).toContain("injustifié");
  });

  it("hors F/G mais caractéristique exceptionnelle déclarée → signal non prioritaire", () => {
    const out = evaluateRentSupplement(
      input({
        rentSupplementDeclared: true,
        rentSupplementExceptional: true,
        leaseSignedAt: "2024-03-01",
        dpeHistory: [{ class: "C", date: "2024-01-01", source: "ADEME_API" }],
      }),
    );
    expect(Array.isArray(out)).toBe(true);
    if (!Array.isArray(out)) return;
    expect(out[0]?.priority).toBeFalsy();
  });

  it("bail antérieur au 18/08/2022 → pas d'interdiction (signal, non chiffré)", () => {
    const out = evaluateRentSupplement(
      input({
        rentSupplementDeclared: true,
        rentSupplementCents: 15000,
        leaseSignedAt: "2021-01-01",
        dpeHistory: [{ class: "F", date: "2020-06-01", source: "ADEME_API" }],
      }),
    );
    expect(Array.isArray(out)).toBe(true);
  });

  it("fenêtre bornée à 3 ans pour un bail ancien (post-pivot) interdit", () => {
    const out = evaluateRentSupplement(
      input({
        rentSupplementDeclared: true,
        rentSupplementCents: 10000,
        leaseSignedAt: "2022-09-01", // post-pivot, mais > 3 ans avant asOf
        dpeHistory: [{ class: "F", date: "2022-08-01", source: "ADEME_API" }],
      }),
    );
    expect(isResult(out)).toBe(true);
    if (!isResult(out)) return;
    // Prescription 3 ans : la fenêtre démarre à asOf − 3 ans (2023-06), pas à 2022-09.
    expect(out.recoverableCents).toBeLessThanOrEqual(10000 * 37);
    expect(out.recoverableCents).toBeGreaterThanOrEqual(10000 * 36);
  });
});
