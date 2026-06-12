"use client";

import type { StepProps } from "../use-diagnostic-form";
import { LeaseStep, leaseValid } from "./LeaseStep";
import { RevisionStep, revisionValid } from "./RevisionStep";
import { RevisionHistoryStep, revisionHistoryValid } from "./RevisionHistoryStep";

/**
 * Écran fusionné « votre bail » (simplification 8→5 écrans, 2026-06-12) :
 * date de signature + clause de révision + historique des hausses, en trois
 * sous-sections. Tout est facultatif (replis moteur), d'où un seul écran.
 */
export function LeaseDetailsStep(props: StepProps) {
  return (
    <div className="space-y-10">
      <LeaseStep {...props} />
      <section className="border-t border-line pt-8">
        <h2 className="font-display text-lg font-bold">La révision du loyer</h2>
        <p className="mb-6 mt-1 text-sm text-ink/60">
          La clause d'indexation de votre bail. « Je ne sais pas » est accepté.
        </p>
        <RevisionStep {...props} />
      </section>
      <section className="border-t border-line pt-8">
        <h2 className="font-display text-lg font-bold">Vos augmentations de loyer</h2>
        <p className="mb-6 mt-1 text-sm text-ink/60">
          Facultatif — pour un calcul plus précis. Vous pouvez passer cette section.
        </p>
        <RevisionHistoryStep {...props} />
      </section>
    </div>
  );
}

export const leaseDetailsValid = (d: StepProps["draft"]): boolean =>
  leaseValid() && revisionValid() && revisionHistoryValid(d);
