"use client";

import { formatEUR } from "@troppaye/shared";
import type { StepProps } from "../use-diagnostic-form";
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

export function RecapStep({ draft }: StepProps) {
  const dpe = draft.dpeUnknown
    ? "Inconnu"
    : draft.dpe
      ? `Classe ${draft.dpe.class}`
      : "Non renseigné";

  return (
    <dl>
      <Row label="Adresse" value={draft.address?.label ?? "—"} />
      <Row label="Surface" value={draft.surfaceM2 ? `${draft.surfaceM2} m²` : "—"} mono />
      <Row
        label="Meublé"
        value={draft.furnished === undefined ? "—" : draft.furnished ? "Oui" : "Non"}
      />
      <Row label="DPE" value={dpe} />
      <Row
        label="Signature du bail"
        value={draft.leaseSignedAt ? frenchDate(draft.leaseSignedAt) : "—"}
        mono
      />
      <Row
        label="Loyer de départ"
        value={draft.initialRentCents !== undefined ? formatEUR(draft.initialRentCents) : "—"}
        mono
      />
      <Row
        label="Loyer actuel"
        value={draft.currentRentCents !== undefined ? formatEUR(draft.currentRentCents) : "—"}
        mono
      />
      <Row
        label="Clause de révision"
        value={
          draft.revisionClause === undefined ? "Je ne sais pas" : draft.revisionClause ? "Oui" : "Non"
        }
      />
      {draft.revisionQuarter ? <Row label="Trimestre IRL" value={draft.revisionQuarter} mono /> : null}
      {draft.revisions.length > 0 ? (
        <Row label="Hausses saisies" value={`${draft.revisions.length}`} mono />
      ) : null}
    </dl>
  );
}

export const recapValid = (): boolean => true;
