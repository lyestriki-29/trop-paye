"use client";

import type { StepProps } from "../use-diagnostic-form";
import { FieldShell } from "../fields";

const FIELD_CLASS =
  "mt-1 w-full rounded-field border border-line bg-paper px-4 py-3 outline-none focus:border-ink focus:ring-2 focus:ring-ink/15";

export function LeaseStep({ draft, setField }: StepProps) {
  return (
    <FieldShell
      label="Date de signature du bail"
      hint="Sert à dater les révisions et la prescription (3 ans)."
    >
      <input
        type="date"
        value={draft.leaseSignedAt ?? ""}
        max={new Date().toISOString().slice(0, 10)}
        onChange={(e) => setField("leaseSignedAt", e.target.value || undefined)}
        className={FIELD_CLASS}
      />
    </FieldShell>
  );
}

export const leaseValid = (): boolean => true; // facultatif
