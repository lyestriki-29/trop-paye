import { describe, expect, it } from "vitest";
import type { DossierSnapshot } from "@troppaye/rules-engine";
import {
  answersFromSnapshot,
  canUseDepositMonthPresets,
  depositAnswersSchema,
  depositMonthsToCents,
  getDepositMergeIssue,
  mergeDepositAnswers,
  type DepositAnswers,
} from "@/lib/diagnostic/deposit-tunnel";

const SNAP: DossierSnapshot = {
  dpeHistory: [],
  rentHistory: [
    { type: "INITIAL", date: "2022-01-01", rentCents: 90000, source: "bail" },
    { type: "REVISION", date: "2024-01-01", rentCents: 95000, source: "déclaratif" },
  ],
  depositPaidCents: 90000,
};

const ANSWERS: DepositAnswers = {
  leaveDate: "2025-03-10",
  edlConforme: true,
  depositCents: 90000,
  refunded: "NO",
};

describe("deposit-tunnel", () => {
  it("merge en sémantique remplaçante et source le loyer courant", () => {
    const merged = mergeDepositAnswers(SNAP, ANSWERS);
    expect(merged.deposit).toMatchObject({
      depositCents: 90000,
      leaveDate: "2025-03-10",
      edlConforme: true,
      monthlyRentCents: 95000,
    });
    expect(merged.depositPaidCents).toBe(90000);
    expect(SNAP.deposit).toBeUndefined();
  });

  it("rétractation : un remboursement précédemment saisi est purgé", () => {
    const partial = mergeDepositAnswers(SNAP, {
      ...ANSWERS,
      refunded: "PARTIAL",
      refundCents: 50000,
      refundDate: "2025-05-01",
    });
    const retracted = mergeDepositAnswers(partial, { ...ANSWERS, refunded: "NO" });
    expect(retracted.deposit?.refundCents).toBeUndefined();
    expect(retracted.deposit?.refundDate).toBeUndefined();
  });

  it("pré-remplit le montant exact depuis depositPaidCents quand le module retard est vide", () => {
    expect(answersFromSnapshot(SNAP)).toEqual({ depositCents: 90000 });
  });

  it("pré-remplit depuis snapshot.deposit sans confondre avec depositPaidCents", () => {
    const merged = mergeDepositAnswers(SNAP, {
      ...ANSWERS,
      depositCents: 120000,
      refunded: "FULL",
      refundCents: 120000,
      refundDate: "2025-04-15",
    });
    expect(answersFromSnapshot(merged)).toMatchObject({
      depositCents: 120000,
      refunded: "FULL",
      refundCents: 120000,
    });
  });

  it("coloc : ne multiplie jamais le dépôt par tenantCount", () => {
    type SnapshotWithTenantCount = DossierSnapshot & { tenantCount: number };
    const share: SnapshotWithTenantCount = {
      ...SNAP,
      rentReconstructedFromShare: true,
      tenantCount: 3,
    };
    const merged = mergeDepositAnswers(share, { ...ANSWERS, depositCents: 65000 });
    expect(merged.deposit?.depositCents).toBe(65000);
  });

  it("refuse un payload sans montant de dépôt ou sans remboursement requis", () => {
    const { depositCents: _depositCents, ...missingAmount } = ANSWERS;
    expect(depositAnswersSchema.safeParse(missingAmount).success).toBe(false);
    expect(depositAnswersSchema.safeParse({ ...ANSWERS, refunded: "PARTIAL" }).success).toBe(
      false,
    );
  });

  it("convertit les mois de dépôt depuis le loyer initial hors charges", () => {
    expect(depositMonthsToCents(SNAP, 2)).toBe(180000);
  });

  it("merge un dépôt exprimé en mois après conversion en centimes", () => {
    const { depositCents: _depositCents, ...answersWithoutAmount } = ANSWERS;
    const merged = mergeDepositAnswers(SNAP, { ...answersWithoutAmount, depositMonths: 2 });
    expect(merged.deposit).toMatchObject({
      depositCents: 180000,
      monthlyRentCents: 95000,
    });
  });

  it("désactive les presets en mois quand le loyer vient d'une part de colocation", () => {
    expect(canUseDepositMonthPresets({ ...SNAP, rentReconstructedFromShare: true })).toBe(false);
    expect(canUseDepositMonthPresets(SNAP)).toBe(true);
  });

  it("signale les erreurs de merge des presets en mois", () => {
    const { depositCents: _depositCents, ...answersWithoutAmount } = ANSWERS;
    const monthAnswers: DepositAnswers = { ...answersWithoutAmount, depositMonths: 1 };

    expect(
      getDepositMergeIssue({ ...SNAP, rentReconstructedFromShare: true }, monthAnswers),
    ).toBe("PRESETS_FORBIDDEN");
    expect(getDepositMergeIssue({ ...SNAP, rentHistory: [] }, monthAnswers)).toBe(
      "MISSING_INITIAL_RENT",
    );
    expect(getDepositMergeIssue(SNAP, monthAnswers)).toBeNull();
  });

  it("refuse les réponses avec deux montants de dépôt ou aucun montant", () => {
    const { depositCents: _depositCents, ...missingAmount } = ANSWERS;

    expect(depositAnswersSchema.safeParse({ ...ANSWERS, depositMonths: 1 }).success).toBe(false);
    expect(depositAnswersSchema.safeParse(missingAmount).success).toBe(false);
  });
});
