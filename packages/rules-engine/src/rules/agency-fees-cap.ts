import type { ComputationStep, RuleInput, RuleResult } from "../types";
import { shiftISO } from "../internal/dates";

const RULE_ID = "AGENCY_FEES_CAP" as const;
const RULE_VERSION = "2014-alur-honoraires";
const PRESCRIPTION_YEARS = 3;
const LEGAL_BASIS =
  "Honoraires de location — loi du 06/07/1989 art. 5-I (loi ALUR), décret 2014-890 : la part du locataire (visite, constitution du dossier, rédaction du bail) est plafonnée par m² selon la zone, plus un plafond distinct pour l'état des lieux. TODO_VERIFIER [AVOCAT] : valeurs des plafonds, zonage par commune et point de départ de la prescription.";

const day = (iso: string): string => iso.slice(0, 10);

/**
 * Plafond des honoraires d'agence (LOT 2, booster COMPUTED). Compare la part
 * locataire payée au plafond légal (surface × tarif/m² selon zone) + plafond
 * distinct pour l'état des lieux ; l'excédent est récupérable. Déclaratif →
 * MEDIUM. Zonage et plafonds INJECTÉS (referentials.agencyFees), jamais en dur.
 *
 * Renvoie `null` (cas non évalué) si : honoraires non déclarés, référentiel ou
 * surface ou INSEE manquant, zone introuvable, ou bail prescrit (> 3 ans). [AVOCAT]
 */
export function evaluateAgencyFeesCap(input: RuleInput): RuleResult | null {
  const { dossier, referentials, asOf } = input;
  const paid = dossier.agencyFeesPaidCents;
  if (paid === undefined) return null;

  const ref = referentials.agencyFees;
  const insee = dossier.inseeCode;
  const surface = dossier.surfaceM2;
  if (!ref || insee === undefined || surface === undefined) return null;

  const zone = ref.zoneByInsee[insee];
  if (!zone) return null;
  const caps = ref.capsByZone[zone];
  if (!caps) return null;

  // Prescription : honoraires payés à l'entrée ; au-delà de 3 ans, non chiffré. [AVOCAT]
  const deadline = dossier.leaseSignedAt
    ? shiftISO(dossier.leaseSignedAt, { years: PRESCRIPTION_YEARS })
    : undefined;
  if (deadline && day(asOf) > deadline) return null;

  const feeCap = Math.round(surface * caps.feePerM2Cents);
  const edlCap = Math.round(surface * caps.edlPerM2Cents);
  const feeExcess = Math.max(0, paid - feeCap);
  const edlPaid = dossier.edlFeesPaidCents ?? 0;
  const edlExcess = Math.max(0, edlPaid - edlCap);
  const recoverable = feeExcess + edlExcess;

  const steps: ComputationStep[] = [
    { label: `Plafond honoraires (zone ${zone}, ${surface} m²)`, cents: feeCap },
    { label: "Honoraires payés", cents: paid },
  ];
  if (edlPaid > 0) {
    steps.push({ label: "État des lieux : plafond", cents: edlCap });
    steps.push({ label: "État des lieux payé", cents: edlPaid });
  }
  steps.push({ label: "Excédent récupérable", cents: recoverable });

  return {
    ruleId: RULE_ID,
    ruleVersion: RULE_VERSION,
    outcome: recoverable > 0 ? "IRREGULAR" : "COMPLIANT",
    confidence: "MEDIUM",
    recoverableCents: recoverable,
    futureMonthlySavingCents: 0,
    legalBasis: LEGAL_BASIS,
    computation: { ruleId: RULE_ID, ruleVersion: RULE_VERSION, steps },
    ...(deadline ? { actionDeadline: deadline } : {}),
  };
}
