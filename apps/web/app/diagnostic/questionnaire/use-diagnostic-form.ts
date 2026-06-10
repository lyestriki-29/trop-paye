"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AddressSuggestion } from "@/lib/providers/geo";
import { submitDiagnostic } from "@/app/diagnostic/actions";

const STORAGE_KEY = "tp_diagnostic_draft_v1";
const STEP_KEY = "tp_diagnostic_step_v1";

export interface DpeDraft {
  class: string;
  date: string;
  numero?: string;
  surfaceM2?: number;
  source: "ADEME_API" | "USER_INPUT";
}

export interface DiagnosticDraft {
  address?: AddressSuggestion;
  surfaceM2?: number;
  furnished?: boolean;
  dpe?: DpeDraft | null;
  dpeUnknown?: boolean;
  leaseSignedAt?: string;
  initialRentCents?: number;
  currentRentCents?: number;
  revisionClause?: boolean;
  revisionQuarter?: string;
  revisions: { date: string; rentCents: number }[];
}

const EMPTY: DiagnosticDraft = { revisions: [] };

export type SetField = <K extends keyof DiagnosticDraft>(
  key: K,
  value: DiagnosticDraft[K],
) => void;

export interface StepProps {
  draft: DiagnosticDraft;
  setField: SetField;
}

/** Construit l'objet validé par `diagnosticSchema` à partir du brouillon UI. */
function buildPayload(draft: DiagnosticDraft): Record<string, unknown> {
  return {
    addressLabel: draft.address?.label ?? "",
    banId: draft.address?.banId || undefined,
    inseeCode: draft.address?.inseeCode || undefined,
    surfaceM2: draft.surfaceM2,
    furnished: draft.furnished,
    dpe: draft.dpe ?? null,
    leaseSignedAt: draft.leaseSignedAt,
    initialRentCents: draft.initialRentCents,
    currentRentCents: draft.currentRentCents,
    // Ignore les lignes de révision incomplètes (date manquante ou montant nul/négatif).
    revisions: draft.revisions.filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.rentCents > 0),
    revisionClause: draft.revisionClause,
    revisionQuarter: draft.revisionQuarter,
  };
}

export function useDiagnosticForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<DiagnosticDraft>(EMPTY);
  const [stepIndex, setStepIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restaure brouillon + étape après le montage (évite tout mismatch d'hydratation SSR).
  // L'étape n'est restaurée que si un brouillon existe (sinon retour à l'étape 0).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setDraft({ ...EMPTY, ...(JSON.parse(raw) as DiagnosticDraft) });
        const savedStep = Number.parseInt(localStorage.getItem(STEP_KEY) ?? "", 10);
        if (Number.isInteger(savedStep) && savedStep >= 0) setStepIndex(savedStep);
      }
    } catch {
      /* brouillon illisible : on repart à vide */
    }
    setHydrated(true);
  }, []);

  // Persiste l'étape courante.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STEP_KEY, String(stepIndex));
    } catch {
      /* non bloquant */
    }
  }, [stepIndex, hydrated]);

  // Autosave débouncé (évite une écriture localStorage à chaque frappe).
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {
        /* quota/private mode : non bloquant */
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [draft, hydrated]);

  const setField = useCallback(
    <K extends keyof DiagnosticDraft>(key: K, value: DiagnosticDraft[K]) => {
      setDraft((d) => ({ ...d, [key]: value }));
    },
    [],
  );

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    const res = await submitDiagnostic(buildPayload(draft));
    if ("error" in res) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
    } catch {
      /* non bloquant */
    }
    router.push(`/diagnostic/${res.verdictId}`);
  }, [draft, router]);

  return { draft, setField, stepIndex, setStepIndex, hydrated, submit, submitting, error };
}
