import type { ComputationStep, RuleInput, RuleResult } from "../types";
import { shiftISO } from "../internal/dates";

const RULE_ID = "PRIVATE_LANDLORD_FEES" as const;
const RULE_VERSION = "1989-art5-bailleur-prive";
const PRESCRIPTION_YEARS = 3;
export const LEGAL_BASIS =
  "Frais de location facturés par un bailleur non professionnel — loi du 06/07/1989 art. 5 : un particulier qui loue sans intermédiaire ne peut facturer au locataire des honoraires de constitution de dossier ou de rédaction de bail. La somme indûment perçue est récupérable. TODO_VERIFIER [AVOCAT] : périmètre exact et point de départ de la prescription.";

const day = (iso: string): string => iso.slice(0, 10);

/**
 * Frais facturés par un bailleur PARTICULIER (LOT 2, booster COMPUTED). Un
 * particulier ne peut pas facturer de frais de dossier / rédaction de bail :
 * la somme est récupérable en intégralité. Déclaratif → MEDIUM.
 *
 * Renvoie `null` si : frais non déclarés, location passée par une agence (le
 * cas est alors couvert par AGENCY_FEES_CAP), ou bail prescrit (> 3 ans). [AVOCAT]
 */
export function evaluatePrivateLandlordFees(input: RuleInput): RuleResult | null {
  const { dossier, asOf } = input;
  const paid = dossier.privateLandlordFeesPaidCents;
  if (paid === undefined) return null;
  if (dossier.agencyUsed === true) return null;

  const deadline = dossier.leaseSignedAt
    ? shiftISO(dossier.leaseSignedAt, { years: PRESCRIPTION_YEARS })
    : undefined;
  if (deadline && day(asOf) > deadline) return null;

  const recoverable = Math.max(0, paid);
  const steps: ComputationStep[] = [
    { label: "Frais facturés par le bailleur (particulier)", cents: paid },
    { label: "Récupérable (aucun frais facturable par un particulier)", cents: recoverable },
  ];

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
