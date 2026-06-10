"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AddressSuggestion } from "@/lib/providers/geo";
import { submitDiagnostic } from "@/app/diagnostic/actions";

const STORAGE_KEY = "tp_diagnostic_draft_v1";

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
    revisions: draft.revisions,
    revisionClause: draft.revisionClause,
    revisionQuarter: draft.revisionQuarter,
  };
}

export function useDiagnosticForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<DiagnosticDraft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restaure le brouillon après le montage (évite tout mismatch d'hydratation SSR).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDraft({ ...EMPTY, ...(JSON.parse(raw) as DiagnosticDraft) });
    } catch {
      /* brouillon illisible : on repart à vide */
    }
    setHydrated(true);
  }, []);

  // Autosave à chaque changement (une fois hydraté).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* quota/private mode : non bloquant */
    }
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
    } catch {
      /* non bloquant */
    }
    router.push(`/diagnostic/${res.verdictId}`);
  }, [draft, router]);

  return { draft, setField, hydrated, submit, submitting, error };
}
