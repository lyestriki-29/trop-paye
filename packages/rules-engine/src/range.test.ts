import { describe, expect, it } from "vitest";
import { evaluateRange, evaluateSnapshotRange } from "./range";
import type { DossierSnapshot, RuleInput } from "./types";

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

describe("evaluateSnapshotRange — hypothèse complément", () => {
  const ref = { irl: [], shieldRatePct: 3.5 };
  // Logement F/G (complément interdit), bail post-pivot, montant complément inconnu.
  const fgSnapshot: DossierSnapshot = {
    dpeHistory: [{ class: "F", date: "2023-12-01", source: "ADEME_API" }],
    rentHistory: [{ date: "2024-01-01", type: "INITIAL", rentCents: 100000, source: "déclaratif" }],
    leaseSignedAt: "2024-01-01",
  };

  it("complément NSP sur F/G → fourchette : bas sans complément, haut avec estimation 9 %", () => {
    const r = evaluateSnapshotRange({ ...fgSnapshot, rentSupplementUncertain: true }, ref, "2026-06-12");
    expect(r.totalRecoverableLowCents).toBe(0);
    expect(r.totalRecoverableHighCents).toBeGreaterThan(0);
    expect(r.isRange).toBe(true);
  });

  it("complément OUI déclaré sur F/G → bas sans, haut avec (fourchette)", () => {
    const r = evaluateSnapshotRange(
      { ...fgSnapshot, rentSupplementDeclared: true, rentSupplementCents: 12000 },
      ref,
      "2026-06-12",
    );
    expect(r.totalRecoverableLowCents).toBe(0);
    expect(r.totalRecoverableHighCents).toBeGreaterThan(0);
  });

  it("complément NON (ni déclaré ni incertain) → pas de fourchette sur le complément", () => {
    const r = evaluateSnapshotRange(fgSnapshot, ref, "2026-06-12");
    expect(r.totalRecoverableLowCents).toBe(r.totalRecoverableHighCents);
    expect(r.isRange).toBe(false);
  });

  it("complément incertain mais logement NON F/G → pas chiffré, pas de fourchette", () => {
    const r = evaluateSnapshotRange(
      {
        dpeHistory: [{ class: "C", date: "2023-12-01", source: "ADEME_API" }],
        rentHistory: [{ date: "2024-01-01", type: "INITIAL", rentCents: 100000, source: "déclaratif" }],
        leaseSignedAt: "2024-01-01",
        rentSupplementUncertain: true,
      },
      ref,
      "2026-06-12",
    );
    expect(r.totalRecoverableLowCents).toBe(r.totalRecoverableHighCents);
  });
});
