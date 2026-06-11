/**
 * Libellés FR et formatage partagés — PUR. Mutualisés entre le CLI (`cli/verdict.ts`)
 * et la page verdict web, pour éviter toute divergence de wording.
 */
import type { Confidence, Outcome, RuleId } from "./types";

export const RULE_LABEL: Record<RuleId, string> = {
  DPE_FREEZE: "Gel des loyers (passoire F/G)",
  IRL_OVERCHARGE: "Révision IRL",
  DEPOSIT_LATE: "Dépôt de garantie",
  DEPOSIT_CAP: "Dépôt de garantie (plafond)",
  AGENCY_FEES_CAP: "Honoraires d'agence (plafond)",
};

/** Niveau de confiance, en clair. */
export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  HIGH: "confiance élevée",
  MEDIUM: "confiance moyenne",
  LOW: "confiance faible",
};

/** Titre de synthèse affiché en tête de verdict. */
export const OUTCOME_TITLE: Record<Outcome, string> = {
  IRREGULAR: "VOUS AVEZ TROP PAYÉ",
  COMPLIANT: "RIEN À SIGNALER",
  INSUFFICIENT_DATA: "DONNÉES INSUFFISANTES",
};

/** Mention légale reprise telle quelle (pas de texte juridique improvisé). */
export const VERDICT_DISCLAIMER =
  "Estimation informative à partir de données publiques — ceci n'est pas un conseil juridique.";

/**
 * Retire les marqueurs internes ([AVOCAT], TODO_VERIFIER, TODO_COPY) d'un texte
 * destiné à l'affichage PUBLIC. Le back-office garde les signaux bruts (marqueurs
 * inclus) ; seul le rendu côté locataire est nettoyé (CLAUDE.md : [AVOCAT] jamais
 * en prod). Idempotent.
 */
export function stripInternalMarkers(text: string): string {
  return text
    .replace(/\s*\[AVOCAT\]/g, "")
    .replace(/\s*TODO_(?:VERIFIER|COPY)/g, "")
    .trim();
}

/** Centimes (int) → euros formatés fr-FR. */
export function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}
