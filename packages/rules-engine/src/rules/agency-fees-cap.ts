import type { ComputationStep, RuleInput, RuleResult } from "../types";
import { shiftISO } from "../internal/dates";

const RULE_ID = "AGENCY_FEES_CAP" as const;
const RULE_VERSION = "2014-alur-honoraires";
const PRESCRIPTION_YEARS = 3;
export const LEGAL_BASIS =
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
  // Garde miroir de PRIVATE_LANDLORD_FEES (revue 2026-06-12) : pas d'agence
  // déclarée = pas d'honoraires d'agence, même si un champ périmé traînait.
  if (dossier.agencyUsed === false) return null;
  const paid = dossier.agencyFeesPaidCents;
  const edlPaid = dossier.edlFeesPaidCents;
  // EDL facturé seul = aussi évaluable (revue : il était ignoré en silence).
  if (paid === undefined && edlPaid === undefined) return null;

  const ref = referentials.agencyFees;
  const insee = dossier.inseeCode;
  const surface = dossier.surfaceM2;
  if (!ref || insee === undefined || surface === undefined) return null;

  const zone = ref.zoneByInsee[insee];
  if (!zone) return null;
  const caps = ref.capsByZone[zone];
  if (!caps) return null;

  // Prescription : sans date de bail, on ne peut PAS établir que la créance
  // n'est pas prescrite → non chiffré (revue 2026-06-12, conservateur). [AVOCAT]
  if (!dossier.leaseSignedAt) return null;
  const deadline = shiftISO(dossier.leaseSignedAt, { years: PRESCRIPTION_YEARS });
  if (day(asOf) > deadline) return null;

  const feeCap = Math.round(surface * caps.feePerM2Cents);
  const edlCap = Math.round(surface * caps.edlPerM2Cents);
  const feePaid = paid ?? 0;
  const feeExcess = Math.max(0, feePaid - feeCap);
  const edl = edlPaid ?? 0;
  const edlExcess = Math.max(0, edl - edlCap);
  const recoverable = feeExcess + edlExcess;

  const steps: ComputationStep[] = [
    { label: `Plafond honoraires (zone ${zone}, ${surface} m²)`, cents: feeCap },
    { label: "Honoraires payés", cents: feePaid },
  ];
  if (edl > 0) {
    steps.push({ label: "État des lieux : plafond", cents: edlCap });
    steps.push({ label: "État des lieux payé", cents: edl });
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
