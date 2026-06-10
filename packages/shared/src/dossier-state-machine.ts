/**
 * Machine à états du dossier — transitions AUTORISÉES uniquement.
 * Vérifiée à chaque mutation côté serveur pour éviter les états incohérents
 * (frise client ↔ back-office). Voir plan §1.
 */

export const DOSSIER_STATUSES = [
  "DRAFT",
  "DIAGNOSED",
  "MANDATE_PENDING",
  "IN_REVIEW",
  "RECOVERY",
  "ESCALATED",
  "WON",
  "LOST",
  "CLOSED",
] as const;

export type DossierStatus = (typeof DOSSIER_STATUSES)[number];

/** État de la séquence de relance — LU PAR LE CRON avant toute Action. */
export type RecoveryState = "SCHEDULED" | "PAUSED" | "LOCKED";

const TRANSITIONS: Record<DossierStatus, readonly DossierStatus[]> = {
  DRAFT: ["DIAGNOSED"],
  DIAGNOSED: ["MANDATE_PENDING"],
  MANDATE_PENDING: ["IN_REVIEW"],
  IN_REVIEW: ["RECOVERY", "CLOSED"],
  RECOVERY: ["ESCALATED", "WON", "LOST"],
  ESCALATED: ["WON", "LOST"],
  WON: ["CLOSED"],
  LOST: ["CLOSED"],
  CLOSED: [],
};

export function nextStatuses(from: DossierStatus): readonly DossierStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: DossierStatus, to: DossierStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Lève une erreur si la transition est interdite (garde-fou serveur). */
export function assertTransition(from: DossierStatus, to: DossierStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Transition de dossier interdite : ${from} → ${to}`);
  }
}
