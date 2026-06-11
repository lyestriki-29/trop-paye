import { describe, it, expect } from "vitest";
import { stripInternalMarkers } from "./labels";

describe("stripInternalMarkers", () => {
  it("retire le marqueur [AVOCAT] et l'espace qui le précède", () => {
    expect(stripInternalMarkers("Orientation, jamais chiffrée. [AVOCAT]")).toBe(
      "Orientation, jamais chiffrée.",
    );
  });

  it("retire aussi TODO_VERIFIER / TODO_COPY", () => {
    expect(stripInternalMarkers("Plafond TODO_VERIFIER à confirmer")).toBe(
      "Plafond à confirmer",
    );
  });

  it("idempotent et neutre sur un texte propre", () => {
    const clean = "Votre loyer est conforme.";
    expect(stripInternalMarkers(clean)).toBe(clean);
    expect(stripInternalMarkers(stripInternalMarkers("Texte [AVOCAT]"))).toBe("Texte");
  });
});
