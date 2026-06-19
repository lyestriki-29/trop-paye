import type { ReactNode } from "react";
import type { ConstructionPeriod } from "@troppaye/rules-engine";
import { formatEur } from "@troppaye/rules-engine";
import type { DiagnosticDraft, StepProps } from "./use-diagnostic-form";
import { addressValid } from "./steps/AddressStep";
import { housingValid } from "./steps/HousingStep";
import { dpeValid } from "./steps/DpeStep";
import { rentValid } from "./steps/RentStep";
import { revisionHistoryValid } from "./steps/RevisionHistoryStep";
import { AddressQ } from "./questions/address";
import { DpeQ } from "./questions/dpe";
import {
  ColocQ,
  ConstructionConfirmQ,
  FurnishedQ,
  RoomsQ,
  SurfaceConfirmQ,
  TenantCountQ,
} from "./questions/housing";
import {
  ChargesQ,
  CurrentRentQ,
  DepositQ,
  InitialRentQ,
  RentBasisQ,
  RentModeQ,
  SupplementQ,
} from "./questions/rent";
import { LeaseDateQ, RevisionClauseQ, RevisionHistoryQ } from "./questions/lease";
import { RecapQ } from "./questions/recap";

export type ChapterId = "address" | "housing" | "rent" | "lease" | "recap";

export interface Question {
  id: string;
  chapter: ChapterId;
  /** Rendu du champ actif (réutilise les primitives/render fns). */
  render: (p: StepProps) => ReactNode;
  /** Répond-on à cette question ? Pilote repli + dévoilement (PAS la validité de submit). */
  isAnswered: (d: DiagnosticDraft) => boolean;
  /** La question s'applique-t-elle ? (ex. tenantCount seulement si coloc). */
  revealWhen?: (d: DiagnosticDraft) => boolean;
  /** Pilule/choix unique → avance auto ; champ libre → bouton « Continuer ». */
  autoAdvance?: boolean;
  /** Facultative : peut être « passée » sans être answered. */
  optional?: boolean;
  /** Texte du bloc confirmé replié. */
  summary: (d: DiagnosticDraft) => string;
  /** Bloc pré-rempli (cascade DPE, barème) → style vert + libellé « à vérifier ». */
  prefilled?: (d: DiagnosticDraft) => boolean;
}

export interface Chapter { id: ChapterId; title: string; }

export const CHAPTERS: Chapter[] = [
  { id: "address", title: "Adresse" },
  { id: "housing", title: "Logement" },
  { id: "rent", title: "Loyer" },
  { id: "lease", title: "Bail" },
  { id: "recap", title: "Récap" },
];

/** Gate de soumission = EXACTEMENT l'ancien `STEPS.every(s => s.valid)`.
 *  Réutilise les validateurs existants → non-régression garantie. */
export function canSubmit(d: DiagnosticDraft): boolean {
  return (
    addressValid(d) &&
    housingValid(d) &&
    dpeValid(d) &&
    rentValid(d) &&
    revisionHistoryValid(d)
  );
}

/** Libellés des fourchettes d'époque de construction (clés `ConstructionPeriod`). */
const CONSTRUCTION_LABELS: Record<ConstructionPeriod, string> = {
  BEFORE_1946: "Avant 1946",
  "1946_1970": "1946–1970",
  "1971_1990": "1971–1990",
  AFTER_1990: "Après 1990",
};

/** A-t-on des hausses renseignées (anniversaire, libre ou « pas de hausse ») ? */
function hasRevisionHistory(d: DiagnosticDraft): boolean {
  return (
    Object.keys(d.anniversaryRents ?? {}).length > 0 ||
    d.revisions.some((r) => r.rentCents > 0) ||
    (d.noIncreaseDates?.length ?? 0) > 0
  );
}

/**
 * Graphe ordonné des questions du tunnel. Chaque entrée câble une render fn
 * (`questions/*.tsx`) avec sa logique de réponse/dévoilement/repli. L'ordre EST
 * l'ordre de progression ; `revealWhen` filtre les questions non applicables.
 * Couvre tous les champs consommés par `buildPayload` (use-diagnostic-form).
 */
