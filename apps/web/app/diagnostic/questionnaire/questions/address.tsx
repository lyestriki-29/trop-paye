"use client";

import type { StepProps } from "../use-diagnostic-form";
import { AddressStep } from "../steps/AddressStep";

/**
 * Question Adresse : réutilise le corps d'`AddressStep` (autocomplete IGN +
 * repli saisie manuelle). Aucun changement de comportement — la sélection
 * pose `address` et déclenche l'avance auto côté orchestrateur.
 */
export function AddressQ(p: StepProps) {
  return <AddressStep {...p} />;
}
