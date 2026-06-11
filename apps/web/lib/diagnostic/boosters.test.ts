import { describe, it, expect } from "vitest";
import type { DossierSnapshot } from "@troppaye/rules-engine";
import { answersFromSnapshot, mergeBoosterAnswers } from "./boosters";

const SNAP: DossierSnapshot = {
  dpeHistory: [],
  rentHistory: [{ type: "INITIAL", date: "2023-01-01", rentCents: 90000, source: "déclaratif" }],
};

describe("mergeBoosterAnswers (merge pur partagé client/serveur)", () => {
  it("aucune réponse → snapshot strictement identique", () => {
    expect(mergeBoosterAnswers(SNAP, {})).toEqual(SNAP);
  });

  it("agence : honoraires acceptés, frais bailleur ignorés (cohérence)", () => {
    const s = mergeBoosterAnswers(SNAP, {
      agencyUsed: true,
      agencyFeesPaidCents: 40000,
      privateLandlordFeesPaidCents: 20000,
    });
    expect(s.agencyUsed).toBe(true);
    expect(s.agencyFeesPaidCents).toBe(40000);
    expect(s.privateLandlordFeesPaidCents).toBeUndefined();
  });

  it("pas d'agence : frais bailleur acceptés, honoraires ignorés", () => {
    const s = mergeBoosterAnswers(SNAP, {
      agencyUsed: false,
      agencyFeesPaidCents: 40000,
      privateLandlordFeesPaidCents: 20000,
    });
    expect(s.agencyFeesPaidCents).toBeUndefined();
    expect(s.privateLandlordFeesPaidCents).toBe(20000);
  });

  it("filtre les ids de checklist inconnus (anti-payload forgé)", () => {
    const s = mergeBoosterAnswers(SNAP, {
      forbiddenFees: ["quittance_facturee", "id_forge"],
      chargesReviewItems: ["taxe_fonciere", "x"],
    });
    expect(s.forbiddenFees).toEqual(["quittance_facturee"]);
    expect(s.chargesReviewItems).toEqual(["taxe_fonciere"]);
  });

  it("ne mute pas le snapshot d'origine", () => {
    const before = JSON.stringify(SNAP);
    mergeBoosterAnswers(SNAP, { agencyUsed: true, agencyFeesPaidCents: 40000 });
    expect(JSON.stringify(SNAP)).toBe(before);
  });

  it("answersFromSnapshot relit les réponses persistées (cartes pré-remplies)", () => {
    const merged = mergeBoosterAnswers(SNAP, { agencyUsed: false, privateLandlordFeesPaidCents: 20000 });
    expect(answersFromSnapshot(merged)).toMatchObject({
      agencyUsed: false,
      privateLandlordFeesPaidCents: 20000,
    });
  });
});
