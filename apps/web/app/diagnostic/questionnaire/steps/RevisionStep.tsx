"use client";

import type { StepProps } from "../use-diagnostic-form";
import { ChoiceField } from "../fields";

const QUARTERS = ["T1", "T2", "T3", "T4"] as const;

export function RevisionStep({ draft, setField }: StepProps) {
  const clauseValue =
    draft.revisionClause === undefined ? undefined : draft.revisionClause ? "yes" : "no";

  return (
    <div className="space-y-6">
      <ChoiceField
        label="Votre bail prévoit-il une clause de révision annuelle du loyer ?"
        hint="Sans clause, aucune indexation n'est permise — tout dépassement est récupérable."
        choices={[
          { value: "yes", label: "Oui" },
          { value: "no", label: "Non" },
          { value: "unknown", label: "Je ne sais pas" },
        ]}
        value={draft.revisionClause === undefined ? undefined : clauseValue}
        onChange={(v) => {
          if (v === "unknown") setField("revisionClause", undefined);
          else setField("revisionClause", v === "yes");
        }}
      />

      {draft.revisionClause !== false ? (
        <ChoiceField
          label="Trimestre de l'IRL de référence"
          hint="Indiqué dans la clause de révision du bail (souvent le trimestre de signature)."
          choices={QUARTERS.map((q) => ({ value: q, label: q }))}
          value={draft.revisionQuarter as (typeof QUARTERS)[number] | undefined}
          onChange={(q) => setField("revisionQuarter", q)}
        />
      ) : null}
    </div>
  );
}

export const revisionValid = (): boolean => true; // facultatif
