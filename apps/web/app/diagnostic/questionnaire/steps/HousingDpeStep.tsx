"use client";

import type { StepProps } from "../use-diagnostic-form";
import { HousingStep, housingValid } from "./HousingStep";
import { DpeStep, dpeValid } from "./DpeStep";

/**
 * Écran fusionné « logement + DPE » (simplification 8→5 écrans, 2026-06-12).
 * Réutilise tels quels HousingStep et DpeStep en sous-sections séparées par un
 * filet. Les validations sont combinées (housingDpeValid).
 */
export function HousingDpeStep(props: StepProps) {
  return (
    <div className="space-y-10">
      <HousingStep {...props} />
      <section className="border-t border-line pt-8">
        <h2 className="font-display text-lg font-bold">Le diagnostic énergétique (DPE)</h2>
        <p className="mb-6 mt-1 text-sm text-ink/60">
          Il conditionne le gel des loyers. Vous ne l'avez pas ? « Je ne sais pas » suffit.
        </p>
        <DpeStep {...props} />
      </section>
    </div>
  );
}

export const housingDpeValid = (d: StepProps["draft"]): boolean =>
  housingValid(d) && dpeValid(d);
