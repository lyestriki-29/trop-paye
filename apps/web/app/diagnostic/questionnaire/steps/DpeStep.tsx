"use client";

import { useState } from "react";
import { lookupDpeAction } from "@/app/diagnostic/actions";
import type { DpeResult } from "@/lib/providers/dpe";
import type { StepProps } from "../use-diagnostic-form";
import { ChoiceField, FieldShell, TextField } from "../fields";

const CLASSES = ["A", "B", "C", "D", "E", "F", "G"] as const;
const FIELD_CLASS =
  "mt-1 w-full rounded-field border border-line bg-paper px-4 py-3 outline-none focus:border-ink focus:ring-2 focus:ring-ink/15";

export function DpeStep({ draft, setField }: StepProps) {
  const [numero, setNumero] = useState(draft.dpe?.numero ?? "");
  const [results, setResults] = useState<DpeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function run(promise: Promise<DpeResult[]>) {
    setLoading(true);
    setSearched(false);
    const r = await promise;
    setResults(r);
    setLoading(false);
    setSearched(true);
  }

  function pick(d: DpeResult) {
    setField("dpeUnknown", false);
    setField("dpe", {
      class: d.class,
      date: d.date,
      numero: d.numero || undefined,
      surfaceM2: d.surfaceM2,
      source: "ADEME_API",
    });
    setResults([]);
  }

  return (
    <div className="space-y-6">
      {draft.address ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => run(lookupDpeAction({ label: draft.address!.label }))}
          className="rounded-field border border-ink px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-2 disabled:opacity-60"
        >
          {loading ? "Recherche…" : "Rechercher mon DPE à cette adresse"}
        </button>
      ) : null}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label="…ou par numéro de DPE"
            hint="13 caractères, ex. 2611E0031228S"
            value={numero}
            onChange={setNumero}
            placeholder="2611E0031228S"
          />
        </div>
        <button
          type="button"
          disabled={loading || numero.trim().length < 13}
          onClick={() => run(lookupDpeAction({ numero }))}
          className="rounded-field bg-ink px-4 py-3 text-sm font-medium text-paper disabled:opacity-50"
        >
          OK
        </button>
      </div>

      {results.length > 0 ? (
        <ul className="space-y-2">
          {results.map((d, i) => (
            <li key={d.numero || `dpe-${i}-${d.date}-${d.class}`}>
              <button
                type="button"
                onClick={() => pick(d)}
                className="flex w-full items-center justify-between rounded-field border border-line bg-paper px-4 py-3 text-left text-sm hover:border-ink/40"
              >
                <span>
                  Classe <strong>{d.class}</strong> · établi le {d.date}
                  {d.surfaceM2 ? ` · ${d.surfaceM2} m²` : ""}
                </span>
                <span className="text-refund-text">Choisir</span>
              </button>
            </li>
          ))}
        </ul>
      ) : searched && !loading ? (
        <p className="text-sm text-ink/55">Aucun DPE trouvé — saisissez la classe ci-dessous.</p>
      ) : null}

      {/* Saisie manuelle */}
      <div className="space-y-3 border-t border-line pt-5">
        <ChoiceField
          label="Saisir la classe manuellement"
          choices={CLASSES.map((c) => ({ value: c, label: c }))}
          value={draft.dpe?.source === "USER_INPUT" ? (draft.dpe.class as (typeof CLASSES)[number]) : undefined}
          onChange={(c) => {
            setField("dpeUnknown", false);
            setField("dpe", { class: c, date: draft.dpe?.date ?? "", source: "USER_INPUT" });
          }}
        />
        {draft.dpe?.source === "USER_INPUT" ? (
          <FieldShell label="Date d'établissement du DPE" hint="Indispensable pour le calcul du gel.">
            <input
              type="date"
              value={draft.dpe.date}
              onChange={(e) =>
                setField("dpe", { ...draft.dpe!, date: e.target.value, source: "USER_INPUT" })
              }
              className={FIELD_CLASS}
            />
          </FieldShell>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => {
          setField("dpe", null);
          setField("dpeUnknown", true);
        }}
        className={`text-sm underline-offset-2 hover:underline ${
          draft.dpeUnknown ? "font-medium text-ink" : "text-ink/55"
        }`}
      >
        Je ne connais pas mon DPE
      </button>
    </div>
  );
}

/** Facultatif, MAIS une saisie manuelle exige une date ISO valide (sinon calcul faussé). */
export const dpeValid = (d: StepProps["draft"]): boolean => {
  if (d.dpe?.source === "USER_INPUT") return /^\d{4}-\d{2}-\d{2}$/.test(d.dpe.date);
  return true;
};
