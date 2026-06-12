"use client";

import { quarterFromMonthISO } from "@troppaye/rules-engine";
import { formatEUR } from "@troppaye/shared";
import type { StepProps } from "../use-diagnostic-form";
import { effectiveRevisions } from "../use-diagnostic-form";
import { frenchDate } from "@/lib/format-date";

/** Ligne du récap — `mono` pour montants, dates et valeurs chiffrées (charte §2). */
function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-dashed border-line py-2.5 text-sm">
      <dt className="text-ink/60">{label}</dt>
      <dd className={`text-right font-medium ${mono ? "tabular font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

const PERIOD_LABEL: Record<string, string> = {
  BEFORE_1946: "Avant 1946",
  "1946_1970": "1946 à 1970",
  "1971_1990": "1971 à 1990",
  AFTER_1990: "Après 1990",
};

export function RecapStep({ draft }: StepProps) {
  const dpe = draft.dpeUnknown
    ? "Inconnu"
    : draft.dpe
      ? `Classe ${draft.dpe.class}`
      : "Non renseigné";
  const cc = draft.rentInputMode === "CC";
  const rentSuffix = cc ? " (charges comprises)" : "";
  const revisionsCount = effectiveRevisions(draft, new Date().toISOString().slice(0, 10)).length;
  // Trimestre saisi, ou déduit du mois de signature (spec §3).
  const quarter = draft.revisionQuarter
    ? draft.revisionQuarter
    : draft.revisionQuarterUnknown && draft.leaseSignedAt
      ? `${quarterFromMonthISO(draft.leaseSignedAt)} (déduit de la signature)`
      : undefined;

  return (
    <dl>
      <Row label="Adresse" value={draft.address?.label ?? "—"} />
      <Row label="Surface" value={draft.surfaceM2 ? `${draft.surfaceM2} m²` : "—"} mono />
      <Row
        label="Meublé"
        value={draft.furnished === undefined ? "—" : draft.furnished ? "Oui" : "Non"}
      />
      <Row
        label="Nombre de pièces"
        value={
          draft.roomCount !== undefined
            ? draft.roomCount === 4
              ? "4 et +"
              : String(draft.roomCount)
            : draft.roomCountUnknown
              ? "Je ne sais pas"
              : "—"
        }
        mono
      />
      <Row
        label="Époque de construction"
        value={
          draft.constructionPeriod
            ? (PERIOD_LABEL[draft.constructionPeriod] ?? draft.constructionPeriod)
            : draft.constructionPeriodUnknown
              ? "Je ne sais pas"
              : "—"
        }
      />
      <Row label="DPE" value={dpe} />
      <Row
        label="Signature du bail"
        value={draft.leaseSignedAt ? frenchDate(draft.leaseSignedAt) : "—"}
        mono
      />
      <Row
        label={`Loyer de départ${rentSuffix}`}
        value={draft.initialRentCents !== undefined ? formatEUR(draft.initialRentCents) : "—"}
        mono
      />
      <Row
        label={`Loyer actuel${rentSuffix}`}
        value={draft.currentRentCents !== undefined ? formatEUR(draft.currentRentCents) : "—"}
        mono
      />
      {cc ? (
        <Row
          label={draft.chargesEstimated ? "Charges mensuelles (estimées)" : "Charges mensuelles"}
          value={draft.chargesCents !== undefined ? formatEUR(draft.chargesCents) : "—"}
          mono
        />
      ) : null}
      <Row
        label="Clause de révision"
        value={
          draft.revisionClause === undefined ? "Je ne sais pas" : draft.revisionClause ? "Oui" : "Non"
        }
      />
      {quarter ? <Row label="Trimestre IRL" value={quarter} mono /> : null}
      {revisionsCount > 0 ? <Row label="Hausses saisies" value={`${revisionsCount}`} mono /> : null}
    </dl>
  );
}

export const recapValid = (): boolean => true;
