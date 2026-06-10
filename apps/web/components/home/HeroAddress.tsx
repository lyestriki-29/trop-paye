"use client";

import { useRouter } from "next/navigation";
import { brand } from "@troppaye/shared";
import { AddressAutocomplete } from "@/app/diagnostic/questionnaire/AddressAutocomplete";
import { Button } from "@/components/ui/Button";
import type { AddressSuggestion } from "@/lib/providers/geo";

// Clés EXACTES de use-diagnostic-form.ts (brouillon + étape du tunnel).
const DRAFT_KEY = "tp_diagnostic_draft_v1";
const STEP_KEY = "tp_diagnostic_step_v1";

function prefillDraft(address: AddressSuggestion) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const draft = raw ? (JSON.parse(raw) as Record<string, unknown>) : { revisions: [] };
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ revisions: [], ...draft, address }));
    localStorage.setItem(STEP_KEY, "1"); // le tunnel reprend à l'étape SUIVANTE
  } catch {
    /* localStorage indisponible : le tunnel repartira de l'étape adresse */
  }
}

/**
 * Champ « tape l'adresse » du hero et du CTA final, câblé sur le VRAI
 * AddressAutocomplete (Géoplateforme IGN) : la sélection préremplit le
 * brouillon du diagnostic puis ouvre le tunnel à l'étape suivante.
 * `/diagnostic` en accès direct reste le parcours complet (étape adresse).
 */
export function HeroAddress() {
  const router = useRouter();
  return (
    <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-2 sm:rounded-badge sm:border sm:border-line sm:bg-paper sm:p-2 sm:shadow-sm">
      <div className="min-w-0 flex-1">
        <AddressAutocomplete
          appearance="hero"
          onSelect={(a) => {
            prefillDraft(a);
            router.push("/diagnostic");
          }}
        />
      </div>
      <Button href="/diagnostic" className="shrink-0">
        {brand.hero.cta}
      </Button>
    </div>
  );
}
