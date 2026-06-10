"use client";

import { formatEur } from "@troppaye/rules-engine";
import type { StepProps } from "../use-diagnostic-form";
import { frenchDate } from "@/lib/format-date";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2 text-sm">
      <dt className="text-ink/60">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
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
      <Row label="Surface" value={draft.surfaceM2 ? `${draft.surfaceM2} m²` : "—"} />
      <Row
        label="Meublé"
        value={draft.furnished === undefined ? "—" : draft.furnished ? "Oui" : "Non"}
      />
      <Row label="DPE" value={dpe} />
      <Row
        label="Signature du bail"
        value={draft.leaseSignedAt ? frenchDate(draft.leaseSignedAt) : "—"}
      />
      <Row
        label="Loyer de départ"
        value={draft.initialRentCents !== undefined ? formatEur(draft.initialRentCents) : "—"}
      />
      <Row
        label="Loyer actuel"
        value={draft.currentRentCents !== undefined ? formatEur(draft.currentRentCents) : "—"}
      />
      <Row
        label="Clause de révision"
        value={
          draft.revisionClause === undefined ? "Je ne sais pas" : draft.revisionClause ? "Oui" : "Non"
        }
      />
      {draft.revisionQuarter ? <Row label="Trimestre IRL" value={draft.revisionQuarter} /> : null}
      {draft.revisions.length > 0 ? (
        <Row label="Hausses saisies" value={`${draft.revisions.length}`} />
      ) : null}
    </dl>
  );
}

export const recapValid = (): boolean => true;
