import { z } from "zod";
import type { DossierSnapshot } from "@troppaye/rules-engine";

/**
 * Boosters post-verdict (LOT 2) : définitions partagées entre l'aperçu live
 * (client) et la persistance autoritaire (server action) — le merge est PUR
 * pour garantir que les deux calculent exactement le même snapshot.
 * Libellés grand public TODO_COPY ; bases légales TODO_VERIFIER [AVOCAT].
 */

export interface BoosterChecklistItem {
  id: string;
  label: string;
}

/** Frais abusifs (signal FORBIDDEN_FEES, art. 4 loi 1989 — TODO_VERIFIER). */
export const FORBIDDEN_FEES_ITEMS: BoosterChecklistItem[] = [
  { id: "quittance_facturee", label: "On me facture mes quittances de loyer" },
  { id: "frais_relance", label: "Frais de relance ou de mise en demeure facturés" },
  { id: "penalites_retard", label: "Pénalités de retard prélevées sur mon loyer" },
];

/** Régularisation de charges (signal CHARGES_REVIEW — TODO_VERIFIER). */
export const CHARGES_REVIEW_ITEMS: BoosterChecklistItem[] = [
  { id: "jamais_regularise", label: "Je n'ai jamais reçu de régularisation de charges" },
  { id: "assurance_bailleur", label: "L'assurance du propriétaire m'est facturée" },
  { id: "frais_gestion", label: "Des frais de gestion ou de syndic me sont facturés" },
  { id: "taxe_fonciere", label: "La taxe foncière m'est refacturée (hors ordures ménagères)" },
];

const FORBIDDEN_IDS = new Set(FORBIDDEN_FEES_ITEMS.map((i) => i.id));
const CHARGES_IDS = new Set(CHARGES_REVIEW_ITEMS.map((i) => i.id));

/** Réponses des 4 cartes boosters (toutes optionnelles : ignorer = aucun impact). */
export const boosterAnswersSchema = z.object({
  agencyUsed: z.boolean().optional(),
  agencyFeesPaidCents: z.number().int().positive().optional(),
  edlFeesPaidCents: z.number().int().min(0).optional(),
  privateLandlordFeesPaidCents: z.number().int().positive().optional(),
  forbiddenFees: z.array(z.string().max(64)).max(10).optional(),
  chargesReviewItems: z.array(z.string().max(64)).max(10).optional(),
});

export type BoosterAnswers = z.infer<typeof boosterAnswersSchema>;

/**
 * Applique les réponses boosters au snapshot moteur — PUR, sans mutation.
 * Cohérence agence/particulier : les honoraires d'agence n'ont de sens que si
 * `agencyUsed === true`, les frais bailleur que si `agencyUsed === false`
 * (le moteur re-garde aussi via `agencyUsed`, défense en profondeur).
 * Les ids de checklist inconnus du référentiel sont filtrés (anti-payload forgé).
 */
export function mergeBoosterAnswers(
  snapshot: DossierSnapshot,
  answers: BoosterAnswers,
): DossierSnapshot {
  const agency = answers.agencyUsed;
  const forbidden = answers.forbiddenFees?.filter((id) => FORBIDDEN_IDS.has(id));
  const charges = answers.chargesReviewItems?.filter((id) => CHARGES_IDS.has(id));
  return {
    ...snapshot,
    ...(agency !== undefined ? { agencyUsed: agency } : {}),
    ...(agency === true && answers.agencyFeesPaidCents !== undefined
      ? { agencyFeesPaidCents: answers.agencyFeesPaidCents }
      : {}),
    ...(agency === true && answers.edlFeesPaidCents !== undefined
      ? { edlFeesPaidCents: answers.edlFeesPaidCents }
      : {}),
    ...(agency === false && answers.privateLandlordFeesPaidCents !== undefined
      ? { privateLandlordFeesPaidCents: answers.privateLandlordFeesPaidCents }
      : {}),
    ...(forbidden && forbidden.length > 0 ? { forbiddenFees: forbidden } : {}),
    ...(charges && charges.length > 0 ? { chargesReviewItems: charges } : {}),
  };
}

/** Réponses déjà persistées, relues depuis le snapshot (cartes pré-remplies). */
export function answersFromSnapshot(snapshot: DossierSnapshot): BoosterAnswers {
  return {
    agencyUsed: snapshot.agencyUsed,
    agencyFeesPaidCents: snapshot.agencyFeesPaidCents,
    edlFeesPaidCents: snapshot.edlFeesPaidCents,
    privateLandlordFeesPaidCents: snapshot.privateLandlordFeesPaidCents,
    forbiddenFees: snapshot.forbiddenFees,
    chargesReviewItems: snapshot.chargesReviewItems,
  };
}
