import type {
  ComputationStep,
  DpeClass,
  DpeRecord,
  RentEvent,
  RuleInput,
  RuleResult,
} from "../types";
import { eachMonth, maxISO, minISO, shiftISO } from "../internal/dates";

const RULE_ID = "DPE_FREEZE" as const;
const RULE_VERSION = "2022-08-24";
const FREEZE_FROM = "2022-08-24";
const PRESCRIPTION_YEARS = 3;
const LEGAL_BASIS =
  "Gel des loyers F/G — loi Climat et résilience art. 159 ; loi du 06/07/1989 art. 17-1-I (interdiction d'augmentation depuis le 24/08/2022).";

const isFG = (c: DpeClass): boolean => c === "F" || c === "G";
const day = (iso: string): string => iso.slice(0, 10);
const byDateAsc = (a: { date: string }, b: { date: string }): number =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : 0;

interface ClassAt {
  dpe?: DpeRecord;
  ambiguous?: boolean;
}

/** Classe DPE en vigueur à une date (versionnage temporel + désambiguïsation surface). */
function classAt(dpes: DpeRecord[], dateISO: string, surfaceM2?: number): ClassAt {
  const target = day(dateISO);
  const before = dpes.filter((d) => day(d.date) <= target);
  const pool = before.length > 0 ? before : dpes;
  const maxDate = pool.reduce((m, d) => (d.date > m ? d.date : m), pool[0]!.date);
  const atMax = pool.filter((d) => d.date === maxDate);
  if (atMax.length === 1) return { dpe: atMax[0]! };
  // Plusieurs DPE à la même date pour l'adresse → choisir par surface ±10 %.
  if (surfaceM2 != null) {
    const matched = atMax.filter(
      (d) => d.surfaceM2 != null && Math.abs(d.surfaceM2 - surfaceM2) / surfaceM2 <= 0.1,
    );
    if (matched.length === 1) return { dpe: matched[0]! };
  }
  if (new Set(atMax.map((d) => d.class)).size === 1) return { dpe: atMax[0]! };
  return { ambiguous: true };
}

/** Loyer en vigueur à une date (fonction en escalier sur l'historique trié). */
function rentAt(rents: RentEvent[], dateISO: string): number {
  const target = day(dateISO);
  let value = rents[0]!.rentCents;
  for (const r of rents) {
    if (day(r.date) <= target) value = r.rentCents;
    else break;
  }
  return value;
}

