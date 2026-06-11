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

  it("flip agence → particulier sur snapshot ENRICHI : les champs agence sont purgés (revue)", () => {
    // 1er passage : agence + honoraires persistés dans le snapshot.
    const enriched = mergeBoosterAnswers(SNAP, {
      agencyUsed: true,
      agencyFeesPaidCents: 50000,
      edlFeesPaidCents: 12000,
    });
    // 2e passage : l'utilisateur corrige (pas d'agence, frais bailleur).
    const flipped = mergeBoosterAnswers(enriched, {
      agencyUsed: false,
      privateLandlordFeesPaidCents: 20000,
    });
    expect(flipped.agencyFeesPaidCents).toBeUndefined(); // plus de champ fantôme
    expect(flipped.edlFeesPaidCents).toBeUndefined();
    expect(flipped.privateLandlordFeesPaidCents).toBe(20000);
    expect(flipped.agencyUsed).toBe(false);
  });

  it("rétractation : checklist vidée → champ purgé du snapshot (le panneau possède ses champs)", () => {
    const enriched = mergeBoosterAnswers(SNAP, { forbiddenFees: ["quittance_facturee"] });
    const retracted = mergeBoosterAnswers(enriched, { forbiddenFees: [] });
    expect(retracted.forbiddenFees).toBeUndefined();
  });

  it("doublons de checklist dédupliqués (compteur du signal fiable)", () => {
    const s = mergeBoosterAnswers(SNAP, {
      forbiddenFees: ["quittance_facturee", "quittance_facturee"],
    });
    expect(s.forbiddenFees).toEqual(["quittance_facturee"]);
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
