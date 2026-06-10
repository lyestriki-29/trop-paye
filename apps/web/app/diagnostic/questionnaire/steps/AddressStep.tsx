"use client";

import type { StepProps } from "../use-diagnostic-form";
import { AddressAutocomplete } from "../AddressAutocomplete";

export function AddressStep({ draft, setField }: StepProps) {
  return (
    <AddressAutocomplete value={draft.address} onSelect={(a) => setField("address", a)} />
  );
}

export const addressValid = (d: StepProps["draft"]): boolean =>
  (d.address?.label?.length ?? 0) >= 3;
