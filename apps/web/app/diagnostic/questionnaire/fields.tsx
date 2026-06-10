"use client";

import { useId, type ReactNode } from "react";
import { Field } from "@/components/ui/Field";

/**
 * Enveloppe label/aide conservée pour l'autocomplete d'adresse (combobox, T3).
 * Les champs simples du tunnel passent par `Field` P1 (label flottant) ci-dessous.
 */
export function FieldShell({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-ink/50">{hint}</span> : null}
    </label>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  inputMode,
  mono = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "text" | "numeric" | "decimal";
  /** Valeur en mono `tabular` (numéros, références, valeurs chiffrées). */
  mono?: boolean;
}) {
  const id = useId();
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputClassName={mono ? "font-mono tabular" : undefined}
    />
  );
}

/** Saisie d'un montant en euros → centimes (int). Champ vide = undefined. */
export function MoneyField({
  label,
  hint,
  cents,
  onChange,
}: {
  label: string;
  hint?: string;
  cents?: number;
  onChange: (cents: number | undefined) => void;
}) {
  const id = useId();
  const value = cents === undefined ? "" : (cents / 100).toString();
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => {
        const raw = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
        if (raw === "") return onChange(undefined);
        const euros = Number.parseFloat(raw);
        onChange(Number.isFinite(euros) ? Math.round(euros * 100) : undefined);
      }}
      suffix="€"
      inputClassName="font-mono tabular"
    />
  );
}

/** Saisie de date ISO (AAAA-MM-JJ) sur `Field` P1 — label flottant figé en haut. */
export function DateField({
  label,
  hint,
  value,
  onChange,
  max,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  max?: string;
}) {
  const id = useId();
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      type="date"
      value={value}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      inputClassName="font-mono tabular"
    />
  );
}

export interface Choice<T extends string> {
  value: T;
  label: string;
}

/** Groupe de boutons radio en pilules v2 (oui / non / je ne sais pas…). */
export function ChoiceField<T extends string>({
  label,
  hint,
  choices,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  choices: Choice<T>[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink/80">{label}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {choices.map((c) => {
          const active = c.value === value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              aria-pressed={active}
              className={`rounded-badge border px-5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                active
                  ? "border-ink bg-ink text-paper shadow-sm"
                  : "border-line bg-paper text-ink/80 hover:border-ink/40 hover:shadow-sm"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {hint ? <p className="mt-1.5 text-xs text-ink/50">{hint}</p> : null}
    </fieldset>
  );
}
