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

      {/* Colocation (LOT 1.3) : le verdict porte toujours sur le loyer TOTAL du
          logement ; si l'utilisateur ne connaît que sa part, on reconstitue
          total = part × nombre de colocataires. TODO_COPY — libellés brouillon. */}
      <ChoiceField
        label="Est-ce une colocation ?"
        hint="Plusieurs locataires sur un même bail, ou des baux distincts pour le même logement."
        choices={[
          { value: "yes", label: "Oui" },
          { value: "no", label: "Non" },
        ]}
        value={draft.isShared === undefined ? undefined : draft.isShared ? "yes" : "no"}
        onChange={(v) => setField("isShared", v === "yes")}
      />
      {draft.isShared ? (
        <TextField
          label="Combien de colocataires en tout ?"
          hint="Vous compris. Sert à reconstituer le loyer total si vous saisissez votre part."
          inputMode="numeric"
          mono
          value={draft.tenantCount === undefined ? "" : String(draft.tenantCount)}
          onChange={(v) => {
            const raw = v.replace(/[^0-9]/g, "");
            const n = raw === "" ? undefined : Number.parseInt(raw, 10);
            const valid = n !== undefined && Number.isInteger(n) && n >= 2 && n <= 20;
            setField("tenantCount", valid ? n : undefined);
          }}
        />
      ) : null}
    </div>
  );
}

/** Étape facultative, SAUF la coloc : si déclarée, le nombre de colocataires (≥ 2) est requis. */
export const housingValid = (d: StepProps["draft"]): boolean =>
  !d.isShared || (d.tenantCount !== undefined && d.tenantCount >= 2);
