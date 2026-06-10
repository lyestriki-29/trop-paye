/** Types du moteur de règles — PUR, aucune dépendance réseau/I/O. */

export type DpeClass = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type Outcome = "IRREGULAR" | "COMPLIANT" | "INSUFFICIENT_DATA";
export type RuleId = "DPE_FREEZE" | "IRL_OVERCHARGE" | "DEPOSIT_LATE";

export type DpeSource = "ADEME_API" | "USER_INPUT" | "DOCUMENT";
export type RentEventType =
  | "INITIAL"
  | "REVISION"
  | "RENEWAL"
  | "RELOCATION"
  | "REGULARISATION_CHARGES";
export type RentSource = "quittance" | "déclaratif" | "bail";

export interface DpeRecord {
  class: DpeClass;
  date: string; // ISO — date d'établissement du DPE
  surfaceM2?: number;
  numero?: string;
  source: DpeSource;
}

export interface RentEvent {
  date: string; // ISO — prise d'effet
  type: RentEventType;
  rentCents: number; // loyer hors charges
  source: RentSource;
}

export interface DepositInput {
  depositCents: number;
  leaveDate: string; // remise des clés (ISO)
  edlConforme: boolean; // EDL de sortie conforme à l'entrée
  monthlyRentCents: number; // loyer mensuel hors charges
  refundDate?: string;
  refundCents?: number;
  justifiedRetentionCents?: number;
}

export interface DossierSnapshot {
  leaseSignedAt?: string;
  furnished?: boolean;
  surfaceM2?: number;
  inseeCode?: string;
  dpeHistory: DpeRecord[];
  rentHistory: RentEvent[];
  revisionClause?: boolean;
  revisionQuarter?: string; // "T2" — trimestre IRL de référence
  /** Origine du trimestre : lu dans le bail, ou déduit du mois de signature (spec §3). */
  revisionQuarterSource?: "BAIL" | "DEDUCED";
  /**
   * Loyers HC estimés depuis des montants charges comprises (charges au barème,
   * spec questionnaire §2) → les règles chiffrées plafonnent la confiance à MEDIUM.
   */
  rentEstimated?: boolean;
  previousTenantRentCents?: number;
  deposit?: DepositInput;
}

export interface IrlIndexEntry {
  /** Clé "AAAA-Tn", ex "2023-T2". */
  quarter: string;
  value: number;
  verified: boolean;
}

export interface Referentials {
  irl: IrlIndexEntry[];
  /** Bouclier loyer : plafond de variation (métropole 3,5 %). */
  shieldRatePct: number;
}

export interface RuleInput {
  dossier: DossierSnapshot;
  referentials: Referentials;
  asOf: string; // ISO — date d'évaluation
}

export interface ComputationStep {
  label: string;
  detail?: string;
  cents?: number;
}

export interface ComputationTrace {
  ruleId: RuleId;
  ruleVersion: string;
  steps: ComputationStep[];
  /** Valeurs réglementaires non vérifiées utilisées dans le calcul. */
  todoVerifier?: string[];
}

export interface RuleResult {
  ruleId: RuleId;
  ruleVersion: string;
  outcome: Outcome;
  confidence: Confidence;
  recoverableCents: number;
  futureMonthlySavingCents: number;
  actionDeadline?: string;
  legalBasis: string;
  missingData?: string[];
  computation: ComputationTrace;
  /** Renseigné par l'agrégateur si relégué en subsidiaire (anti double-comptage). */
  subsidiaryOf?: RuleId;
}

export interface VerdictGlobal {
  outcome: Outcome;
  totalRecoverableCents: number;
  totalFutureMonthlySavingCents: number;
  confidence: Confidence;
  results: RuleResult[];
  /** Signaux d'orientation NON chiffrés (ex. indécence/interdiction de louer). */
  signals: string[];
  asOf: string;
}
