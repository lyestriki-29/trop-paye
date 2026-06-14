import { describe, it, expect } from "vitest";
import { constructionPeriodFromYear } from "./construction";

describe("constructionPeriodFromYear", () => {
  it("mappe les bornes", () => {
    expect(constructionPeriodFromYear(1900)).toBe("BEFORE_1946");
    expect(constructionPeriodFromYear(1945)).toBe("BEFORE_1946");
    expect(constructionPeriodFromYear(1946)).toBe("1946_1970");
    expect(constructionPeriodFromYear(1970)).toBe("1946_1970");
    expect(constructionPeriodFromYear(1971)).toBe("1971_1990");
    expect(constructionPeriodFromYear(1990)).toBe("1971_1990");
    expect(constructionPeriodFromYear(1991)).toBe("AFTER_1990");
    expect(constructionPeriodFromYear(2015)).toBe("AFTER_1990");
  });
  it("rejette l'invalide", () => {
    expect(constructionPeriodFromYear(undefined)).toBeUndefined();
    expect(constructionPeriodFromYear(0)).toBeUndefined();
    expect(constructionPeriodFromYear(3000)).toBeUndefined();
  });
});
