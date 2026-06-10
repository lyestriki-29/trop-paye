import { describe, it, expect } from "vitest";
import {
  anniversariesBetween,
  mostRecentAnniversaryISO,
  quarterFromMonthISO,
  shiftISO,
} from "./dates";

describe("shiftISO — pas de débordement de mois", () => {
  it("31 janv. + 1 mois → 29 févr. (bissextile)", () => {
    expect(shiftISO("2024-01-31", { months: 1 })).toBe("2024-02-29");
  });

  it("31 janv. + 1 mois → 28 févr. (non bissextile)", () => {
    expect(shiftISO("2023-01-31", { months: 1 })).toBe("2023-02-28");
  });

  it("conserve le jour quand il existe dans le mois cible", () => {
    expect(shiftISO("2024-01-15", { months: 1 })).toBe("2024-02-15");
  });

  it("recule de 3 ans (prescription)", () => {
    expect(shiftISO("2026-09-01", { years: -3 })).toBe("2023-09-01");
  });

  it("ajoute des jours après le décalage de mois", () => {
    expect(shiftISO("2024-02-29", { days: 1 })).toBe("2024-03-01");
  });
});

describe("mostRecentAnniversaryISO — dernier anniversaire ≤ asOf", () => {
  it("anniversaire déjà passé cette année → année d'asOf", () => {
    expect(mostRecentAnniversaryISO("2020-03-10", "2024-08-01")).toBe("2024-03-10");
  });

  it("anniversaire pas encore atteint cette année → année précédente", () => {
    expect(mostRecentAnniversaryISO("2020-11-20", "2024-08-01")).toBe("2023-11-20");
  });

  it("ancre 29 févr. → 28 févr. en année non bissextile", () => {
    expect(mostRecentAnniversaryISO("2020-02-29", "2023-05-01")).toBe("2023-02-28");
  });

  it("asOf pile sur l'anniversaire → cette année (borne incluse)", () => {
    expect(mostRecentAnniversaryISO("2020-08-01", "2024-08-01")).toBe("2024-08-01");
  });

  it("ancre postérieure à asOf (bail futur) → repli sur asOf", () => {
    expect(mostRecentAnniversaryISO("2025-06-15", "2024-08-01")).toBe("2024-08-01");
  });

  it("ancre = asOf → asOf", () => {
    expect(mostRecentAnniversaryISO("2024-08-01", "2024-08-01")).toBe("2024-08-01");
  });
});

describe("quarterFromMonthISO — table 12 mois → 4 trimestres (spec questionnaire §3)", () => {
  it("janv–mars → T1, avr–juin → T2, juil–sept → T3, oct–déc → T4", () => {
    const table: Array<[string, string]> = [
      ["2024-01-15", "T1"],
      ["2024-02-15", "T1"],
      ["2024-03-15", "T1"],
      ["2024-04-15", "T2"],
      ["2024-05-15", "T2"],
      ["2024-06-15", "T2"],
      ["2024-07-15", "T3"],
      ["2024-08-15", "T3"],
      ["2024-09-15", "T3"],
      ["2024-10-15", "T4"],
      ["2024-11-15", "T4"],
      ["2024-12-15", "T4"],
    ];
    for (const [iso, expected] of table) expect(quarterFromMonthISO(iso)).toBe(expected);
  });
});

describe("anniversariesBetween — une ligne par anniversaire de bail (spec questionnaire §4)", () => {
  it("de N+1 jusqu'à asOf, anniversaire non encore atteint exclu", () => {
    expect(anniversariesBetween("2021-09-15", "2024-06-11")).toEqual([
      "2022-09-15",
      "2023-09-15",
    ]);
    expect(anniversariesBetween("2021-03-01", "2024-06-11")).toEqual([
      "2022-03-01",
      "2023-03-01",
      "2024-03-01",
    ]);
  });

  it("anniversaire du jour même inclus ; bail récent ou futur → aucune ligne", () => {
    expect(anniversariesBetween("2023-06-11", "2024-06-11")).toEqual(["2024-06-11"]);
    expect(anniversariesBetween("2024-01-01", "2024-06-11")).toEqual([]);
    expect(anniversariesBetween("2025-01-01", "2024-06-11")).toEqual([]);
  });

  it("bail du 29 févr. → 28 févr. les années non bissextiles", () => {
    expect(anniversariesBetween("2020-02-29", "2024-06-11")).toEqual([
      "2021-02-28",
      "2022-02-28",
      "2023-02-28",
      "2024-02-29",
    ]);
  });
});
