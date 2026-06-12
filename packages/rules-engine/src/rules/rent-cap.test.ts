import { describe, it, expect } from "vitest";
import { evaluateRentCap } from "./rent-cap";
import type { RentControlReference, RentEvent, RuleInput } from "../types";

const INITIAL = (rentCents: number, date = "2024-06-01"): RentEvent => ({
  type: "INITIAL",
  date,
  rentCents,
  source: "déclaratif",
});

// Référence de test : loyer de référence majoré 32,90 €/m² = 3290 c/m² (millésime 2025).
const REF = (over: Partial<RentControlReference> = {}): RentControlReference => ({
  capPerM2Cents: 3290,
  refPerM2Cents: 2740,
  minPerM2Cents: 1920,
  millesime: 2025,
  effectiveFrom: "2019-07-01",
  zoneLabel: "Secteur 5",
  periodLabel: "1946-1970",
  rooms: 2,
  furnished: false,
  ...over,
});

const mk = (
  dossier: Partial<RuleInput["dossier"]>,
  asOf = "2025-06-01",
  rentControl: RentControlReference | undefined = REF(),
): RuleInput => ({
  dossier: {
    dpeHistory: [],
    rentHistory: [INITIAL(110000)],
    surfaceM2: 30,
    leaseSignedAt: "2024-06-01",
    ...dossier,
  },
  referentials: { irl: [], shieldRatePct: 3.5, rentControl },
  asOf,
});

describe("ENCADREMENT (loyer de référence majoré)", () => {
  it("référence absente → null (règle inerte hors zone d'encadrement)", () => {
    // Input construit sans rentControl (passer undefined à mk() retomberait sur
    // le défaut REF() à cause du paramètre par défaut).
    expect(
      evaluateRentCap({
        dossier: { dpeHistory: [], rentHistory: [INITIAL(110000)], surfaceM2: 30, leaseSignedAt: "2024-06-01" },
        referentials: { irl: [], shieldRatePct: 3.5 },
        asOf: "2025-06-01",
      }),
    ).toBeNull();
  });

  it("loyer sous le plafond → conforme, 0 récupérable", () => {
    // 30 m² × 32,90 €/m² = 987 € de plafond ; loyer 950 €.
    const r = evaluateRentCap(mk({ rentHistory: [INITIAL(95000)] }));
    expect(r?.outcome).toBe("COMPLIANT");
    expect(r?.recoverableCents).toBe(0);
    expect(r?.futureMonthlySavingCents).toBe(0);
  });

  it("loyer au-dessus du plafond → excédent récupérable + baisse future, MEDIUM", () => {
    // plafond 98700 ; loyer 110000 → excédent 11300/mois.
    // bail 2024-06-01 → asOf 2025-06-01 = 13 mensualités.
    const r = evaluateRentCap(mk({}));
    expect(r?.outcome).toBe("IRREGULAR");
    expect(r?.futureMonthlySavingCents).toBe(11300);
    expect(r?.recoverableCents).toBe(11300 * 13);
    expect(r?.confidence).toBe("MEDIUM");
  });

  it("surface inconnue → null (plafond incalculable)", () => {
    expect(evaluateRentCap(mk({ surfaceM2: undefined }))).toBeNull();
  });

  it("aucun loyer courant connu → null", () => {
    expect(evaluateRentCap(mk({ rentHistory: [] }))).toBeNull();
  });

  it("fenêtre bornée par la date d'effet de l'encadrement", () => {
    // bail 2015 mais encadrement depuis 2019-07-01 ; asOf 2020-06-01.
    // fenêtre = [2019-07-01, 2020-06-01] = 12 mensualités (pas depuis 2015).
    const r = evaluateRentCap(
      mk(
        { leaseSignedAt: "2015-01-01", rentHistory: [INITIAL(110000, "2015-01-01")] },
        "2020-06-01",
        REF({ effectiveFrom: "2019-07-01", millesime: 2020 }),
      ),
    );
    expect(r?.recoverableCents).toBe(11300 * 12);
  });

  it("prescription : récupérable plafonné à 36 mensualités", () => {
    // bail 2015, asOf 2025-06-01 → prescription 3 ans domine → 36 mois max.
    const r = evaluateRentCap(
      mk(
        { leaseSignedAt: "2015-01-01", rentHistory: [INITIAL(110000, "2015-01-01")] },
        "2025-06-01",
      ),
    );
    expect(r?.recoverableCents).toBe(11300 * 36);
  });

  it("sans date de bail → occupation déduite du loyer initial", () => {
    const r = evaluateRentCap(
      mk({ leaseSignedAt: undefined, rentHistory: [INITIAL(110000, "2024-06-01")] }),
    );
    expect(r?.recoverableCents).toBe(11300 * 13);
  });

  it("audit trail + valeur réglementaire signalée (todoVerifier)", () => {
    const r = evaluateRentCap(mk({}));
    expect(r?.computation.steps.length).toBeGreaterThan(0);
    expect(r?.computation.todoVerifier?.length).toBeGreaterThan(0);
    expect(r?.legalBasis).toMatch(/encadrement/i);
  });
});
