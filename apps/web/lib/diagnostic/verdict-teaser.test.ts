import { describe, expect, it } from "vitest";
import { extractCity } from "./verdict-teaser";

/** RGPD : seule la ville sort du libellé d'adresse — jamais le numéro ni la rue. */
describe("extractCity", () => {
  it("extrait la ville après le code postal", () => {
    expect(extractCity("12 Rue de la République 69002 Lyon")).toBe("Lyon");
  });

  it("garde une ville en plusieurs mots", () => {
    expect(extractCity("8 Avenue Jean Jaurès 94200 Ivry-sur-Seine")).toBe("Ivry-sur-Seine");
  });

  it("prend le DERNIER segment code postal + ville (rue contenant 5 chiffres)", () => {
    expect(extractCity("1 Rue du 11000 Novembre 31000 Toulouse")).toBe("Toulouse");
  });

  it("retourne null sans code postal", () => {
    expect(extractCity("Rue de la République, Lyon")).toBeNull();
  });

  it("retourne null pour null ou vide", () => {
    expect(extractCity(null)).toBeNull();
    expect(extractCity("")).toBeNull();
  });
});
