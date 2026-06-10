"use client";

import type { StepProps } from "../use-diagnostic-form";

const FIELD_CLASS =
  "w-full rounded-field border border-line bg-paper px-3 py-2 outline-none focus:border-ink focus:ring-2 focus:ring-ink/15";

export function RevisionHistoryStep({ draft, setField }: StepProps) {
  const rows = draft.revisions;

  function update(i: number, patch: Partial<{ date: string; rentCents: number }>) {
    setField(
      "revisions",
      rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/60">
        Facultatif. Si vous connaissez les hausses datées de votre loyer, ajoutez-les : le
        calcul sera plus précis. Sinon, passez — nous estimerons à partir des loyers de départ
        et actuel.
      </p>

      {rows.map((r, i) => (
        <div key={i} className="flex items-end gap-2">
          <label className="flex-1 text-xs text-ink/60">
            Date de la hausse
            <input
              type="date"
              value={r.date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => update(i, { date: e.target.value })}
              className={`mt-1 ${FIELD_CLASS}`}
            />
          </label>
          <label className="flex-1 text-xs text-ink/60">
            Nouveau loyer (€)
            <input
              type="text"
              inputMode="decimal"
              value={r.rentCents ? String(r.rentCents / 100) : ""}
              onChange={(e) => {
                const raw = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
                const euros = Number.parseFloat(raw);
                update(i, { rentCents: Number.isFinite(euros) ? Math.round(euros * 100) : 0 });
              }}
              className={`mt-1 font-mono tabular ${FIELD_CLASS}`}
            />
          </label>
          <button
            type="button"
            onClick={() => setField("revisions", rows.filter((_, idx) => idx !== i))}
            aria-label="Retirer cette ligne"
            className="rounded-field border border-line px-3 py-2 text-ink/50 hover:border-stamp hover:text-stamp"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setField("revisions", [...rows, { date: "", rentCents: 0 }])}
        className="rounded-field border border-ink px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-2"
      >
        + Ajouter une hausse
      </button>
    </div>
  );
}

export const revisionHistoryValid = (): boolean => true;
