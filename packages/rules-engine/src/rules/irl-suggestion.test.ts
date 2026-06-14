import { describe, it, expect } from "vitest";
import { irlSuggestionCents } from "./irl-overcharge";
import type { IrlIndexEntry } from "../types";

const irl = (quarter: string, value: number, verified = true): IrlIndexEntry => ({
  quarter,
  value,
  verified,
});

describe("irlSuggestionCents", () => {
  it("cas normal : loyer indexé = round(base × IRL_n / IRL_{n-1})", () => {
    // base = 1 000,00 €, T2, anniversaire 2024
    // IRL_n = 2024-T2 = 140,0 ; IRL_prev = 2023-T2 = 135,0
    // round(100000 × 140 / 135) = round(103703,703…) = 103704
    const result = irlSuggestionCents(
      100000,
      "T2",
      2024,
      [irl("2023-T2", 135.0), irl("2024-T2", 140.0)],
    );
    expect(result).toBe(103704);
  });

  it("indice manquant pour le trimestre demandé → null", () => {
    // Aucune entrée T3 disponible : les deux indices nécessaires sont absents.
    const result = irlSuggestionCents(
      100000,
      "T3",
      2024,
      [irl("2023-T2", 135.0), irl("2024-T2", 140.0)],
    );
    expect(result).toBeNull();
  });

  it("indice présent pour n mais absent pour n-1 → null", () => {
    // T2-2024 existe mais T2-2023 est absent : ne peut pas calculer la variation.
    const result = irlSuggestionCents(
      100000,
      "T2",
      2024,
      [irl("2024-T2", 140.0)],
    );
    expect(result).toBeNull();
  });

  it("arrondi vers le haut quand la fraction ≥ 0,5 (Math.round)", () => {
    // base = 10 000 ct, T1, anniversaire 2024
    // IRL_n = 2024-T1 = 5,0 ; IRL_prev = 2023-T1 = 3,0
    // 10000 × 5 / 3 = 16666,666… → Math.round → 16667
    const result = irlSuggestionCents(
      10000,
      "T1",
      2024,
      [irl("2023-T1", 3.0), irl("2024-T1", 5.0)],
    );
    expect(result).toBe(16667);
  });

  it("indice n-1 à zéro → null (pas de division par zéro)", () => {
    // T2-2023 publié à 0 : la division produirait Infinity. On renvoie null.
    const result = irlSuggestionCents(
      100000,
      "T2",
      2024,
      [irl("2023-T2", 0), irl("2024-T2", 140.0)],
    );
    expect(result).toBeNull();
  });

  it("arrondi vers le bas quand la fraction < 0,5 (Math.round)", () => {
    // base = 95 000 ct, T2, anniversaire 2024
    // IRL_n = 2024-T2 = 134,0 ; IRL_prev = 2023-T2 = 130,0
    // 95000 × 134 / 130 = 97923,076… → Math.round → 97923
    const result = irlSuggestionCents(
      95000,
      "T2",
      2024,
      [irl("2023-T2", 130.0), irl("2024-T2", 134.0)],
    );
    expect(result).toBe(97923);
  });
});
