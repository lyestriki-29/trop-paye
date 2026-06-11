"use client";

import type { StepProps } from "../use-diagnostic-form";
import { MonthYearField } from "../fields";

/** Mois + année suffisent (décision Lyes 2026-06-11) : moins de friction que le
    date picker natif, et l'approximation au 1er du mois reste conservatrice. */
export function LeaseStep({ draft, setField }: StepProps) {
  return (
    <MonthYearField
      label="Quand avez-vous signé votre bail ?"
      hint="Le mois et l'année suffisent. Sert à dater les révisions et la prescription (3 ans)."
      value={draft.leaseSignedAt ?? ""}
      onChange={(v) => setField("leaseSignedAt", v || undefined)}
    />
  );
}

export const leaseValid = (): boolean => true; // facultatif
