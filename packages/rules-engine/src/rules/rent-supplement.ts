import type {
  ComputationStep,
  DpeClass,
  DpeRecord,
  RentEvent,
  RuleInput,
  RuleResult,
  Signal,
} from "../types";
import { maxISO, shiftISO } from "../internal/dates";

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

/**
 * Nombre de mensualités de complément versées dans [start, asOf] : nombre de fois
 * où le quantième de `start` a été atteint. 0 si `start` > `asOf` (bail futur saisi
 * en avance). Évite le sur-comptage d'`eachMonth` (qui ramène au 1er du mois et
 * compterait un mois de trop quand on multiplie par un montant fixe).
 */
function monthsElapsed(startISO: string, asOfISO: string): number {
  const s = day(startISO);
  const a = day(asOfISO);
  const raw =
    (Number(a.slice(0, 4)) - Number(s.slice(0, 4))) * 12 +
    (Number(a.slice(5, 7)) - Number(s.slice(5, 7))) +
    (Number(a.slice(8, 10)) >= Number(s.slice(8, 10)) ? 1 : 0);
  return Math.max(0, raw);
}

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
    // `false` = le locataire affirme N'AVOIR aucun atout exceptionnel → injustifié,
    // prioritaire. `undefined` = « je ne sais pas » → incertain, non prioritaire.
    // `true` = atout déclaré → probablement justifié.
    const exceptional = dossier.rentSupplementExceptional;
    if (exceptional === false) {
      return [
        {
          caseId: RULE_ID,
          priority: true,
          message:
            "Complément de loyer déclaré SANS caractéristique exceptionnelle : il est probablement injustifié (la preuve d'une particularité de confort ou de localisation incombe au bailleur) et se conteste dans les 3 mois suivant la signature du bail. À examiner en PRIORITÉ en revue. Orientation, jamais chiffrée automatiquement. [AVOCAT]",
        },
      ];
    }
    return [
      {
        caseId: RULE_ID,
        message:
          "Complément de loyer déclaré : il n'est licite qu'en zone d'encadrement, pour des caractéristiques exceptionnelles du logement dont la preuve incombe au bailleur, et se conteste dans les 3 mois suivant la signature du bail. À examiner en revue. Orientation, jamais chiffrée automatiquement. [AVOCAT]",
      },
    ];
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
  // Mensualités versées, bornées à la prescription (3 ans = 36 mensualités max).
  const months = Math.min(monthsElapsed(windowStart, asOf), 12 * PRESCRIPTION_YEARS);
  const recoverable = monthly * months;
  const n = criteria.size;

  steps.push({ label: `Caractéristiques excluant le complément : ${n}` });
  steps.push({ label: `Mensualités de complément indu : ${months}` });
  steps.push({ label: "Trop-perçu récupérable (complément indu)", cents: recoverable });
  steps.push({ label: "Économie mensuelle à venir", cents: monthly });

  return {
    ruleId: RULE_ID,
    ruleVersion: RULE_VERSION,
    // IRREGULAR dès qu'il y a une économie mensuelle (complément interdit), même si
    // aucun versement passé encore (recoverable 0) — cohérent avec DPE_FREEZE.
    outcome: recoverable > 0 || monthly > 0 ? "IRREGULAR" : "COMPLIANT",
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
