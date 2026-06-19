"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { anniversariesBetween, type ConstructionPeriod } from "@troppaye/rules-engine";
import type { AddressSuggestion } from "@/lib/providers/geo";
import { submitDiagnostic } from "@/app/diagnostic/actions";

const STORAGE_KEY = "tp_diagnostic_draft_v1";

export interface DpeDraft {
  class: string;
  date: string;
  numero?: string;
  surfaceM2?: number;
  source: "ADEME_API" | "USER_INPUT";
  /** Descripteurs ADEME (spec questionnaire §1) — affichage UNIQUEMENT, ignorés par le zod serveur. */
  etage?: number;
  complementLogement?: string;
  batiment?: string;
  residence?: string;
  typeBatiment?: string;
  anneeConstruction?: number;
}

export interface DiagnosticDraft {
  address?: AddressSuggestion;
  surfaceM2?: number;
  furnished?: boolean;
  /** Nombre de pièces principales (1 à 4 ; 4 = « 4 et plus ») — clé du barème d'encadrement. */
  roomCount?: number;
  /** « Je ne sais pas » sur le nombre de pièces (UI : pilule sélectionnée). */
  roomCountUnknown?: boolean;
  /** Époque de construction (fourchette) — clé du barème d'encadrement. */
  constructionPeriod?: ConstructionPeriod;
  /** « Je ne sais pas » sur l'époque de construction (UI : pilule sélectionnée). */
  constructionPeriodUnknown?: boolean;
  /** Colocation (LOT 1.3) : toggle étape 2. */
  isShared?: boolean;
  /** Nombre total de colocataires (n) — requis en saisie « ma part ». */
  tenantCount?: number;
  /** Base de saisie des loyers (étape 5) : total du logement, ou part personnelle. */
  rentBasis?: "TOTAL" | "SHARE";
  dpe?: DpeDraft | null;
  dpeUnknown?: boolean;
  leaseSignedAt?: string;
  initialRentCents?: number;
  currentRentCents?: number;
  /** Complément de loyer au bail (retour Lyes 2026-06-11) : signal d'orientation. */
  rentSupplement?: "OUI" | "NON" | "NSP";
  rentSupplementCents?: number;
  /** Caractéristiques exceptionnelles déclarées (justifient le complément). */
  rentSupplementExceptional?: "OUI" | "NON" | "NSP";
  /** Critères 3DS cochés (LOT 1.2) ; ids de COMPLEMENT_3DS_CRITERIA. */
  complementCriteria?: string[];
  revisionClause?: boolean;
  revisionQuarter?: string;
  /** « Je ne sais pas » (spec §3) : trimestre déduit du mois de signature côté serveur. */
  revisionQuarterUnknown?: boolean;
  revisions: { date: string; rentCents: number }[];
  /** Dépôt de garantie versé (LOT 1, règle DEPOSIT_CAP) : optionnel, vide = non évalué. */
  depositPaidCents?: number;
  /** Dépôt versé en nombre de mois (boutons 1/2/3) ; converti en centimes côté serveur. */
  depositPaidMonths?: 1 | 2 | 3;
  /** Mode de saisie des loyers (spec §2) : HC par défaut, CC = charges comprises. */
  rentInputMode?: "HC" | "CC";
  chargesCents?: number;
  /** true tant que la valeur pré-remplie au barème n'a pas été modifiée (spec §2). */
  chargesEstimated?: boolean;
  /** Éditeur des hausses (spec §4) : par anniversaire de bail, ou libre (repli). */
  revisionsMode?: "ANNIVERSARY" | "FREE";
  /** Montants saisis par date d'anniversaire (mode ANNIVERSARY). */
  anniversaryRents?: Record<string, number>;
  /** Anniversaires explicitement marqués « Pas de hausse cette année ». */
  noIncreaseDates?: string[];
}

/**
 * Mode effectif de l'éditeur de hausses : anniversaire si la date de bail est
 * connue ET qu'au moins un anniversaire est passé (bail < 1 an → l'éditeur
 * anniversaire n'aurait rien à montrer : repli libre, retour Lyes 2026-06-11).
 */
export function revisionsEditorMode(d: DiagnosticDraft): "ANNIVERSARY" | "FREE" {
  if (!d.leaseSignedAt) return "FREE";
  const today = new Date().toISOString().slice(0, 10);
  if (anniversariesBetween(d.leaseSignedAt, today).length === 0) return "FREE";
  return d.revisionsMode ?? "ANNIVERSARY";
}

