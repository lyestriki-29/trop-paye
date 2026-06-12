import { z } from "zod";
import type { DepositInput, DossierSnapshot, RentEvent } from "@troppaye/rules-engine";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CENTS = 100_000_000;
const MISSING_CURRENT_RENT = "MISSING_CURRENT_RENT";
const MISSING_INITIAL_RENT = "MISSING_INITIAL_RENT";
const PRESETS_FORBIDDEN = "PRESETS_FORBIDDEN";

const isoDate = z.string().regex(ISO_DATE_RE, "Date invalide (AAAA-MM-JJ attendu).");
const refundedSchema = z.enum(["NO", "PARTIAL", "FULL"]);
const depositMonthPresetSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export type DepositMonthPreset = 1 | 2 | 3;

const depositAnswersBaseSchema = z.object({
  leaveDate: isoDate,
  edlConforme: z.boolean(),
  addressTransmitted: z.boolean().optional(),
  depositMonths: depositMonthPresetSchema.optional(),
  depositCents: z.number().int().positive().max(MAX_CENTS).optional(),
  refunded: refundedSchema,
  refundCents: z.number().int().positive().max(MAX_CENTS).optional(),
  refundDate: isoDate.optional(),
  justifiedRetentionCents: z.number().int().min(0).max(MAX_CENTS).optional(),
});

type DepositAnswersBase = z.infer<typeof depositAnswersBaseSchema>;

function refineDepositAnswers(value: DepositAnswersBase, ctx: z.RefinementCtx): void {
  const hasDepositMonths = value.depositMonths !== undefined;
  const hasDepositCents = value.depositCents !== undefined;
  if (hasDepositMonths === hasDepositCents) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["depositCents"],
      message: "Indiquez soit un nombre de mois, soit un montant exact.",
    });
  }

  if (value.refunded === "NO") return;
  if (value.refundCents === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["refundCents"],
      message: "Montant remboursé requis.",
    });
  }
  if (value.refundDate === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["refundDate"],
      message: "Date de remboursement requise.",
    });
  }
}

export const depositAnswersSchema = depositAnswersBaseSchema.superRefine(refineDepositAnswers);
export type DepositAnswers = z.infer<typeof depositAnswersSchema>;

export const depositAnswersDraftSchema = depositAnswersBaseSchema.partial();
export type DepositAnswersDraft = z.infer<typeof depositAnswersDraftSchema>;

function currentRentEvent(snapshot: DossierSnapshot): RentEvent | undefined {
  return snapshot.rentHistory.reduce<RentEvent | undefined>((latest, event) => {
    if (!latest) return event;
    if (event.date > latest.date) return event;
    return event.date === latest.date ? event : latest;
  }, undefined);
}

function oldestRentEvent(events: RentEvent[]): RentEvent | undefined {
  return events.reduce<RentEvent | undefined>((oldest, event) => {
    if (!oldest) return event;
    if (event.date < oldest.date) return event;
    return event.date === oldest.date ? event : oldest;
  }, undefined);
}

function initialRentEvent(snapshot: DossierSnapshot): RentEvent | undefined {
  return (
    oldestRentEvent(snapshot.rentHistory.filter((event) => event.type === "INITIAL")) ??
    oldestRentEvent(snapshot.rentHistory)
  );
}

export function depositMonthsToCents(
  snapshot: DossierSnapshot,
  months: DepositMonthPreset,
): number {
  const initialRentCents = initialRentEvent(snapshot)?.rentCents;
  if (initialRentCents === undefined) throw new Error(MISSING_INITIAL_RENT);
  return months * initialRentCents;
}

export function canUseDepositMonthPresets(snapshot: DossierSnapshot): boolean {
  return snapshot.rentReconstructedFromShare !== true;
}

export function getDepositMergeIssue(
  snapshot: DossierSnapshot,
  answers: DepositAnswers,
): string | null {
  if (answers.depositMonths !== undefined) {
    if (!canUseDepositMonthPresets(snapshot)) return PRESETS_FORBIDDEN;
    if (initialRentEvent(snapshot) === undefined) return MISSING_INITIAL_RENT;
  }

  if (currentRentEvent(snapshot) === undefined) return MISSING_CURRENT_RENT;

  return null;
}

function refundFields(answers: DepositAnswers): Pick<DepositInput, "refundCents" | "refundDate"> {
  if (answers.refunded === "NO") return {};
  if (answers.refundCents === undefined || answers.refundDate === undefined) {
    throw new Error("MISSING_REFUND_DATA");
  }
  return { refundCents: answers.refundCents, refundDate: answers.refundDate };
}

/**
 * Merge dépôt post-verdict — PUR, sans mutation.
 *
 * Sémantique REMPLAÇANTE : le mini-tunnel possède `snapshot.deposit`.
 * On purge donc l'ancien bloc avant de reposer les réponses complètes. Le
 * loyer mensuel est sourcé depuis le loyer courant du snapshot ; le dépôt saisi
 * reste un montant exact en centimes et n'est jamais multiplié en colocation.
 */
export function mergeDepositAnswers(
  snapshot: DossierSnapshot,
  answers: DepositAnswers,
): DossierSnapshot {
  const mergeIssue = getDepositMergeIssue(snapshot, answers);
  if (mergeIssue) throw new Error(mergeIssue);

  const { deposit: _deposit, ...base } = snapshot;
  const monthlyRentCents = currentRentEvent(snapshot)?.rentCents;
  if (monthlyRentCents === undefined) throw new Error(MISSING_CURRENT_RENT);
  const depositCents =
    answers.depositMonths !== undefined
      ? depositMonthsToCents(snapshot, answers.depositMonths)
      : answers.depositCents;
  if (depositCents === undefined) throw new Error("MISSING_DEPOSIT_DATA");

  return {
    ...base,
    deposit: {
      depositCents,
      leaveDate: answers.leaveDate,
      edlConforme: answers.edlConforme,
      monthlyRentCents,
      ...refundFields(answers),
      ...(answers.addressTransmitted !== undefined
        ? { addressTransmitted: answers.addressTransmitted }
        : {}),
      ...(answers.justifiedRetentionCents !== undefined
        ? { justifiedRetentionCents: answers.justifiedRetentionCents }
        : {}),
    },
  };
}

/** Réponses relues depuis le snapshot, avec reprise du dépôt LOT 1 si disponible. */
export function answersFromSnapshot(snapshot: DossierSnapshot): DepositAnswersDraft {
  const dep = snapshot.deposit;
  if (!dep) return { depositCents: snapshot.depositPaidCents };

  const refunded =
    dep.refundCents === undefined ? "NO" : dep.refundCents >= dep.depositCents ? "FULL" : "PARTIAL";
  return {
    leaveDate: dep.leaveDate,
    edlConforme: dep.edlConforme,
    addressTransmitted: dep.addressTransmitted,
    depositCents: dep.depositCents,
    refunded,
    refundCents: dep.refundCents,
    refundDate: dep.refundDate,
    justifiedRetentionCents: dep.justifiedRetentionCents,
  };
}
