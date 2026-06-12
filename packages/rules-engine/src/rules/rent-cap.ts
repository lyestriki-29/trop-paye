import type { ComputationStep, RentEvent, RuleInput, RuleResult } from "../types";
import { maxISO, monthsElapsed, shiftISO } from "../internal/dates";

const RULE_ID = "ENCADREMENT" as const;
const RULE_VERSION = "encadrement-v1";
const PRESCRIPTION_YEARS = 3;

export const LEGAL_BASIS =
  "Encadrement des loyers — loi ELAN (2018-1021) art. 140 et loi du 06/07/1989 art. 17 : dans les communes en zone d'encadrement, le loyer hors charges au m² ne peut excéder le loyer de référence majoré fixé par arrêté préfectoral (selon secteur, nombre de pièces, époque de construction, meublé ou non). Le dépassement, hors complément de loyer justifié, est indûment perçu : répétition de l'indu, prescription 3 ans. TODO_VERIFIER [AVOCAT].";

/** Loyer hors charges courant (événement le plus récent par date). */
function currentRentCents(rents: RentEvent[]): number | undefined {
  if (rents.length === 0) return undefined;
  return rents.reduce((m, r) => (r.date > m.date ? r : m), rents[0]!).rentCents;
}

/** Date d'événement de loyer la plus ancienne (proxy de début d'occupation). */
function earliestRentDate(rents: RentEvent[]): string | undefined {
  if (rents.length === 0) return undefined;
  return rents.reduce((m, r) => (r.date < m.date ? r : m), rents[0]!).date.slice(0, 10);
}

/**
 * Encadrement des loyers (plafond absolu, distinct du gel F/G et du bouclier qui
 * encadrent les HAUSSES). Compare le loyer HC au loyer de référence MAJORÉ
 * (injecté, résolu hors moteur) × surface ; le dépassement est récupérable sur
 * la fenêtre de prescription, et le loyer doit baisser pour l'avenir. Déclaratif
 * + barème = MEDIUM.
 *
 * Renvoie `null` (cas non évalué) si : référence absente (hors zone), surface
 * inconnue, ou loyer courant inconnu. [AVOCAT]
 */
export function evaluateRentCap(input: RuleInput): RuleResult | null {
  const { dossier, referentials, asOf } = input;
  const rc = referentials.rentControl;
  const surface = dossier.surfaceM2;
  if (!rc || surface === undefined) return null;

  const rent = currentRentCents(dossier.rentHistory);
  if (rent === undefined) return null;

  const capTotalCents = Math.round(rc.capPerM2Cents * surface);
  const excess = rent - capTotalCents;

  // Fenêtre récupérable : début d'occupation (bail, sinon 1er loyer connu), borné
  // par la prescription 3 ans ET par la date d'effet de l'encadrement du secteur.
  const prescriptionStart = shiftISO(asOf, { years: -PRESCRIPTION_YEARS });
  const occStart = dossier.leaseSignedAt
    ? dossier.leaseSignedAt.slice(0, 10)
    : (earliestRentDate(dossier.rentHistory) ?? prescriptionStart);
  const windowStart = maxISO(maxISO(occStart, prescriptionStart), rc.effectiveFrom);
  const months = Math.min(monthsElapsed(windowStart, asOf), 12 * PRESCRIPTION_YEARS);
  const recoverable = excess > 0 ? excess * months : 0;

  const meuble = rc.furnished ? ", meublé" : "";
  const steps: ComputationStep[] = [
    {
      label: "Loyer de référence majoré (plafond)",
      detail: `${rc.zoneLabel}, ${rc.rooms} p., ${rc.periodLabel}${meuble}, barème ${rc.millesime}`,
      cents: capTotalCents,
    },
    { label: "Loyer payé (hors charges)", cents: rent },
  ];

  if (excess <= 0) {
    steps.push({ label: "Loyer dans le plafond — rien à signaler" });
    return {
      ruleId: RULE_ID,
      ruleVersion: RULE_VERSION,
      outcome: "COMPLIANT",
      confidence: "MEDIUM",
      recoverableCents: 0,
      futureMonthlySavingCents: 0,
      legalBasis: LEGAL_BASIS,
      computation: { ruleId: RULE_ID, ruleVersion: RULE_VERSION, steps },
    };
  }

  steps.push({ label: "Dépassement mensuel", cents: excess });
  steps.push({ label: `Mensualités retenues (prescription 3 ans) : ${months}` });
  steps.push({ label: "Trop-perçu récupérable", cents: recoverable });
  steps.push({ label: "Baisse de loyer à venir", cents: excess });

  return {
    ruleId: RULE_ID,
    ruleVersion: RULE_VERSION,
    outcome: "IRREGULAR",
    confidence: "MEDIUM",
    recoverableCents: recoverable,
    futureMonthlySavingCents: excess,
    // Dépassement CONTINU : chaque mensualité prescrit 3 ans après son versement.
    // La dernière (la plus récente) borne la deadline utile → asOf + 3 ans, pas
    // depuis le début d'occupation (qui afficherait une échéance déjà passée).
    actionDeadline: shiftISO(asOf, { years: PRESCRIPTION_YEARS }),
    legalBasis: LEGAL_BASIS,
    computation: {
      ruleId: RULE_ID,
      ruleVersion: RULE_VERSION,
      steps,
      todoVerifier: [
        "Calcul V1 prudent : dépassement supposé constant sur la fenêtre ; un calcul exact recompare loyer et plafond millésime par millésime.",
        "Chevauchement possible avec un gel F/G ou une révision IRL déjà chiffrés (même hausse illégale) : à dédupliquer en revue avant de sommer.",
      ],
    },
  };
}
