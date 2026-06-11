import { describe, it, expect } from "vitest";
import { evaluateAll } from "../aggregate";
import type { RuleInput } from "../types";

const mk = (dossier: Partial<RuleInput["dossier"]>): RuleInput => ({
  dossier: { dpeHistory: [], rentHistory: [], ...dossier },
  referentials: { irl: [], shieldRatePct: 3.5 },
  asOf: "2024-09-01",
});

describe("Boosters signaux (FORBIDDEN_FEES, CHARGES_REVIEW) — jamais chiffrés", () => {
  it("FORBIDDEN_FEES : items cochés → signal de revue, total à 0", () => {
    const v = evaluateAll(mk({ forbiddenFees: ["quittance_facturee", "penalites_retard"] }));
    expect(v.totalRecoverableCents).toBe(0);
    expect(v.signals.some((s) => s.includes("Frais potentiellement abusifs"))).toBe(true);
  });

  it("FORBIDDEN_FEES : liste vide → aucun signal", () => {
    const v = evaluateAll(mk({ forbiddenFees: [] }));
    expect(v.signals.some((s) => s.includes("Frais potentiellement abusifs"))).toBe(false);
  });

  it("CHARGES_REVIEW : items cochés → signal de revue, total à 0", () => {
    const v = evaluateAll(mk({ chargesReviewItems: ["taxe_fonciere"] }));
    expect(v.totalRecoverableCents).toBe(0);
    expect(v.signals.some((s) => s.includes("Régularisation de charges"))).toBe(true);
  });

  it("aucun item booster → aucun signal booster", () => {
    const v = evaluateAll(mk({}));
    expect(v.signals).toHaveLength(0);
  });
});
