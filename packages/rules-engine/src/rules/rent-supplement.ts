import type {
  ComputationStep,
  DpeClass,
  DpeRecord,
  RentEvent,
  RuleInput,
  RuleResult,
  Signal,
} from "../types";
import { eachMonth, maxISO, shiftISO } from "../internal/dates";

const RULE_ID = "RENT_SUPPLEMENT" as const;
const RULE_VERSION = "3DS-2022";
const PRESCRIPTION_YEARS = 3;
/**
 * Date pivot : un complément de loyer est interdit (loi 3DS) pour les baux
 * conclus depuis cette date si le logement présente ≥ 1 caractéristique
 * excluante. Source : service-public.gouv.fr F34401, loi 2022-217.
 */
const PROHIBITION_PIVOT = "2022-08-18";
/** Estimation maison du complément quand le montant n'est pas communiqué. */
const ESTIMATE_RATE = 0.09;

export const LEGAL_BASIS =
  "Complément de loyer — loi du 06/07/1989 art. 17 (encadrement) ; loi 3DS (2022-217) : interdit si le logement présente une caractéristique excluante (dont DPE F/G) pour les baux conclus depuis le 18/08/2022. Charge de la preuve au bailleur ; somme versée indûment récupérable (répétition de l'indu, prescription 3 ans). TODO_VERIFIER [AVOCAT].";

const day = (iso: string): string => iso.slice(0, 10);
const isFG = (c: DpeClass): boolean => c === "F" || c === "G";

/** Classe DPE en vigueur à la date d'évaluation (la plus récente ≤ asOf). PUR. */
function latestDpeClass(dpes: DpeRecord[], asOf: string): DpeClass | undefined {
  if (dpes.length === 0) return undefined;
  const target = day(asOf);
  const before = dpes.filter((d) => day(d.date) <= target);
  const pool = before.length > 0 ? before : dpes;
  return pool.reduce((m, d) => (d.date > m.date ? d : m), pool[0]!).class;
}

/** Loyer hors charges courant (événement le plus récent par date). */
function currentRentCents(rents: RentEvent[]): number | undefined {
  if (rents.length === 0) return undefined;
  return rents.reduce((m, r) => (r.date > m.date ? r : m), rents[0]!).rentCents;
}

/**
 * Complément de loyer (loi 3DS). CHIFFRE le trop-perçu récupérable quand le
 * complément est INTERDIT (logement F/G ou critère 3DS rédhibitoire, bail
 * postérieur au 18/08/2022) : somme versée indûment, fenêtre de prescription
 * 3 ans. Sinon, reste un SIGNAL d'orientation (contestation 3 mois suivant la
 * signature). JAMAIS au-delà de MEDIUM (V1 prudente, [AVOCAT]).
 */
export function evaluateRentSupplement(input: RuleInput): RuleResult | Signal[] | null {
  const { dossier, asOf } = input;
  if (dossier.rentSupplementDeclared !== true) return null;

  const cls = latestDpeClass(dossier.dpeHistory, asOf);
  const signedAt = dossier.leaseSignedAt ? day(dossier.leaseSignedAt) : undefined;
  // Critères 3DS cochés + DPE F/G re-déduit (non décochable côté UI).
  const criteria = new Set(dossier.complementCriteria ?? []);
  if (cls === "F" || cls === "G") criteria.add("dpe_fg");
  const dateInScope = signedAt === undefined || signedAt >= PROHIBITION_PIVOT;
  const prohibited = criteria.size > 0 && dateInScope;

  if (!prohibited) {
    const justified = dossier.rentSupplementExceptional === true;
    const message = justified
      ? "Complément de loyer déclaré : il n'est licite qu'en zone d'encadrement, pour des caractéristiques exceptionnelles du logement dont la preuve incombe au bailleur, et se conteste dans les 3 mois suivant la signature du bail. À examiner en revue. Orientation, jamais chiffrée automatiquement. [AVOCAT]"
      : "Complément de loyer déclaré SANS caractéristique exceptionnelle : il est probablement injustifié (la preuve d'une particularité de confort ou de localisation incombe au bailleur) et se conteste dans les 3 mois suivant la signature du bail. À examiner en PRIORITÉ en revue. Orientation, jamais chiffrée automatiquement. [AVOCAT]";
    return [{ caseId: RULE_ID, priority: !justified, message }];
  }

  const steps: ComputationStep[] = [];
  const declared = dossier.rentSupplementCents;
  const rent = currentRentCents(dossier.rentHistory);
  let monthly: number;
  const estimated = declared === undefined;
  if (declared !== undefined) {
    monthly = declared;
    steps.push({ label: "Complément de loyer mensuel déclaré", cents: monthly });
  } else if (rent !== undefined) {
    monthly = Math.round(rent * ESTIMATE_RATE);
    steps.push({
      label: "Complément estimé à 9 % du loyer (montant non communiqué)",
      cents: monthly,
    });
  } else {
    // Ni montant ni loyer connu : on ne peut pas chiffrer → on rétrograde en signal.
    return [
      {
        caseId: RULE_ID,
        priority: true,
        message: LEGAL_BASIS,
      },
    ];
  }

  const prescriptionStart = shiftISO(asOf, { years: -PRESCRIPTION_YEARS });
  const windowStart = signedAt ? maxISO(signedAt, prescriptionStart) : prescriptionStart;
  const months = eachMonth(windowStart, asOf).length;
  const recoverable = monthly * months;
  const n = criteria.size;

  steps.push({ label: `Caractéristiques excluant le complément : ${n}` });
  steps.push({ label: `Fenêtre de prescription : ${months} mois` });
  steps.push({ label: "Trop-perçu récupérable (complément indu)", cents: recoverable });
  steps.push({ label: "Économie mensuelle à venir", cents: monthly });

  return {
    ruleId: RULE_ID,
    ruleVersion: RULE_VERSION,
    outcome: recoverable > 0 ? "IRREGULAR" : "COMPLIANT",
    confidence: "MEDIUM",
    recoverableCents: recoverable,
    futureMonthlySavingCents: monthly,
    actionDeadline: shiftISO(signedAt ?? asOf, { years: PRESCRIPTION_YEARS }),
    legalBasis: LEGAL_BASIS,
    computation: {
      ruleId: RULE_ID,
      ruleVersion: RULE_VERSION,
      steps,
      ...(estimated
        ? {
            todoVerifier: [
              "Complément estimé à 9 % du loyer (hypothèse maison, aucune source publique).",
            ],
          }
        : {}),
    },
  };
}
