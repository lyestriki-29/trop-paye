/**
 * Registre de cas (LOT 0) — point d'itération unique du moteur. Chaque cas porte
 * un contrat commun (`CaseDefinition`) : métadonnées juridiques + `evaluate`.
 *
 * LOT 0 = migration SANS changement de logique : les 3 cas COMPUTED délèguent aux
 * règles existantes (toujours exportées, testées en direct) ; les 2 signaux
 * actuels (décence F/G, complément de loyer) deviennent des cas d'orientation.
 * Les libellés sont repris VERBATIM de l'ancien `aggregate.ts` (audit + tests).
 */
import type { CaseDefinition, DpeClass, RuleInput, Signal } from "./types";
import { formatEur } from "./labels";
import { evaluateDpeFreeze } from "./rules/dpe-freeze";
import { evaluateIrlOvercharge } from "./rules/irl-overcharge";
import { evaluateDepositLate } from "./rules/deposit-late";

/** Classe DPE en vigueur à la date d'évaluation (la plus récente ≤ asOf). */
export function latestDpeClassAt(input: RuleInput): DpeClass | undefined {
  const target = input.asOf.slice(0, 10);
  const before = input.dossier.dpeHistory.filter((d) => d.date.slice(0, 10) <= target);
  const pool = before.length > 0 ? before : input.dossier.dpeHistory;
  if (pool.length === 0) return undefined;
  return pool.reduce((m, d) => (d.date > m.date ? d : m), pool[0]!).class;
}

/**
 * Décence énergétique : interdiction de louer un G (depuis 2025) / F (depuis 2028).
 * Escalade judiciaire, JAMAIS chiffrée en répétition automatique.
 */
const decenceCase: CaseDefinition = {
  id: "DECENCE_PROHIBITION",
  legalBasisStatus: "AVOCAT_PENDING",
  detectability: "ESCALATION",
  requiredInputs: ["dpeHistory"],
  evaluate: (input) => {
    const cls = latestDpeClassAt(input);
    const asOfDay = input.asOf.slice(0, 10);
    const signals: Signal[] = [];
    if (cls === "G" && asOfDay >= "2025-01-01") {
      signals.push({
        caseId: "DECENCE_PROHIBITION",
        message:
          "Logement classé G : interdiction de mise en location depuis le 01/01/2025 (décence énergétique). Orientation possible vers une action judiciaire — non chiffrée automatiquement. [AVOCAT]",
      });
    }
    if (cls === "F" && asOfDay >= "2028-01-01") {
      signals.push({
        caseId: "DECENCE_PROHIBITION",
        message:
          "Logement classé F : interdiction de mise en location depuis le 01/01/2028 (décence énergétique). Orientation judiciaire, non chiffrée automatiquement. [AVOCAT]",
      });
    }
    return signals.length > 0 ? signals : null;
  },
};

/**
 * Complément de loyer (retours Lyes 2026-06-11) : licite uniquement en zone
 * d'encadrement pour des caractéristiques exceptionnelles. Cas aggravé : sur un
 * logement F/G, interdit pour les baux conclus depuis le 18/08/2022. Fenêtre de
 * contestation débattue [AVOCAT] → signal d'orientation, JAMAIS chiffré.
 */
const complementCase: CaseDefinition = {
  id: "RENT_SUPPLEMENT",
  legalBasisStatus: "AVOCAT_PENDING",
  detectability: "DECLARED_SIGNAL",
  requiredInputs: ["rentSupplementDeclared"],
  evaluate: (input) => {
    const cls = latestDpeClassAt(input);
    const signedAt = input.dossier.leaseSignedAt?.slice(0, 10);
    const fgProhibited =
      (cls === "F" || cls === "G") && (signedAt === undefined || signedAt >= "2022-08-18");
    if (fgProhibited) {
      const amount = input.dossier.rentSupplementCents
        ? ` (${formatEur(input.dossier.rentSupplementCents)} par mois déclarés)`
        : "";
      return [
        {
          caseId: "RENT_SUPPLEMENT",
          priority: true,
          message: `Complément de loyer sur un logement classé ${cls} : interdit pour les baux conclus depuis le 18/08/2022. Fort potentiel de récupération${amount} : dossier à examiner en PRIORITÉ en revue. La fenêtre de contestation est débattue : orientation, jamais chiffrée automatiquement. [AVOCAT]`,
        },
      ];
    }
    return [
      {
        caseId: "RENT_SUPPLEMENT",
        message:
          "Complément de loyer mentionné au bail : il n'est licite qu'en zone d'encadrement, pour des caractéristiques exceptionnelles du logement, et se conteste dans les 3 mois suivant la signature du bail. À examiner en revue. Orientation, jamais chiffrée automatiquement. [AVOCAT]",
      },
    ];
  },
};

/**
 * Registre ordonné. L'ordre fixe la séquence des `results` (DPE → IRL → dépôt) et
 * des `signals` (décence avant complément) → byte-compatible avec l'historique.
 * Les cas COMPUTED gardent `requiredInputs: []` : ils s'auto-évaluent et gèrent
 * en interne leurs données manquantes (INSUFFICIENT_DATA), comme avant.
 */
export const CASE_REGISTRY: CaseDefinition[] = [
  {
    id: "DPE_FREEZE",
    legalBasisStatus: "TODO_VERIFIER",
    detectability: "COMPUTED",
    prescriptionWindowYears: 3,
    requiredInputs: [],
    evaluate: evaluateDpeFreeze,
  },
  {
    id: "IRL_OVERCHARGE",
    legalBasisStatus: "TODO_VERIFIER",
    detectability: "COMPUTED",
    prescriptionWindowYears: 3,
    requiredInputs: [],
    evaluate: evaluateIrlOvercharge,
  },
  {
    id: "DEPOSIT_LATE",
    legalBasisStatus: "TODO_VERIFIER",
    detectability: "COMPUTED",
    prescriptionWindowYears: 3,
    requiredInputs: [],
    evaluate: evaluateDepositLate,
  },
  decenceCase,
  complementCase,
];
