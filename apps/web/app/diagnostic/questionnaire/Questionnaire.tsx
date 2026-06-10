"use client";

import { useState, type ReactNode } from "react";
import type { DiagnosticDraft, StepProps } from "./use-diagnostic-form";
import { useDiagnosticForm } from "./use-diagnostic-form";
import { AddressStep, addressValid } from "./steps/AddressStep";
import { HousingStep, housingValid } from "./steps/HousingStep";
import { DpeStep, dpeValid } from "./steps/DpeStep";
import { LeaseStep, leaseValid } from "./steps/LeaseStep";
import { RentStep, rentValid } from "./steps/RentStep";
import { RevisionStep, revisionValid } from "./steps/RevisionStep";
import { RevisionHistoryStep, revisionHistoryValid } from "./steps/RevisionHistoryStep";
import { RecapStep, recapValid } from "./steps/RecapStep";

interface StepDef {
  title: string;
  subtitle?: string;
  Component: (p: StepProps) => ReactNode;
  valid: (d: DiagnosticDraft) => boolean;
}

const STEPS: StepDef[] = [
  { title: "Où habitez-vous ?", subtitle: "L'adresse de votre logement loué.", Component: AddressStep, valid: addressValid },
  { title: "Votre logement", subtitle: "Quelques caractéristiques.", Component: HousingStep, valid: housingValid },
  { title: "Le DPE du logement", subtitle: "Le diagnostic énergétique conditionne le gel des loyers.", Component: DpeStep, valid: dpeValid },
  { title: "Votre bail", Component: LeaseStep, valid: leaseValid },
  { title: "Vos loyers", subtitle: "Hors charges.", Component: RentStep, valid: rentValid },
  { title: "La révision du loyer", Component: RevisionStep, valid: revisionValid },
  { title: "Historique des hausses", subtitle: "Facultatif — pour un calcul plus précis.", Component: RevisionHistoryStep, valid: revisionHistoryValid },
  { title: "Récapitulatif", subtitle: "Vérifiez avant de lancer le diagnostic.", Component: RecapStep, valid: recapValid },
];

export function Questionnaire() {
  const { draft, setField, hydrated, submit, submitting, error } = useDiagnosticForm();
  const [i, setI] = useState(0);

  if (!hydrated) {
    return <p className="mt-10 text-ink/50">Chargement…</p>;
  }

  const step = STEPS[i]!;
  const isLast = i === STEPS.length - 1;
  const canNext = step.valid(draft);

  return (
    <div className="mt-8">
      {/* Progression segmentée */}
      <div className="flex gap-1.5" aria-label={`Étape ${i + 1} sur ${STEPS.length}`}>
        {STEPS.map((_, idx) => (
          <span
            key={idx}
            className={`h-1 flex-1 rounded-badge ${idx <= i ? "bg-ink" : "bg-line"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-ink/50">
        Étape {i + 1} sur {STEPS.length}
      </p>

      <h1 className="mt-4 font-display text-2xl font-extrabold tracking-display">{step.title}</h1>
      {step.subtitle ? <p className="mt-1 text-ink/60">{step.subtitle}</p> : null}

      <div className="mt-6">
        <step.Component draft={draft} setField={setField} />
      </div>

      {error ? <p className="mt-4 text-sm text-stamp">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0 || submitting}
          className="rounded-field px-4 py-3 text-sm text-ink/60 hover:text-ink disabled:opacity-0"
        >
          ← Retour
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="rounded-field bg-refund px-6 py-3 font-medium text-paper transition-colors hover:bg-refund-text disabled:opacity-60"
          >
            {submitting ? "Analyse…" : "Voir mon résultat"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setI((n) => Math.min(STEPS.length - 1, n + 1))}
            disabled={!canNext}
            className="rounded-field bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-40"
          >
            Continuer
          </button>
        )}
      </div>
    </div>
  );
}
