"use client";

import { useEffect } from "react";
import { quarterFromMonthISO } from "@troppaye/rules-engine";
import type { StepProps } from "../use-diagnostic-form";
import { ChoiceField, MonthYearField } from "../fields";
import { RevisionHistoryStep } from "../steps/RevisionHistoryStep";

const QUARTERS = ["T1", "T2", "T3", "T4"] as const;
type QuarterChoice = (typeof QUARTERS)[number] | "unknown";

/** Date de signature du bail (mois + année — cf. `LeaseStep`). */
export function LeaseDateQ({ draft, setField }: StepProps) {
  return (
    <MonthYearField
      label="Quand avez-vous signé votre bail ?"
      hint="Le mois et l'année suffisent. Sert à dater les révisions et la prescription (3 ans)."
      value={draft.leaseSignedAt ?? ""}
      onChange={(v) => setField("leaseSignedAt", v || undefined)}
    />
  );
}

/**
 * Clause de révision + trimestre IRL (corps de `RevisionStep`).
 * Levier 2 : si l'utilisateur n'a pas encore touché le trimestre
 * (`revisionQuarter` ET `revisionQuarterUnknown` absents), on pré-sélectionne
 * « Je ne sais pas » → le trimestre est déduit du mois de signature côté serveur,
 * sans écraser un choix existant.
 */
export function RevisionClauseQ({ draft, setField }: StepProps) {
  useEffect(() => {
    if (draft.revisionQuarter === undefined && draft.revisionQuarterUnknown === undefined) {
      setField("revisionQuarterUnknown", true);
    }
  }, [draft.revisionQuarter, draft.revisionQuarterUnknown, setField]);

  const clauseValue =
    draft.revisionClause === undefined ? undefined : draft.revisionClause ? "yes" : "no";

  const quarterValue: QuarterChoice | undefined = draft.revisionQuarterUnknown
    ? "unknown"
    : (draft.revisionQuarter as (typeof QUARTERS)[number] | undefined);

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
        <div>
          <ChoiceField
            label="Trimestre de l'IRL de référence"
            hint="Indiqué dans la clause de révision du bail (souvent le trimestre de signature)."
            choices={[
              ...QUARTERS.map((q) => ({ value: q as QuarterChoice, label: q })),
              { value: "unknown" as QuarterChoice, label: "Je ne sais pas" },
            ]}
            value={quarterValue}
            onChange={(q) => {
              // « Je ne sais pas » (spec §3) : trimestre déduit du mois de signature
              // côté serveur (toSnapshot) — jamais stocké comme une saisie du bail.
              if (q === "unknown") {
                setField("revisionQuarter", undefined);
                setField("revisionQuarterUnknown", true);
              } else {
                setField("revisionQuarter", q);
                setField("revisionQuarterUnknown", false);
              }
            }}
          />
          {draft.revisionQuarterUnknown ? (
            /* TODO_COPY — explication de la déduction (hors copy deck §2). */
            <p className="mt-2 text-xs text-ink/55">
              {draft.leaseSignedAt
                ? `Nous utiliserons le trimestre de votre date de signature : ${quarterFromMonthISO(draft.leaseSignedAt)}.`
                : "Sans date de signature du bail, nous ne pourrons pas vérifier la révision IRL."}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Historique des hausses (réutilise `RevisionHistoryStep` :
 * éditeur anniversaire ou libre). Le chip IRL « augmentation légale » est
 * réservé à la Task 12 — ici on réutilise tel quel.
 */
export function RevisionHistoryQ(p: StepProps) {
  return <RevisionHistoryStep {...p} />;
}
