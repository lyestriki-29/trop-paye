"use client";

import type { StepProps } from "../use-diagnostic-form";
import { DateField } from "../fields";

export function LeaseStep({ draft, setField }: StepProps) {
  return (
    <DateField
      label="Date de signature du bail"
      hint="Sert à dater les révisions et la prescription (3 ans)."
      value={draft.leaseSignedAt ?? ""}
      max={new Date().toISOString().slice(0, 10)}
      onChange={(v) => setField("leaseSignedAt", v || undefined)}
    />
  );
}

export const leaseValid = (): boolean => true; // facultatif
