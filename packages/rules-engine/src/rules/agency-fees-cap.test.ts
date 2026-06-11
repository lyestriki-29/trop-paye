import { describe, it, expect } from "vitest";
import { evaluateAgencyFeesCap } from "./agency-fees-cap";
import type { AgencyFeeReferential, RentEvent, RuleInput } from "../types";

const INITIAL = (rentCents: number): RentEvent => ({
  type: "INITIAL",
  date: "2023-01-01",
  rentCents,
  source: "déclaratif",
});

// Plafonds de test (TODO_VERIFIER réels ailleurs) : 12 / 10 / 8 €/m² + 3 €/m² EDL.
const AGENCY: AgencyFeeReferential = {
  capsByZone: {
    TRES_TENDUE: { feePerM2Cents: 1200, edlPerM2Cents: 300 },
    TENDUE: { feePerM2Cents: 1000, edlPerM2Cents: 300 },
    RESTE: { feePerM2Cents: 800, edlPerM2Cents: 300 },
  },
  zoneByInsee: { "75056": "TRES_TENDUE" },
};

const mk = (dossier: Partial<RuleInput["dossier"]>, asOf = "2024-09-01"): RuleInput => ({
  // leaseSignedAt par défaut : sans date de bail, la règle ne chiffre plus
  // (prescription inétablissable — durcissement revue 2026-06-12).
  dossier: {
    dpeHistory: [],
    rentHistory: [INITIAL(90000)],
    inseeCode: "75056",
    surfaceM2: 30,
    leaseSignedAt: "2023-01-01",
    ...dossier,
  },
  referentials: { irl: [], shieldRatePct: 3.5, agencyFees: AGENCY },
  asOf,
});

describe("AGENCY_FEES_CAP (plafond honoraires d'agence)", () => {
  it("sous le plafond → 0 (conforme)", () => {
    // 30 m² × 12 €/m² = 360 € de plafond ; payé 300 €.
    const r = evaluateAgencyFeesCap(mk({ agencyFeesPaidCents: 30000 }));
    expect(r?.outcome).toBe("COMPLIANT");
    expect(r?.recoverableCents).toBe(0);
  });

  it("au-dessus du plafond → excédent récupérable, MEDIUM", () => {
    // plafond 36000 ; payé 50000 → excédent 14000.
    const r = evaluateAgencyFeesCap(mk({ agencyFeesPaidCents: 50000 }));
    expect(r?.outcome).toBe("IRREGULAR");
    expect(r?.recoverableCents).toBe(14000);
    expect(r?.confidence).toBe("MEDIUM");
  });

  it("état des lieux facturé au-dessus du plafond → ajouté à l'excédent", () => {
    // EDL plafond = 30 × 3 = 9000 ; payé 12000 → +3000.
    const r = evaluateAgencyFeesCap(mk({ agencyFeesPaidCents: 36000, edlFeesPaidCents: 12000 }));
    expect(r?.recoverableCents).toBe(3000);
  });

  it("honoraires non déclarés → cas non évalué (null)", () => {
    expect(evaluateAgencyFeesCap(mk({}))).toBeNull();
  });

  it("zone introuvable (INSEE hors référentiel) → null", () => {
    expect(evaluateAgencyFeesCap(mk({ inseeCode: "99999", agencyFeesPaidCents: 50000 }))).toBeNull();
  });

  it("surface inconnue → null (plafond incalculable)", () => {
    expect(
      evaluateAgencyFeesCap(mk({ surfaceM2: undefined, agencyFeesPaidCents: 50000 })),
    ).toBeNull();
  });

  it("référentiel absent → null (règle inerte)", () => {
    const r = evaluateAgencyFeesCap({
      dossier: { dpeHistory: [], rentHistory: [INITIAL(90000)], inseeCode: "75056", surfaceM2: 30, agencyFeesPaidCents: 50000 },
      referentials: { irl: [], shieldRatePct: 3.5 },
      asOf: "2024-09-01",
    });
    expect(r).toBeNull();
  });

  it("bail prescrit (> 3 ans) → null (non chiffré)", () => {
    const r = evaluateAgencyFeesCap(
      mk({ leaseSignedAt: "2020-01-01", agencyFeesPaidCents: 50000 }, "2024-09-01"),
    );
    expect(r).toBeNull();
  });

  it("bail sans date → null (prescription inétablissable, revue 2026-06-12)", () => {
    const r = evaluateAgencyFeesCap(
      mk({ leaseSignedAt: undefined, agencyFeesPaidCents: 50000 }),
    );
    expect(r).toBeNull();
  });

  it("agencyUsed=false (champ honoraires fantôme) → null : garde miroir, pas de double comptage", () => {
    const r = evaluateAgencyFeesCap(mk({ agencyUsed: false, agencyFeesPaidCents: 50000 }));
    expect(r).toBeNull();
  });

  it("état des lieux facturé SEUL → évalué (plus d'angle mort silencieux)", () => {
    // EDL plafond = 30 × 3 = 9000 ; payé 12000 → excédent 3000, sans honoraires saisis.
    const r = evaluateAgencyFeesCap(mk({ edlFeesPaidCents: 12000 }));
    expect(r?.outcome).toBe("IRREGULAR");
    expect(r?.recoverableCents).toBe(3000);
  });
});
