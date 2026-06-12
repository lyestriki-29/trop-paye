import { describe, it, expect } from "vitest";
import { pointInPolygon, selectBareme, type BaremeRow } from "./rent-control";

// Carré 2×2 (lon/lat) en GeoJSON Polygon.
const square = {
  type: "Polygon",
  coordinates: [
    [
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 0],
      [0, 0],
    ],
  ],
};

describe("pointInPolygon", () => {
  it("point intérieur → true", () => {
    expect(pointInPolygon(1, 1, square)).toBe(true);
  });
  it("point extérieur → false", () => {
    expect(pointInPolygon(3, 3, square)).toBe(false);
    expect(pointInPolygon(-1, 1, square)).toBe(false);
  });
  it("MultiPolygon : intérieur de l'un des polygones → true", () => {
    const multi = {
      type: "MultiPolygon",
      coordinates: [square.coordinates, [[[10, 10], [10, 12], [12, 12], [12, 10], [10, 10]]]],
    };
    expect(pointInPolygon(11, 11, multi)).toBe(true);
    expect(pointInPolygon(5, 5, multi)).toBe(false);
  });
  it("Polygon avec trou : point dans le trou → false (even-odd correct)", () => {
    const withHole = {
      type: "Polygon",
      coordinates: [
        [[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]], // extérieur 10×10
        [[3, 3], [3, 7], [7, 7], [7, 3], [3, 3]], // trou 3..7
      ],
    };
    expect(pointInPolygon(5, 5, withHole)).toBe(false); // dans le trou
    expect(pointInPolygon(1, 1, withHole)).toBe(true); // hors trou
  });
});

describe("selectBareme", () => {
  const rows: BaremeRow[] = [
    { effective_from: "2019-07-01", millesime: 2019, max_cents: 3000, ref_cents: 2500, min_cents: 1750 },
    { effective_from: "2023-07-01", millesime: 2023, max_cents: 3200, ref_cents: 2666, min_cents: 1866 },
    { effective_from: "2025-07-01", millesime: 2025, max_cents: 3290, ref_cents: 2740, min_cents: 1920 },
  ];

  it("choisit le barème en vigueur à asOf (le plus récent ≤ asOf)", () => {
    const r = selectBareme(rows, "2024-06-01");
    expect(r?.applicable.millesime).toBe(2023);
    expect(r?.schemeStart).toBe("2019-07-01");
  });

  it("asOf après le dernier millésime → dernier barème", () => {
    expect(selectBareme(rows, "2026-01-01")?.applicable.millesime).toBe(2025);
  });

  it("asOf avant l'encadrement → null (pas de plafond, on ne fabrique pas un droit)", () => {
    expect(selectBareme(rows, "2018-01-01")).toBeNull();
  });

  it("aucune ligne → null", () => {
    expect(selectBareme([], "2024-06-01")).toBeNull();
  });
});
