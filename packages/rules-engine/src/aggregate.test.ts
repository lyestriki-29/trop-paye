import { describe, it, expect } from "vitest";
import { evaluateAll } from "./aggregate";
import type { RuleInput } from "./types";

const mk = (dossier: Partial<RuleInput["dossier"]>, asOf: string, irl: RuleInput["referentials"]["irl"] = []): RuleInput => ({
  dossier: { dpeHistory: [], rentHistory: [], ...dossier },
  referentials: { irl, shieldRatePct: 3.5 },
  asOf,
});

describe("evaluateAll (agrégateur)", () => {
  it("agrège un trop-perçu DPE et expose le total", () => {
    const v = evaluateAll(
      mk(
        {
          dpeHistory: [{ class: "F", date: "2021-06-01", source: "ADEME_API" }],
          rentHistory: [
            { type: "INITIAL", date: "2022-01-01", rentCents: 85000, source: "quittance" },
            { type: "REVISION", date: "2023-09-01", rentCents: 89000, source: "quittance" },
          ],
        },
        "2024-09-01",
      ),
    );
    expect(v.outcome).toBe("IRREGULAR");
    expect(v.totalRecoverableCents).toBe(48000);
    expect(v.signals).toHaveLength(0);
  });

  it("ne compte jamais deux fois le même euro (DPE vs IRL sur la même hausse)", () => {
    const v = evaluateAll(
      mk(
        {
          dpeHistory: [{ class: "F", date: "2021-06-01", source: "ADEME_API" }],
          revisionClause: false,
          rentHistory: [
            { type: "INITIAL", date: "2022-01-01", rentCents: 100000, source: "quittance" },
            { type: "REVISION", date: "2023-09-01", rentCents: 110000, source: "quittance" },
          ],
        },
        "2024-09-01",
      ),
    );
    expect(v.totalRecoverableCents).toBe(120000); // pas 240000
    const irl = v.results.find((r) => r.ruleId === "IRL_OVERCHARGE")!;
    expect(irl.subsidiaryOf).toBe("DPE_FREEZE");
  });

  it("émet un signal d'orientation (non chiffré) quand un complément de loyer est déclaré", () => {
    const v = evaluateAll(
      mk(
        {
          dpeHistory: [{ class: "D", date: "2021-01-01", source: "ADEME_API" }],
          rentSupplementDeclared: true,
          rentSupplementCents: 15000,
          rentHistory: [
            { type: "INITIAL", date: "2023-01-01", rentCents: 90000, source: "quittance" },
          ],
        },
        "2024-06-01",
      ),
    );
    // Jamais chiffré : le complément n'entre pas dans le total recouvrable.
    expect(v.totalRecoverableCents).toBe(0);
    expect(v.signals.some((s) => s.includes("Complément de loyer"))).toBe(true);
  });

  it("pas de signal complément de loyer sans déclaration", () => {
    const v = evaluateAll(
      mk(
        {
          dpeHistory: [{ class: "D", date: "2021-01-01", source: "ADEME_API" }],
          rentHistory: [
            { type: "INITIAL", date: "2023-01-01", rentCents: 90000, source: "quittance" },
          ],
        },
        "2024-06-01",
      ),
    );
    expect(v.signals.some((s) => s.includes("Complément de loyer"))).toBe(false);
  });

  it("émet un signal d'orientation (non chiffré) pour un G loué après 2025", () => {
    const v = evaluateAll(
      mk(
        {
          dpeHistory: [{ class: "G", date: "2021-06-01", source: "ADEME_API" }],
          rentHistory: [{ type: "INITIAL", date: "2022-01-01", rentCents: 80000, source: "quittance" }],
        },
        "2025-06-01",
      ),
    );
    expect(v.outcome).toBe("COMPLIANT");
    expect(v.signals).toHaveLength(1);
    expect(v.signals[0]).toContain("décence");
  });

  it("tout conforme → COMPLIANT", () => {
    const v = evaluateAll(
      mk(
        {
          dpeHistory: [{ class: "D", date: "2021-01-01", source: "ADEME_API" }],
          revisionClause: true,
          revisionQuarter: "T2",
          rentHistory: [
            { type: "INITIAL", date: "2022-01-01", rentCents: 70000, source: "quittance" },
            { type: "REVISION", date: "2024-09-01", rentCents: 71000, source: "quittance" },
          ],
        },
        "2025-01-01",
        [
          { quarter: "2023-T2", value: 135.0, verified: false },
          { quarter: "2024-T2", value: 140.0, verified: false },
        ],
      ),
    );
    expect(v.outcome).toBe("COMPLIANT");
    expect(v.totalRecoverableCents).toBe(0);
  });
});