export const QUESTIONS: Question[] = [
  {
    id: "address",
    chapter: "address",
    render: AddressQ,
    autoAdvance: true,
    isAnswered: (d) => (d.address?.label?.length ?? 0) >= 3,
    summary: (d) => d.address?.label ?? "",
  },
  {
    id: "dpe",
    chapter: "housing",
    render: DpeQ,
    autoAdvance: true,
    isAnswered: (d) => d.dpe != null || d.dpeUnknown === true,
    prefilled: (d) => d.dpe?.source === "ADEME_API",
    summary: (d) =>
      d.dpeUnknown ? "DPE inconnu" : d.dpe ? `DPE ${d.dpe.class}` : "",
  },
  {
    id: "surface",
    chapter: "housing",
    render: SurfaceConfirmQ,
    autoAdvance: false,
    optional: true,
    isAnswered: (d) => d.surfaceM2 !== undefined,
    prefilled: (d) => d.dpe?.source === "ADEME_API" && d.surfaceM2 !== undefined,
    summary: (d) => (d.surfaceM2 ? `${d.surfaceM2} m²` : "Surface non précisée"),
  },
  {
    id: "construction",
    chapter: "housing",
    render: ConstructionConfirmQ,
    autoAdvance: true,
    isAnswered: (d) =>
      d.constructionPeriod !== undefined || d.constructionPeriodUnknown === true,
    prefilled: (d) =>
      d.dpe?.source === "ADEME_API" && d.constructionPeriod !== undefined,
    summary: (d) =>
      d.constructionPeriod ? CONSTRUCTION_LABELS[d.constructionPeriod] : "Époque : ?",
  },
  {
    id: "furnished",
    chapter: "housing",
    render: FurnishedQ,
    autoAdvance: true,
    isAnswered: (d) => d.furnished !== undefined,
    summary: (d) => (d.furnished ? "Meublé" : "Non meublé"),
  },
  {
    id: "rooms",
    chapter: "housing",
    render: RoomsQ,
    autoAdvance: true,
    isAnswered: (d) => d.roomCount !== undefined || d.roomCountUnknown === true,
    summary: (d) => (d.roomCountUnknown ? "Pièces : ?" : `${d.roomCount} pièce(s)`),
  },
  {
    id: "shared",
    chapter: "housing",
    render: ColocQ,
    autoAdvance: true,
    isAnswered: (d) => d.isShared !== undefined,
    summary: (d) => (d.isShared ? "Colocation" : "Logement non partagé"),
  },
  {
    id: "tenantCount",
    chapter: "housing",
    render: TenantCountQ,
    revealWhen: (d) => d.isShared === true,
    autoAdvance: true,
    isAnswered: (d) => d.tenantCount !== undefined,
    summary: (d) => `${d.tenantCount} colocataires`,
  },
  {
    id: "rentBasis",
    chapter: "rent",
    render: RentBasisQ,
    revealWhen: (d) => d.isShared === true,
    autoAdvance: true,
    isAnswered: (d) => d.rentBasis !== undefined,
    summary: (d) =>
      d.rentBasis === "SHARE" ? "Saisie : ma part" : "Saisie : loyer total",
  },
  {
    id: "rentMode",
    chapter: "rent",
    render: RentModeQ,
    autoAdvance: true,
    isAnswered: (d) => d.rentInputMode !== undefined,
    summary: (d) => (d.rentInputMode === "CC" ? "Charges comprises" : "Hors charges"),
  },
  {
    id: "currentRent",
    chapter: "rent",
    render: CurrentRentQ,
    autoAdvance: false,
    isAnswered: (d) => d.currentRentCents !== undefined && d.currentRentCents > 0,
    summary: (d) => (d.currentRentCents ? `Actuel ${formatEur(d.currentRentCents)}` : ""),
  },
  {
    id: "initialRent",
    chapter: "rent",
    render: InitialRentQ,
    autoAdvance: false,
    isAnswered: (d) => d.initialRentCents !== undefined && d.initialRentCents > 0,
    summary: (d) => (d.initialRentCents ? `Départ ${formatEur(d.initialRentCents)}` : ""),
  },
  {
    id: "charges",
    chapter: "rent",
    render: ChargesQ,
    revealWhen: (d) => (d.rentInputMode ?? "HC") === "CC",
    autoAdvance: false,
    isAnswered: (d) => d.chargesCents !== undefined,
    summary: (d) =>
      d.chargesCents !== undefined ? `Charges ${formatEur(d.chargesCents)}` : "",
  },
  {
    id: "deposit",
    chapter: "rent",
    render: DepositQ,
    optional: true,
    autoAdvance: false,
    isAnswered: (d) => d.depositPaidMonths !== undefined || d.depositPaidCents !== undefined,
    summary: (d) =>
      d.depositPaidMonths !== undefined
        ? `Dépôt ${d.depositPaidMonths} mois`
        : d.depositPaidCents !== undefined
          ? `Dépôt ${formatEur(d.depositPaidCents)}`
          : "Dépôt non précisé",
  },
  {
    id: "supplement",
    chapter: "rent",
    render: SupplementQ,
    autoAdvance: false,
    isAnswered: (d) => d.rentSupplement !== undefined,
    summary: (d) =>
      d.rentSupplement === "OUI"
        ? "Complément de loyer"
        : d.rentSupplement === "NON"
          ? "Pas de complément"
          : "Complément : ?",
  },
  {
    id: "leaseDate",
    chapter: "lease",
    render: LeaseDateQ,
    optional: true,
    autoAdvance: false,
    isAnswered: (d) => !!d.leaseSignedAt,
    summary: (d) => (d.leaseSignedAt ? `Bail ${d.leaseSignedAt.slice(0, 7)}` : "Date non précisée"),
  },
  {
    id: "revisionClause",
    chapter: "lease",
    render: RevisionClauseQ,
    optional: true,
    autoAdvance: false,
    isAnswered: (d) => d.revisionClause !== undefined,
    summary: (d) =>
      d.revisionClause === false
        ? "Sans clause de révision"
        : d.revisionClause
          ? "Clause de révision"
          : "Révision : ?",
  },
  {
    id: "revisionHistory",
    chapter: "lease",
    render: RevisionHistoryQ,
    optional: true,
    autoAdvance: false,
    isAnswered: hasRevisionHistory,
    summary: (d) => (hasRevisionHistory(d) ? "Hausses renseignées" : "Aucune hausse"),
  },
  {
    id: "recap",
    chapter: "recap",
    render: RecapQ,
    autoAdvance: false,
    isAnswered: () => false,
    summary: () => "",
  },
];
