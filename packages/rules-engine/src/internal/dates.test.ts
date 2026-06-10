import { describe, it, expect } from "vitest";
import { shiftISO, mostRecentAnniversaryISO } from "./dates";

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
