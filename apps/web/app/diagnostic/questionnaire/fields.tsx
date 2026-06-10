"use client";

import type { ReactNode } from "react";

const FIELD_CLASS =
  "mt-1 w-full rounded-field border border-line bg-paper px-4 py-3 outline-none focus:border-ink focus:ring-2 focus:ring-ink/15";

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
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  return (
    <FieldShell label={label} hint={hint}>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={FIELD_CLASS}
      />
    </FieldShell>
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
  const value = cents === undefined ? "" : (cents / 100).toString();
  return (
    <FieldShell label={label} hint={hint}>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
            if (raw === "") return onChange(undefined);
            const euros = Number.parseFloat(raw);
            onChange(Number.isFinite(euros) ? Math.round(euros * 100) : undefined);
          }}
          placeholder="0"
          className={`${FIELD_CLASS} pr-9 font-mono tabular`}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-ink/50">
          €
        </span>
      </div>
    </FieldShell>
  );
}

export interface Choice<T extends string> {
  value: T;
  label: string;
}

/** Groupe de boutons radio (oui / non / je ne sais pas…). */
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
      <div className="mt-2 flex flex-wrap gap-2">
        {choices.map((c) => {
          const active = c.value === value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              aria-pressed={active}
              className={`rounded-field border px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink/80 hover:border-ink/40"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {hint ? <p className="mt-1 text-xs text-ink/50">{hint}</p> : null}
    </fieldset>
  );
}
