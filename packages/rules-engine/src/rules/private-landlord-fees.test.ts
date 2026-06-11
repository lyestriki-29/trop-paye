import { describe, it, expect } from "vitest";
import { evaluatePrivateLandlordFees } from "./private-landlord-fees";
import type { RentEvent, RuleInput } from "../types";

const INITIAL: RentEvent = {
  type: "INITIAL",
  date: "2023-01-01",
  rentCents: 90000,
  source: "déclaratif",
};

const mk = (dossier: Partial<RuleInput["dossier"]>, asOf = "2024-09-01"): RuleInput => ({
  // leaseSignedAt par défaut : sans date de bail, plus de chiffrage (revue 2026-06-12).
  dossier: { dpeHistory: [], rentHistory: [INITIAL], leaseSignedAt: "2023-01-01", ...dossier },
  referentials: { irl: [], shieldRatePct: 3.5 },
  asOf,
});

describe("PRIVATE_LANDLORD_FEES (frais d'un bailleur particulier)", () => {
  it("frais facturés par un particulier → récupérables en intégralité, MEDIUM", () => {
    const r = evaluatePrivateLandlordFees(mk({ privateLandlordFeesPaidCents: 25000 }));
    expect(r?.outcome).toBe("IRREGULAR");
    expect(r?.recoverableCents).toBe(25000);
    expect(r?.confidence).toBe("MEDIUM");
  });

  it("frais non déclarés → cas non évalué (null)", () => {
    expect(evaluatePrivateLandlordFees(mk({}))).toBeNull();
  });

  it("location via une agence → null (couvert par AGENCY_FEES_CAP, pas de double comptage)", () => {
    const r = evaluatePrivateLandlordFees(
      mk({ agencyUsed: true, privateLandlordFeesPaidCents: 25000 }),
    );
    expect(r).toBeNull();
  });

  it("bail prescrit (> 3 ans) → null (non chiffré)", () => {
    const r = evaluatePrivateLandlordFees(
      mk({ leaseSignedAt: "2020-01-01", privateLandlordFeesPaidCents: 25000 }, "2024-09-01"),
    );
    expect(r).toBeNull();
  });

  it("bail sans date → null (prescription inétablissable, revue 2026-06-12)", () => {
    const r = evaluatePrivateLandlordFees(
      mk({ leaseSignedAt: undefined, privateLandlordFeesPaidCents: 25000 }),
    );
    expect(r).toBeNull();
  });
});
