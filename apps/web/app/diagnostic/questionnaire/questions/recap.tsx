"use client";

import type { StepProps } from "../use-diagnostic-form";

/**
 * Écran de récapitulatif (placeholder Phase A) : l'orchestrateur affiche les
 * blocs confirmés éditables + le bouton de soumission gaté par `canSubmit`.
 * La vraie liste de synthèse est construite côté orchestrateur (Task 10).
 */
export function RecapQ(_p: StepProps) {
  return (
    <p className="text-sm text-ink/70">
      Vérifiez vos réponses puis lancez le diagnostic.
    </p>
  );
}