/**
 * Hausses réellement soumises au diagnostic : lignes anniversaire renseignées
 * (mode ANNIVERSARY — les dates obsolètes d'un bail modifié sont élaguées par
 * recalcul) ou lignes libres complètes (mode FREE).
 */
export function effectiveRevisions(
  d: DiagnosticDraft,
  asOf: string,
): { date: string; rentCents: number }[] {
  if (revisionsEditorMode(d) === "ANNIVERSARY" && d.leaseSignedAt) {
    const rents = d.anniversaryRents ?? {};
    return anniversariesBetween(d.leaseSignedAt, asOf)
      .map((date) => ({ date, rentCents: rents[date] ?? 0 }))
      .filter((r) => r.rentCents > 0);
  }
  return d.revisions.filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.rentCents > 0);
}

const EMPTY: DiagnosticDraft = { revisions: [] };

export type SetField = <K extends keyof DiagnosticDraft>(
  key: K,
  value: DiagnosticDraft[K],
) => void;

export interface StepProps {
  draft: DiagnosticDraft;
  setField: SetField;
  /** Avance d'une étape (boutons « je ne sais pas » : friction réduite, retour Lyes 2026-06-11). */
  goNext?: () => void;
}

/** Construit l'objet validé par `diagnosticSchema` à partir du brouillon UI. */
function buildPayload(draft: DiagnosticDraft): Record<string, unknown> {
  return {
    addressLabel: draft.address?.label ?? "",
    banId: draft.address?.banId || undefined,
    inseeCode: draft.address?.inseeCode || undefined,
    // Coordonnées IGN conservées pour le géo-rattachement encadrement (point-in-polygon).
    lat: draft.address?.lat,
    lon: draft.address?.lon,
    surfaceM2: draft.surfaceM2,
    furnished: draft.furnished,
    // NSP → undefined (le champ « unknown » reste local à l'UI, jamais envoyé).
    roomCount: draft.roomCount,
    constructionPeriod: draft.constructionPeriod,
    isShared: draft.isShared,
    tenantCount: draft.isShared ? draft.tenantCount : undefined,
    // « ma part » n'a de sens qu'en coloc ; hors coloc on force le total (n=1).
    rentBasis: draft.isShared ? (draft.rentBasis ?? "TOTAL") : "TOTAL",
    dpe: draft.dpe ?? null,
    leaseSignedAt: draft.leaseSignedAt,
    initialRentCents: draft.initialRentCents,
    currentRentCents: draft.currentRentCents,
    // Lignes anniversaire ou libres, incomplètes ignorées (cf. effectiveRevisions).
    revisions: effectiveRevisions(draft, new Date().toISOString().slice(0, 10)),
    // Dépôt en mois : interdit en coloc « ma part » (le loyer reconstitué ×n
    // fausserait la conversion) → on n'envoie alors que le montant exact.
    depositPaidMonths: draft.rentBasis === "SHARE" ? undefined : draft.depositPaidMonths,
    depositPaidCents:
      draft.rentBasis !== "SHARE" && draft.depositPaidMonths !== undefined
        ? undefined
        : draft.depositPaidCents,
    rentSupplement: draft.rentSupplement,
    rentSupplementCents: draft.rentSupplement === "OUI" ? draft.rentSupplementCents : undefined,
    rentSupplementExceptional:
      draft.rentSupplement === "OUI" ? draft.rentSupplementExceptional : undefined,
    complementCriteria: draft.rentSupplement === "OUI" ? draft.complementCriteria : undefined,
    revisionClause: draft.revisionClause,
    revisionQuarter: draft.revisionQuarter,
    revisionQuarterUnknown: draft.revisionQuarterUnknown,
    rentInputMode: draft.rentInputMode,
    chargesCents: draft.rentInputMode === "CC" ? draft.chargesCents : undefined,
    chargesEstimated: draft.rentInputMode === "CC" ? draft.chargesEstimated : undefined,
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
      if (raw) {
        setDraft({ ...EMPTY, ...(JSON.parse(raw) as DiagnosticDraft) });
      }
    } catch {
      /* brouillon illisible : on repart à vide */
    }
    setHydrated(true);
  }, []);

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
    } catch {
      /* non bloquant */
    }
    router.push(`/diagnostic/${res.verdictId}`);
  }, [draft, router]);

  return { draft, setField, hydrated, submit, submitting, error };
}