export function evaluateDpeFreeze(input: RuleInput): RuleResult {
  const { dossier, asOf } = input;
  const steps: ComputationStep[] = [];
  // Loyers HC estimés depuis du CC (spec questionnaire §2) : audit + plafond MEDIUM.
  const rentEstimated = dossier.rentEstimated === true;
  if (rentEstimated) {
    steps.push({ label: "Loyers hors charges estimés depuis des montants charges comprises" });
  }
  // Loyers reconstitués depuis la part d'un colocataire (LOT 1.3) : audit + plafond MEDIUM.
  const rentFromShare = dossier.rentReconstructedFromShare === true;
  if (rentFromShare) {
    steps.push({ label: "Loyers reconstitués depuis la part d'un colocataire (× nombre de colocataires)" });
  }
  const base = (partial: Partial<RuleResult>): RuleResult => {
    const result: RuleResult = {
      ruleId: RULE_ID,
      ruleVersion: RULE_VERSION,
      outcome: "COMPLIANT",
      confidence: "MEDIUM",
      recoverableCents: 0,
      futureMonthlySavingCents: 0,
      legalBasis: LEGAL_BASIS,
      computation: { ruleId: RULE_ID, ruleVersion: RULE_VERSION, steps },
      ...partial,
    };
    if ((rentEstimated || rentFromShare) && result.confidence === "HIGH") result.confidence = "MEDIUM";
    return result;
  };

  if (!dossier.dpeHistory || dossier.dpeHistory.length === 0) {
    steps.push({ label: "Classe DPE inconnue" });
    return base({ outcome: "INSUFFICIENT_DATA", confidence: "LOW", missingData: ["dpe"] });
  }

  const dpes = [...dossier.dpeHistory].sort(byDateAsc);
  const rents = [...dossier.rentHistory].sort(byDateAsc);
  const hikeTypes = new Set(["REVISION", "RENEWAL", "RELOCATION"]);

  let firstHike:
    | { date: string; source: string; frozenCents: number; governing: DpeRecord }
    | null = null;

  for (let i = 0; i < rents.length; i++) {
    const ev = rents[i]!;
    if (!hikeTypes.has(ev.type)) continue;
    if (day(ev.date) < FREEZE_FROM) continue;

    let prevCents: number | undefined;
    if (ev.type === "RELOCATION") {
      prevCents = dossier.previousTenantRentCents;
      if (prevCents == null) {
        steps.push({ label: "Relocation : loyer du précédent locataire inconnu" });
        return base({
          outcome: "INSUFFICIENT_DATA",
          confidence: "LOW",
          missingData: ["previousTenantRent"],
        });
      }
    } else {
      prevCents = i > 0 ? rents[i - 1]!.rentCents : undefined;
      if (prevCents == null) continue;
    }
    if (ev.rentCents <= prevCents) continue; // pas une hausse

    const at = classAt(dpes, ev.date, dossier.surfaceM2);
    if (at.ambiguous) {
      steps.push({ label: "Plusieurs DPE à l'adresse — surface non concordante" });
      return base({
        outcome: "INSUFFICIENT_DATA",
        confidence: "LOW",
        missingData: ["dpe_surface"],
      });
    }
    if (at.dpe && isFG(at.dpe.class)) {
      firstHike = {
        date: day(ev.date),
        source: ev.source,
        frozenCents: prevCents,
        governing: at.dpe,
      };
      break;
    }
  }

  if (!firstHike) {
    steps.push({ label: "Aucune augmentation illégale sur logement F/G" });
    return base({ outcome: "COMPLIANT", confidence: "HIGH" });
  }

  // Dégel : premier DPE non-F/G postérieur à la 1re hausse illégale.
  const degel = dpes.find((d) => !isFG(d.class) && day(d.date) > firstHike!.date);
  const degelDate = degel ? day(degel.date) : undefined;

  const prescriptionStart = shiftISO(asOf, { years: -PRESCRIPTION_YEARS });
  const windowStart = maxISO(firstHike.date, prescriptionStart);
  const windowEnd = degelDate ? minISO(asOf, degelDate) : day(asOf);

  let recoverable = 0;
  for (const month of eachMonth(windowStart, windowEnd)) {
    const at = classAt(dpes, month, dossier.surfaceM2);
    if (!at.dpe || !isFG(at.dpe.class)) continue;
    const diff = rentAt(rents, month) - firstHike.frozenCents;
    if (diff > 0) recoverable += diff;
  }

  let future = 0;
  const atAsOf = classAt(dpes, asOf, dossier.surfaceM2);
  const stillFrozen =
    atAsOf.dpe != null && isFG(atAsOf.dpe.class) && (!degelDate || degelDate > day(asOf));
  if (stillFrozen) {
    future = Math.max(0, rentAt(rents, asOf) - firstHike.frozenCents);
  }

  // Un DPE établi APRÈS la hausse ne qualifie que par inférence (le DPE opposable est
  // celui en vigueur au moment des faits) → on ne dépasse pas MEDIUM. [AVOCAT]
  const retroactiveDpe = day(firstHike.governing.date) > firstHike.date;
  const confidence =
    !retroactiveDpe &&
    firstHike.governing.source === "ADEME_API" &&
    firstHike.source === "quittance"
      ? "HIGH"
      : "MEDIUM";

  steps.push({ label: "Loyer légal gelé (avant 1re hausse)", cents: firstHike.frozenCents });
  steps.push({ label: "Trop-perçu récupérable (fenêtre 3 ans)", cents: recoverable });
  steps.push({ label: "Économie mensuelle à venir", cents: future });

  return base({
    outcome: recoverable > 0 || future > 0 ? "IRREGULAR" : "COMPLIANT",
    confidence,
    recoverableCents: recoverable,
    futureMonthlySavingCents: future,
    actionDeadline: shiftISO(firstHike.date, { years: PRESCRIPTION_YEARS }),
  });
}
