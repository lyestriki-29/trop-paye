"use client";

import type { StepProps } from "../use-diagnostic-form";
import { MoneyField } from "../fields";

export function RentStep({ draft, setField }: StepProps) {
  return (
    <div className="space-y-6">
      <MoneyField
        label="Loyer mensuel de départ (hors charges)"
        hint="Le loyer inscrit au bail, à la signature."
        cents={draft.initialRentCents}
        onChange={(c) => setField("initialRentCents", c)}
      />
      <MoneyField
        label="Loyer mensuel actuel (hors charges)"
        hint="Ce que vous payez aujourd'hui, hors charges."
        cents={draft.currentRentCents}
        onChange={(c) => setField("currentRentCents", c)}
      />
    </div>
  );
}

export const rentValid = (d: StepProps["draft"]): boolean =>
  d.initialRentCents !== undefined &&
  d.initialRentCents > 0 &&
  d.currentRentCents !== undefined &&
  d.currentRentCents > 0;
