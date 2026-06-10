import { describe, it, expect } from "vitest";
import { addCalendarDays, toISODate, computeSchedule, formatDateFr } from "./dates";

describe("dates", () => {
  it("ajoute des jours calendaires", () => {
    expect(toISODate(addCalendarDays("2026-01-01", 21))).toBe("2026-01-22");
  });

  it("calcule les jalons du pipeline J0/J21/J35/J50", () => {
    expect(computeSchedule("2026-01-01")).toEqual({
      j0: "2026-01-01",
      j21: "2026-01-22",
      j35: "2026-02-05",
      j50: "2026-02-20",
    });
  });

  it("franchit correctement mois et année", () => {
    expect(toISODate(addCalendarDays("2026-12-25", 10))).toBe("2027-01-04");
  });

  it("formate une date en fr-FR (Europe/Paris)", () => {
    expect(formatDateFr("2026-03-12")).toBe("12/03/2026");
  });
});
