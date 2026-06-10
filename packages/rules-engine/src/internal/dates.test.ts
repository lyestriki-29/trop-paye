import { describe, it, expect } from "vitest";
import { shiftISO } from "./dates";

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
