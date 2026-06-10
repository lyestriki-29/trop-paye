"use client";

import { Button } from "@/components/ui/Button";
import type { StepProps } from "../use-diagnostic-form";
import { DateField, MoneyField } from "../fields";

export function RevisionHistoryStep({ draft, setField }: StepProps) {
  const rows = draft.revisions;

  function update(i: number, patch: Partial<{ date: string; rentCents: number }>) {
    setField(
      "revisions",
      rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink/60">
        Facultatif. Si vous connaissez les hausses datées de votre loyer, ajoutez-les : le
        calcul sera plus précis. Sinon, passez — nous estimerons à partir des loyers de départ
        et actuel.
      </p>

      {rows.map((r, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">
            <DateField
              label="Date de la hausse"
              value={r.date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(v) => update(i, { date: v })}
            />
          </div>
          <div className="flex-1">
            <MoneyField
              label="Nouveau loyer"
              cents={r.rentCents || undefined}
              onChange={(c) => update(i, { rentCents: c ?? 0 })}
            />
          </div>
          <button
            type="button"
            onClick={() => setField("revisions", rows.filter((_, idx) => idx !== i))}
            aria-label="Retirer cette ligne"
            className="mt-2 rounded-badge border border-line p-2.5 text-ink/50 transition hover:border-stamp hover:text-stamp focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Copy deck §2 — bouton de l'étape augmentations, mot pour mot. */}
      <Button
        variant="ghost"
        onClick={() => setField("revisions", [...rows, { date: "", rentCents: 0 }])}
      >
        + Ajouter une augmentation
      </Button>
    </div>
  );
}

/** Bloque uniquement les lignes partiellement remplies (date sans montant, ou l'inverse). */
export const revisionHistoryValid = (d: StepProps["draft"]): boolean =>
  d.revisions.every((r) => {
    const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(r.date);
    const hasRent = r.rentCents > 0;
    return (hasDate && hasRent) || (!hasDate && !hasRent);
  });
