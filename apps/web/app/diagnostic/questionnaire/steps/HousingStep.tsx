"use client";

import type { StepProps } from "../use-diagnostic-form";
import { ChoiceField, FieldShell } from "../fields";

export function HousingStep({ draft, setField }: StepProps) {
  return (
    <div className="space-y-6">
      <FieldShell label="Surface habitable" hint="En m² (facultatif, utile pour recouper le DPE).">
        <input
          type="text"
          inputMode="decimal"
          value={draft.surfaceM2 === undefined ? "" : String(draft.surfaceM2)}
          onChange={(e) => {
            const raw = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
            const n = raw === "" ? undefined : Number.parseFloat(raw);
            const valid = n !== undefined && Number.isFinite(n) && n > 0 && n <= 10000;
            setField("surfaceM2", valid ? n : undefined);
          }}
          placeholder="45"
          className="mt-1 w-full rounded-field border border-line bg-paper px-4 py-3 font-mono tabular outline-none focus:border-ink focus:ring-2 focus:ring-ink/15"
        />
      </FieldShell>

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
