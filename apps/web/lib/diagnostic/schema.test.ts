import { describe, it, expect } from "vitest";
import { diagnosticSchema, toSnapshot } from "./schema";

const ASOF = "2024-09-01";
const base = {
  addressLabel: "12 rue des Tests, Paris",
  leaseSignedAt: "2022-01-01",
  initialRentCents: 80000,
  currentRentCents: 90000,
  revisions: [{ date: "2023-01-01", rentCents: 85000 }],
  depositPaidCents: 80000,
};

const snapshot = (extra: Record<string, unknown> = {}) =>
  toSnapshot(diagnosticSchema.parse({ ...base, ...extra }), ASOF);

describe("toSnapshot — colocation (LOT 1.3)", () => {
  it("hors coloc : aucun flag de reconstitution, montants bruts", () => {
    const s = snapshot();
    expect(s.rentReconstructedFromShare).toBeUndefined();
    expect(s.rentHistory.find((r) => r.type === "INITIAL")?.rentCents).toBe(80000);
    expect(s.depositPaidCents).toBe(80000);
  });

  it("non-régression : isShared + base TOTAL → snapshot identique au hors-coloc (bit à bit)", () => {
    const ref = snapshot();
    const total = snapshot({ isShared: true, tenantCount: 3, rentBasis: "TOTAL" });
    expect(total).toEqual(ref);
  });

  it("saisie « ma part », n=3 : loyers reconstitués × 3, dépôt INCHANGÉ (total unique), flag posé", () => {
    const s = snapshot({ isShared: true, tenantCount: 3, rentBasis: "SHARE" });
    expect(s.rentReconstructedFromShare).toBe(true);
    expect(s.rentHistory.find((r) => r.type === "INITIAL")?.rentCents).toBe(240000);
    expect(
      s.rentHistory.find((r) => r.type === "REVISION" && r.date === "2023-01-01")?.rentCents,
    ).toBe(255000);
    // Le dépôt est un montant unique pour le logement → jamais × n (cf. revue).
    expect(s.depositPaidCents).toBe(80000);
  });

  it("filtre les ids de critères 3DS inconnus (anti-payload forgé)", () => {
    const s = snapshot({ rentSupplement: "OUI", complementCriteria: ["humidite_murs", "x_forge"] });
    expect(s.complementCriteria).toEqual(["humidite_murs"]);
  });

  it("caractéristique exceptionnelle : OUI → true ; NON → false ; sans complément → undefined", () => {
    expect(
      snapshot({ rentSupplement: "OUI", rentSupplementExceptional: "OUI" })
        .rentSupplementExceptional,
    ).toBe(true);
    expect(
      snapshot({ rentSupplement: "OUI", rentSupplementExceptional: "NON" })
        .rentSupplementExceptional,
    ).toBe(false);
    // Pas de complément déclaré → champ ignoré même si fourni.
    expect(
      snapshot({ rentSupplement: "NON", rentSupplementExceptional: "OUI" })
        .rentSupplementExceptional,
    ).toBeUndefined();
  });

  it("« ma part » sans nombre de colocataires → refus zod", () => {
    expect(diagnosticSchema.safeParse({ ...base, rentBasis: "SHARE" }).success).toBe(false);
  });
});
