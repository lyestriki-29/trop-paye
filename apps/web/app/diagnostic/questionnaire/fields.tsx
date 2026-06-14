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
      inputClassName={mono ? "nb-field font-mono tabular" : "nb-field"}
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
      inputClassName="nb-field font-mono tabular"
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
      inputClassName="nb-field font-mono tabular"
    />
  );
}

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

const SELECT_CLS = "nb-field";

/**
 * Mois + année (décision Lyes 2026-06-11 : pas de date exacte, le date picker
 * natif casse l'expérience). Valeur ISO au 1er du mois — approximation
 * CONSERVATRICE pour le moteur : autour d'une date pivot (gel 24/08/2022), le
 * 1er du mois classe le bail AVANT le pivot, donc jamais de droit sur-estimé.
 */
export function MonthYearField({
  label,
  hint,
  value,
  onChange,
  fromYear = 1989,
}: {
  label: string;
  hint?: string;
  /** ISO AAAA-MM-JJ (jour figé au 01) ou chaîne vide. */
  value: string;
  onChange: (v: string) => void;
  fromYear?: number;
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const month = value ? Number(value.slice(5, 7)) : 0;
  const year = value ? Number(value.slice(0, 4)) : 0;
  const years: number[] = [];
  for (let y = currentYear; y >= fromYear; y -= 1) years.push(y);

  // Sélection partielle tolérée : la valeur ne sort que complète (mois ET année).
  const emit = (m: number, y: number) => {
    if (m >= 1 && y >= fromYear) onChange(`${y}-${String(m).padStart(2, "0")}-01`);
    else onChange("");
  };

  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink/80">{label}</legend>
      <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-2">
        <select
          aria-label="Mois"
          value={month || ""}
          onChange={(e) => emit(Number(e.target.value), year || currentYear)}
          className={SELECT_CLS}
        >
          <option value="" disabled>
            Mois
          </option>
          {MONTHS.map((m, i) => (
            <option
              key={m}
              value={i + 1}
              disabled={(year || currentYear) === currentYear && i + 1 > currentMonth}
            >
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="Année"
          value={year || ""}
          onChange={(e) => {
            const y = Number(e.target.value);
            // Mois futur devenu invalide après changement d'année → on le purge.
            const m = y === currentYear && month > currentMonth ? 0 : month;
            emit(m, y);
          }}
          className={`${SELECT_CLS} font-mono tabular`}
        >
          <option value="" disabled>
            Année
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {hint ? <p className="mt-1.5 text-xs text-ink/50">{hint}</p> : null}
    </fieldset>
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
              className={`nb-pill focus-visible:outline-none${/je ne sais/i.test(c.label) ? " nb-pill--dashed" : ""}`}
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
