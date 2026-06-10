import { describe, it, expect } from "vitest";
import { evaluateIrlOvercharge } from "./irl-overcharge";
import type {
  IrlIndexEntry,
  RentEvent,
  RentEventType,
  RentSource,
  RuleInput,
} from "../types";

const rent = (
  type: RentEventType,
  date: string,
  rentCents: number,
  source: RentSource = "quittance",
): RentEvent => ({ type, date, rentCents, source });

const irl = (quarter: string, value: number, verified = true): IrlIndexEntry => ({
  quarter,
  value,
  verified,
});

const mk = (
  dossier: Partial<RuleInput["dossier"]>,
  asOf: string,
  irlEntries: IrlIndexEntry[] = [],
): RuleInput => ({
  dossier: { dpeHistory: [], rentHistory: [], ...dossier },
  referentials: { irl: irlEntries, shieldRatePct: 3.5 },
  asOf,
});

describe("IRL_OVERCHARGE", () => {
  it("1. sans clause de révision → toute hausse est indue en totalité", () => {
    const r = evaluateIrlOvercharge(
      mk(
        {
          revisionClause: false,
          rentHistory: [rent("INITIAL", "2022-01-01", 100000), rent("REVISION", "2023-09-01", 105000)],
        },
        "2024-09-01",
      ),
    );
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBe(60000); // 12 × 50 €
    expect(r.futureMonthlySavingCents).toBe(5000);
    expect(r.confidence).toBe("HIGH");
  });

  it("2. dépassement de l'IRL (hors bouclier) → indu = paid − plafond IRL (arrondi)", () => {
    const r = evaluateIrlOvercharge(
      mk(
        {
          revisionClause: true,
          revisionQuarter: "T2",
          rentHistory: [rent("INITIAL", "2022-01-01", 100000), rent("REVISION", "2024-09-01", 110000)],
        },
        "2025-09-01",
        [irl("2023-T2", 135.0), irl("2024-T2", 140.0)],
      ),
    );
    // plafond = round(100000 × 140 / 135) = 103704
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.futureMonthlySavingCents).toBe(6296);
    expect(r.recoverableCents).toBe(75552); // 12 × 62,96 €
  });

  it("3. révision conforme à l'IRL → COMPLIANT", () => {
    const r = evaluateIrlOvercharge(
      mk(
        {
          revisionClause: true,
          revisionQuarter: "T2",
          rentHistory: [rent("INITIAL", "2022-01-01", 100000), rent("REVISION", "2024-09-01", 102000)],
        },
        "2025-09-01",
        [irl("2023-T2", 135.0), irl("2024-T2", 140.0)],
      ),
    );
    expect(r.outcome).toBe("COMPLIANT");
    expect(r.recoverableCents).toBe(0);
  });

  it("4. bouclier 3,5 % : plafonne quand l'IRL autoriserait davantage (dans la fenêtre)", () => {
    const r = evaluateIrlOvercharge(
      mk(
        {
          revisionClause: true,
          revisionQuarter: "T2",
          rentHistory: [rent("INITIAL", "2022-01-01", 100000), rent("REVISION", "2023-01-01", 106000)],
        },
        "2024-01-01",
        [irl("2022-T2", 135.0), irl("2023-T2", 145.0)],
      ),
    );
    // IRL autoriserait round(100000×145/135)=107407, mais bouclier = 103500
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.futureMonthlySavingCents).toBe(2500); // 106000 − 103500
    expect(r.recoverableCents).toBe(30000); // 12 × 25 €
  });

  it("5. bouclier NON appliqué après le T1 2024", () => {
    const r = evaluateIrlOvercharge(
      mk(
        {
          revisionClause: true,
          revisionQuarter: "T2",
          rentHistory: [rent("INITIAL", "2022-01-01", 100000), rent("REVISION", "2024-09-01", 110000)],
        },
        "2025-09-01",
        [irl("2023-T2", 135.0), irl("2024-T2", 145.0)],
      ),
    );
    // plafond IRL = round(100000×145/135)=107407 (pas de plafonnement à 103500)
    expect(r.futureMonthlySavingCents).toBe(2593); // 110000 − 107407
  });

  it("6. arrondi au centime de l'application de l'IRL", () => {
    const r = evaluateIrlOvercharge(
      mk(
        {
          revisionClause: true,
          revisionQuarter: "T2",
          rentHistory: [rent("INITIAL", "2022-01-01", 95000), rent("REVISION", "2024-09-01", 100000)],
        },
        "2024-10-01",
        [irl("2023-T2", 130.0), irl("2024-T2", 134.0)],
      ),
    );
    // plafond = round(95000 × 134 / 130) = round(97923.0769) = 97923
    expect(r.recoverableCents).toBe(2077); // 1 mois × 20,77 €
    expect(r.futureMonthlySavingCents).toBe(2077);
  });

  it("7. IRL manquant pour la période → INSUFFICIENT_DATA(irl)", () => {
    const r = evaluateIrlOvercharge(
      mk(
        {
          revisionClause: true,
          revisionQuarter: "T2",
          rentHistory: [rent("INITIAL", "2022-01-01", 100000), rent("REVISION", "2024-09-01", 110000)],
        },
        "2025-09-01",
        [],
      ),
    );
    expect(r.outcome).toBe("INSUFFICIENT_DATA");
    expect(r.missingData).toEqual(["irl"]);
  });

  it("8. aucune révision → COMPLIANT", () => {
    const r = evaluateIrlOvercharge(
      mk({ rentHistory: [rent("INITIAL", "2022-01-01", 100000)] }, "2024-01-01"),
    );
    expect(r.outcome).toBe("COMPLIANT");
    expect(r.confidence).toBe("HIGH");
  });

  it("9. clause présente mais trimestre de référence inconnu → INSUFFICIENT_DATA(revisionQuarter)", () => {
    const r = evaluateIrlOvercharge(
      mk(
        {
          revisionClause: true,
          rentHistory: [rent("INITIAL", "2022-01-01", 100000), rent("REVISION", "2024-09-01", 110000)],
        },
        "2025-09-01",
        [irl("2023-T2", 135.0), irl("2024-T2", 140.0)],
      ),
    );
    expect(r.outcome).toBe("INSUFFICIENT_DATA");
    expect(r.missingData).toEqual(["revisionQuarter"]);
  });
});
