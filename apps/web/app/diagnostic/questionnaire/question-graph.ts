import type { ReactNode } from "react";
import type { DiagnosticDraft, StepProps } from "./use-diagnostic-form";
import { addressValid } from "./steps/AddressStep";
import { housingValid } from "./steps/HousingStep";
import { dpeValid } from "./steps/DpeStep";
import { rentValid } from "./steps/RentStep";
import { revisionHistoryValid } from "./steps/RevisionHistoryStep";

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
