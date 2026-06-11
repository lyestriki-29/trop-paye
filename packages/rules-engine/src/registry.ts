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
import { evaluateDepositCap } from "./rules/deposit-cap";
import { evaluateAgencyFeesCap } from "./rules/agency-fees-cap";

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
 * Date pivot : un complément de loyer est interdit (loi 3DS) pour les baux
 * conclus depuis cette date si le logement présente ≥ 1 caractéristique excluante.
 * Source : service-public.gouv.fr F34401, loi 2022-217 du 21/02/2022.
 * TODO_VERIFIER [AVOCAT] : périmètre exact (zones d'encadrement) et date pivot.
 */
const COMPLEMENT_3DS_PIVOT = "2022-08-18";

/**
 * Complément de loyer (LOT 1.2, loi 3DS) : licite uniquement en zone d'encadrement
 * pour des caractéristiques exceptionnelles. INTERDIT pour les baux conclus depuis
 * le 18/08/2022 si le logement présente ≥ 1 critère excluant (DPE F/G re-déduit
 * côté moteur + critères 3DS cochés par le locataire). Fenêtre de contestation
 * débattue [AVOCAT] → signal d'orientation, JAMAIS chiffré.
 */
const complementCase: CaseDefinition = {
  id: "RENT_SUPPLEMENT",
  legalBasisStatus: "AVOCAT_PENDING",
  detectability: "DECLARED_SIGNAL",
  requiredInputs: ["rentSupplementDeclared"],
  evaluate: (input) => {
    // Garde de truthiness : la porte requiredInputs laisse passer `false` (≠ undefined).
    // On reproduit la sémantique d'origine `if (rentSupplementDeclared)` : NON ⇒ rien.
    if (input.dossier.rentSupplementDeclared !== true) return null;
    const cls = latestDpeClassAt(input);
    const signedAt = input.dossier.leaseSignedAt?.slice(0, 10);
    // Critères 3DS cochés + DPE F/G re-déduit (étape 3, non décochable).
    const criteria = new Set(input.dossier.complementCriteria ?? []);
    if (cls === "F" || cls === "G") criteria.add("dpe_fg");
    const dateInScope = signedAt === undefined || signedAt >= COMPLEMENT_3DS_PIVOT;
    const prohibited = criteria.size > 0 && dateInScope;
    if (prohibited) {
      const amount = input.dossier.rentSupplementCents
        ? ` (${formatEur(input.dossier.rentSupplementCents)} par mois déclarés)`
        : "";
      const n = criteria.size;
      return [
        {
          caseId: "RENT_SUPPLEMENT",
          priority: true,
          message: `Complément de loyer très probablement interdit : le logement présente ${n} caractéristique${n > 1 ? "s" : ""} excluant un complément pour les baux conclus depuis le 18/08/2022 (loi 3DS)${amount}. Dossier à examiner en PRIORITÉ en revue. La fenêtre de contestation est débattue (3 mois suivant la signature) : orientation, jamais chiffrée automatiquement. [AVOCAT]`,
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
  {
    id: "DEPOSIT_CAP",
    legalBasisStatus: "TODO_VERIFIER",
    detectability: "COMPUTED",
    prescriptionWindowYears: 3,
    // `furnished` requis : sans lui, le plafond (1 vs 2 mois) serait deviné à 1 mois
    // par défaut → faux positif sur un meublé. Clé manquante = cas non évalué.
    requiredInputs: ["depositPaidCents", "furnished"],
    evaluate: evaluateDepositCap,
  },
  {
    id: "AGENCY_FEES_CAP",
    legalBasisStatus: "TODO_VERIFIER",
    detectability: "COMPUTED",
    prescriptionWindowYears: 3,
    requiredInputs: ["agencyFeesPaidCents"],
    evaluate: evaluateAgencyFeesCap,
  },
  decenceCase,
  complementCase,
];
