import { describe, expect, it } from "vitest";
import { anniversariesBetween } from "@troppaye/rules-engine";
import type { DiagnosticDraft } from "./use-diagnostic-form";
import { QUESTIONS, canSubmit } from "./question-graph";
import { firstUnansweredId } from "./reveal-state";

/**
 * Brouillon réaliste ENTIÈREMENT rempli (parcours hors coloc, mode HC).
 * `leaseSignedAt` ancien → l'éditeur de hausses est en mode anniversaire ;
 * on renseigne une ligne sur un anniversaire réel (calculé via le moteur)
 * pour que l'historique des hausses soit considéré « répondu ».
 */
function fullDraft(): DiagnosticDraft {
  const leaseSignedAt = "2021-03-15";
  const asOf = new Date().toISOString().slice(0, 10);
  const firstAnniversary = anniversariesBetween(leaseSignedAt, asOf)[0];
  expect(firstAnniversary).toBeDefined();

  return {
    address: {
      label: "12 rue de la Paix, 75002 Paris",
      banId: "75102_7395",
      inseeCode: "75102",
      lat: 48.8698,
      lon: 2.3312,
    },
    surfaceM2: 42,
    furnished: false,
    roomCount: 2,
    constructionPeriod: "1946_1970",
    isShared: false,
    dpe: { class: "D", date: "2022-05-01", source: "ADEME_API", surfaceM2: 42 },
    leaseSignedAt,
    initialRentCents: 95000,
    currentRentCents: 110000,
    rentInputMode: "HC",
    rentSupplement: "NON",
    revisionClause: true,
    revisionQuarter: "T1",
    depositPaidMonths: 1,
    revisions: [],
    anniversaryRents: { [firstAnniversary!]: 98000 },
  };
}

describe("question-graph", () => {
  it("a des identifiants de questions uniques", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("un brouillon complet passe la gate de soumission", () => {
    expect(canSubmit(fullDraft())).toBe(true);
  });

  it("un brouillon complet n'a plus que le récap comme question non répondue", () => {
    expect(firstUnansweredId(QUESTIONS, fullDraft())).toBe("recap");
  });
});
