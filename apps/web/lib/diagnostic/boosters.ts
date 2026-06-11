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

/** Plafond de saisie : 1 000 000 € — borne anti-abus, loin de l'overflow int4. */
const MAX_CENTS = 100_000_000;

/** Réponses des 4 cartes boosters (toutes optionnelles : ignorer = aucun impact). */
export const boosterAnswersSchema = z.object({
  agencyUsed: z.boolean().optional(),
  agencyFeesPaidCents: z.number().int().positive().max(MAX_CENTS).optional(),
  edlFeesPaidCents: z.number().int().min(0).max(MAX_CENTS).optional(),
  privateLandlordFeesPaidCents: z.number().int().positive().max(MAX_CENTS).optional(),
  forbiddenFees: z.array(z.string().max(64)).max(10).optional(),
  chargesReviewItems: z.array(z.string().max(64)).max(10).optional(),
});

export type BoosterAnswers = z.infer<typeof boosterAnswersSchema>;

/**
 * Applique les réponses boosters au snapshot moteur — PUR, sans mutation.
 *
 * Sémantique REMPLAÇANTE (revue 2026-06-12) : le panneau boosters POSSÈDE ses
 * champs. Le module soumet toujours son état complet (pré-rempli depuis le
 * snapshot) ; on repart donc d'un snapshot PURGÉ de tous les champs boosters
 * puis on pose les réponses. Conséquences voulues : décocher/vider = rétracter,
 * et une bascule agence ↔ particulier ne laisse JAMAIS de champ fantôme de
 * l'autre régime (le double comptage AGENCY + PRIVATE devient impossible).
 * Les ids de checklist inconnus sont filtrés et dédupliqués (anti-payload forgé).
 */
export function mergeBoosterAnswers(
  snapshot: DossierSnapshot,
  answers: BoosterAnswers,
): DossierSnapshot {
  const {
    agencyUsed: _a,
    agencyFeesPaidCents: _b,
    edlFeesPaidCents: _c,
    privateLandlordFeesPaidCents: _d,
    forbiddenFees: _e,
    chargesReviewItems: _f,
    ...base
  } = snapshot;
  const agency = answers.agencyUsed;
  const forbidden = [...new Set(answers.forbiddenFees?.filter((id) => FORBIDDEN_IDS.has(id)))];
  const charges = [...new Set(answers.chargesReviewItems?.filter((id) => CHARGES_IDS.has(id)))];
  return {
    ...base,
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
    ...(forbidden.length > 0 ? { forbiddenFees: forbidden } : {}),
    ...(charges.length > 0 ? { chargesReviewItems: charges } : {}),
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
