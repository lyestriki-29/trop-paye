"use client";

import type { StepProps } from "../use-diagnostic-form";
import { ChoiceField, TextField } from "../fields";

export function HousingStep({ draft, setField }: StepProps) {
  return (
    <div className="space-y-6">
      <TextField
        label="Surface habitable (m²)"
        hint="Facultatif, utile pour recouper le DPE."
        inputMode="decimal"
        mono
        value={draft.surfaceM2 === undefined ? "" : String(draft.surfaceM2)}
        onChange={(v) => {
          const raw = v.replace(",", ".").replace(/[^0-9.]/g, "");
          const n = raw === "" ? undefined : Number.parseFloat(raw);
          const valid = n !== undefined && Number.isFinite(n) && n > 0 && n <= 10000;
          setField("surfaceM2", valid ? n : undefined);
        }}
      />

      <ChoiceField
        label="Le logement est-il meublé ?"
        choices={[
          { value: "yes", label: "Meublé" },
          { value: "no", label: "Non meublé" },
        ]}
        value={draft.furnished === undefined ? undefined : draft.furnished ? "yes" : "no"}
        onChange={(v) => setField("furnished", v === "yes")}
      />
    </div>
  );
}

export const housingValid = (): boolean => true; // étape facultative
