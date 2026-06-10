import { describe, it, expect } from "vitest";
import { evaluateDpeFreeze } from "./dpe-freeze";
import type {
  DpeClass,
  DpeRecord,
  DpeSource,
  RentEvent,
  RentEventType,
  RentSource,
  RuleInput,
} from "../types";

const dpe = (
  cls: DpeClass,
  date: string,
  source: DpeSource = "ADEME_API",
  surfaceM2?: number,
): DpeRecord => ({ class: cls, date, source, ...(surfaceM2 != null ? { surfaceM2 } : {}) });

const rent = (
  type: RentEventType,
  date: string,
  rentCents: number,
  source: RentSource = "quittance",
): RentEvent => ({ type, date, rentCents, source });

const mk = (
  dossier: Partial<RuleInput["dossier"]>,
  asOf: string,
): RuleInput => ({
  dossier: { dpeHistory: [], rentHistory: [], ...dossier },
  referentials: { irl: [], shieldRatePct: 3.5 },
  asOf,
});

describe("DPE_FREEZE", () => {
  it("loyers HC estimés depuis CC → confiance plafonnée à MEDIUM + ligne d'audit", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          rentEstimated: true,
          dpeHistory: [dpe("D", "2021-06-01")],
          rentHistory: [rent("INITIAL", "2022-01-01", 100000)],
        },
        "2024-09-01",
      ),
    );
    // Sans le drapeau, « aucune augmentation illégale » conclut en HIGH.
    expect(r.outcome).toBe("COMPLIANT");
    expect(r.confidence).toBe("MEDIUM");
    expect(r.computation.steps.map((s) => s.label)).toContain(
      "Loyers hors charges estimés depuis des montants charges comprises",
    );
  });

  it("1. logement non-F/G avec hausse → COMPLIANT", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("D", "2021-06-01")],
          rentHistory: [rent("INITIAL", "2022-01-01", 100000), rent("REVISION", "2023-09-01", 105000)],
        },
        "2024-09-01",
      ),
    );
    expect(r.outcome).toBe("COMPLIANT");
    expect(r.recoverableCents).toBe(0);
  });

  it("2. DPE inconnu → INSUFFICIENT_DATA(dpe)", () => {
    const r = evaluateDpeFreeze(
      mk({ rentHistory: [rent("INITIAL", "2022-01-01", 100000)] }, "2024-01-01"),
    );
    expect(r.outcome).toBe("INSUFFICIENT_DATA");
    expect(r.missingData).toEqual(["dpe"]);
    expect(r.confidence).toBe("LOW");
  });

  it("3. F + hausse post-2022 → trop-perçu + économie future, confiance HIGH", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("F", "2021-06-01", "ADEME_API")],
          rentHistory: [
            rent("INITIAL", "2022-01-01", 100000),
            rent("REVISION", "2023-09-01", 105000, "quittance"),
          ],
        },
        "2024-09-01",
      ),
    );
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBe(60000); // 12 mois × 50 €
    expect(r.futureMonthlySavingCents).toBe(5000);
    expect(r.confidence).toBe("HIGH");
    expect(r.actionDeadline).toBe("2026-09-01");
  });

  it("4. prescription : seuls 3 ans glissants sont récupérables", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("F", "2021-06-01")],
          rentHistory: [
            rent("INITIAL", "2021-12-01", 100000),
            rent("REVISION", "2022-09-01", 105000),
          ],
        },
        "2026-09-01",
      ),
    );
    expect(r.recoverableCents).toBe(180000); // 36 mois × 50 €
    expect(r.futureMonthlySavingCents).toBe(5000);
  });

  it("5. dégel : un DPE ≤ E postérieur arrête le gel", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("F", "2021-06-01"), dpe("D", "2023-07-01")],
          rentHistory: [
            rent("INITIAL", "2022-06-01", 100000),
            rent("REVISION", "2023-01-01", 106000),
          ],
        },
        "2024-01-01",
      ),
    );
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBe(36000); // 6 mois × 60 €
    expect(r.futureMonthlySavingCents).toBe(0);
  });

  it("6. plusieurs DPE à la même adresse, surface non concordante → INSUFFICIENT_DATA(dpe_surface)", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [
            dpe("F", "2021-06-01", "ADEME_API", 40),
            dpe("D", "2021-06-01", "ADEME_API", 80),
          ],
          rentHistory: [
            rent("INITIAL", "2022-01-01", 100000),
            rent("REVISION", "2023-09-01", 105000),
          ],
        },
        "2024-09-01",
      ),
    );
    expect(r.outcome).toBe("INSUFFICIENT_DATA");
    expect(r.missingData).toEqual(["dpe_surface"]);
  });

  it("7. relocation : comparaison au loyer du précédent locataire", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("F", "2021-06-01")],
          previousTenantRentCents: 100000,
          rentHistory: [rent("RELOCATION", "2023-03-01", 120000, "bail")],
        },
        "2024-03-01",
      ),
    );
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBe(240000); // 12 mois × 200 €
    expect(r.futureMonthlySavingCents).toBe(20000);
    expect(r.confidence).toBe("MEDIUM");
  });

  it("8. relocation sans loyer précédent → INSUFFICIENT_DATA(previousTenantRent)", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("F", "2021-06-01")],
          rentHistory: [rent("RELOCATION", "2023-03-01", 120000)],
        },
        "2024-03-01",
      ),
    );
    expect(r.outcome).toBe("INSUFFICIENT_DATA");
    expect(r.missingData).toEqual(["previousTenantRent"]);
  });

  it("9. classe E à la date de la hausse (F seulement plus tard) → COMPLIANT", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("E", "2021-01-01"), dpe("F", "2024-01-01")],
          rentHistory: [
            rent("INITIAL", "2022-01-01", 100000),
            rent("REVISION", "2023-01-01", 105000),
          ],
        },
        "2024-06-01",
      ),
    );
    expect(r.outcome).toBe("COMPLIANT");
    expect(r.recoverableCents).toBe(0);
  });

  it("10. hausse antérieure au 24/08/2022 → COMPLIANT", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("F", "2021-01-01")],
          rentHistory: [
            rent("INITIAL", "2021-01-01", 100000),
            rent("REVISION", "2022-03-01", 105000),
          ],
        },
        "2024-01-01",
      ),
    );
    expect(r.outcome).toBe("COMPLIANT");
  });

  it("11. hausse exactement le 24/08/2022 → irrégulière", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("F", "2021-01-01")],
          rentHistory: [
            rent("INITIAL", "2022-01-01", 100000),
            rent("REVISION", "2022-08-24", 105000),
          ],
        },
        "2023-08-24",
      ),
    );
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBeGreaterThan(0);
  });

  it("12. historique déclaratif → confiance MEDIUM", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("F", "2021-06-01", "ADEME_API")],
          rentHistory: [
            rent("INITIAL", "2022-01-01", 100000),
            rent("REVISION", "2023-09-01", 105000, "déclaratif"),
          ],
        },
        "2024-09-01",
      ),
    );
    expect(r.confidence).toBe("MEDIUM");
  });

  it("13. F sans aucune hausse → COMPLIANT (gel = pas d'augmentation)", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("F", "2021-06-01")],
          rentHistory: [rent("INITIAL", "2022-01-01", 100000)],
        },
        "2024-01-01",
      ),
    );
    expect(r.outcome).toBe("COMPLIANT");
    expect(r.recoverableCents).toBe(0);
    expect(r.futureMonthlySavingCents).toBe(0);
  });

  it("14. baisse de loyer → COMPLIANT", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("F", "2021-06-01")],
          rentHistory: [
            rent("INITIAL", "2022-01-01", 100000),
            rent("REVISION", "2023-01-01", 95000),
          ],
        },
        "2024-01-01",
      ),
    );
    expect(r.outcome).toBe("COMPLIANT");
  });

  it("15. classe G traitée comme F (gel)", () => {
    const r = evaluateDpeFreeze(
      mk(
        {
          dpeHistory: [dpe("G", "2021-06-01")],
          rentHistory: [
            rent("INITIAL", "2022-01-01", 80000),
            rent("REVISION", "2023-01-01", 84000),
          ],
        },
        "2024-01-01",
      ),
    );
    expect(r.outcome).toBe("IRREGULAR");
    expect(r.recoverableCents).toBe(48000); // 12 mois × 40 €
  });

  it("16. tout verdict porte règle, version et base légale", () => {
    const r = evaluateDpeFreeze(
      mk({ dpeHistory: [dpe("F", "2021-06-01")], rentHistory: [] }, "2024-01-01"),
    );
    expect(r.ruleId).toBe("DPE_FREEZE");
    expect(r.ruleVersion).toBe("2022-08-24");
    expect(r.legalBasis).toContain("art. 159");
    expect(r.computation.ruleId).toBe("DPE_FREEZE");
  });
});
