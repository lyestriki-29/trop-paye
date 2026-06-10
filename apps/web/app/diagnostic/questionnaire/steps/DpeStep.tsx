"use client";

import { useState } from "react";
import { lookupDpeAction } from "@/app/diagnostic/actions";
import type { DpeLookupResult, DpeResult } from "@/lib/providers/dpe";
import { Button } from "@/components/ui/Button";
import type { StepProps } from "../use-diagnostic-form";
import { ChoiceField, DateField, TextField } from "../fields";
import { DpeSearchResults } from "./DpeSearchResults";
import { DpeSelectedCard } from "./DpeSelectedCard";

const CLASSES = ["A", "B", "C", "D", "E", "F", "G"] as const;

export function DpeStep({ draft, setField }: StepProps) {
  const [numero, setNumero] = useState(draft.dpe?.numero ?? "");
  const [results, setResults] = useState<DpeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  // Échec fournisseur ADEME (réseau/5xx) ≠ DPE introuvable (plan P2 Task 4).
  const [providerDown, setProviderDown] = useState(false);
  const selected = draft.dpe?.source === "ADEME_API";

  async function run(promise: Promise<DpeLookupResult>) {
    setLoading(true);
    setSearched(false);
    setProviderDown(false);
    const r = await promise;
    setLoading(false);
    setSearched(true);
    if (!r.ok) {
      setProviderDown(true);
      setResults([]);
      return;
    }
    setResults(r.results);
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
    setSearched(false);
  }

  /** « Changer » : efface la sélection et rouvre la recherche (spec questionnaire §1). */
  function clearSelection() {
    setField("dpe", null);
    setResults([]);
    setSearched(false);
  }

  function dismissResults() {
    setResults([]);
    setSearched(false);
  }

  return (
    <div className="space-y-6">
      {/* Région live TOUJOURS montée : la confirmation est annoncée à son apparition. */}
      <div aria-live="polite">
        {selected && draft.dpe ? <DpeSelectedCard dpe={draft.dpe} onClear={clearSelection} /> : null}
      </div>

      {selected ? null : (
        <>
          {draft.address ? (
            <Button
              variant="ghost"
              disabled={loading}
              onClick={() => run(lookupDpeAction({ label: draft.address!.label }))}
            >
              {loading ? "Recherche…" : "Rechercher mon DPE à cette adresse"}
            </Button>
          ) : null}

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <TextField
                label="…ou par numéro de DPE"
                hint="13 caractères, ex. 2611E0031228S"
                value={numero}
                onChange={setNumero}
                mono
              />
            </div>
            <Button
              disabled={loading || numero.trim().length < 13}
              onClick={() => run(lookupDpeAction({ numero }))}
              className="mt-1"
            >
              OK
            </Button>
          </div>

          <DpeSearchResults
            results={results}
            providerDown={providerDown}
            searched={searched}
            loading={loading}
            onPick={pick}
            onDismiss={dismissResults}
          />

          {/* Saisie manuelle */}
          <div className="space-y-4 border-t border-line pt-6">
            <ChoiceField
              label="Saisir la classe manuellement"
              choices={CLASSES.map((c) => ({ value: c, label: c }))}
              value={
                draft.dpe?.source === "USER_INPUT"
                  ? (draft.dpe.class as (typeof CLASSES)[number])
                  : undefined
              }
              onChange={(c) => {
                setField("dpeUnknown", false);
                setField("dpe", { class: c, date: draft.dpe?.date ?? "", source: "USER_INPUT" });
              }}
            />
            {draft.dpe?.source === "USER_INPUT" ? (
              <DateField
                label="Date d'établissement du DPE"
                hint="Indispensable pour le calcul du gel."
                value={draft.dpe.date}
                onChange={(v) => setField("dpe", { ...draft.dpe!, date: v, source: "USER_INPUT" })}
              />
            ) : null}
          </div>

          <div>
            {/* Copy deck §2 — option « DPE introuvable » (libellé + note mot pour mot). */}
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
              Je ne le connais pas — continuer sans
            </button>
            <p className="mt-1 text-xs text-ink/50">
              Nous ne pourrons pas vérifier le gel des loyers, mais les autres vérifications
              restent possibles.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/** Facultatif, MAIS une saisie manuelle exige une date ISO valide (sinon calcul faussé). */
export const dpeValid = (d: StepProps["draft"]): boolean => {
  if (d.dpe?.source === "USER_INPUT") return /^\d{4}-\d{2}-\d{2}$/.test(d.dpe.date);
  return true;
};
