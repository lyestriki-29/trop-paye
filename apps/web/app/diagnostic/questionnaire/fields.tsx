"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
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

// `.nb-field` ne pose plus le padding (cf. globals.css) → le select le fournit lui-même.
const SELECT_CLS = "nb-field px-3.5 py-2.5 text-[15px]";

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
  now = new Date(),
}: {
  label: string;
  hint?: string;
  /** ISO AAAA-MM-JJ (jour figé au 01) ou chaîne vide. */
  value: string;
  onChange: (v: string) => void;
  fromYear?: number;
  /** Horloge injectable (tests) ; sinon « maintenant ». */
  now?: Date;
}) {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // État partiel interne : mois et année indépendants, pour un choix dans
  // n'importe quel ordre. Initialisé depuis la valeur ISO contrôlée.
  const [month, setMonth] = useState(value ? Number(value.slice(5, 7)) : 0);
  const [year, setYear] = useState(value ? Number(value.slice(0, 4)) : 0);

  // Resync sur changement EXTERNE complet (édition d'une réponse) ; une valeur
  // vide n'écrase pas une sélection partielle en cours de saisie.
  useEffect(() => {
    if (value) {
      setMonth(Number(value.slice(5, 7)));
      setYear(Number(value.slice(0, 4)));
    }
  }, [value]);

  const years: number[] = [];
  for (let y = currentYear; y >= fromYear; y -= 1) years.push(y);

  // N'émet vers le parent qu'une date complète (mois ET année) ; sinon vide.
  const commit = (m: number, y: number) => {
    if (m >= 1 && y >= fromYear) onChange(`${y}-${String(m).padStart(2, "0")}-01`);
    else onChange("");
  };

  const pickMonth = (m: number) => {
    setMonth(m);
    commit(m, year);
  };
  const pickYear = (y: number) => {
    // Mois devenu futur pour l'année courante → on le purge.
    const m = y === currentYear && month > currentMonth ? 0 : month;
    setMonth(m);
    setYear(y);
    commit(m, y);
  };

  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink/80">{label}</legend>
      <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-2">
        <select
          aria-label="Mois"
          value={month || ""}
          onChange={(e) => pickMonth(Number(e.target.value))}
          className={SELECT_CLS}
        >
          <option value="" disabled>
            Mois
          </option>
          {MONTHS.map((m, i) => (
            <option
              key={m}
              value={i + 1}
              disabled={year === currentYear && i + 1 > currentMonth}
            >
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="Année"
          value={year || ""}
          onChange={(e) => pickYear(Number(e.target.value))}
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

/**
 * Stepper numérique (− valeur +) pour une saisie EXACTE d'un entier (ex. pièces).
 * Valeur indéfinie tant que l'utilisateur n'a pas agi (affiche « — ») ; le premier
 * clic pose le minimum. `min`/`max` bornent ; `max` sert aussi de garde-fou.
 */
export function StepperField({
  label,
  hint,
  value,
  onChange,
  min = 1,
  max = 50,
  suffix,
}: {
  label: string;
  hint?: string;
  value: number | undefined;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const inc = () => onChange(value === undefined ? min : Math.min(max, value + 1));
  const dec = () => onChange(value === undefined ? min : Math.max(min, value - 1));
  // Tant que rien n'est saisi (« — »), on amorce par « + » : « − » reste inactif.
  const atMin = value === undefined || value <= min;
  const atMax = value !== undefined && value >= max;
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink/80">{label}</legend>
      <div className="mt-2.5 flex items-center gap-3">
        <button
          type="button"
          onClick={dec}
          disabled={atMin}
          aria-label="Diminuer"
          style={{ fontSize: "1.4rem", padding: 0 }}
          className="nb-pill flex h-12 w-12 items-center justify-center font-black leading-none disabled:opacity-40"
        >
          −
        </button>
        <output
          aria-live="polite"
          className="flex h-12 min-w-[5rem] items-center justify-center border-2 border-ink bg-paper px-4 font-mono tabular text-2xl font-black text-ink"
          style={{ boxShadow: "3px 3px 0 rgb(var(--color-nb-ink))" }}
        >
          {value === undefined ? "—" : suffix ? `${value} ${suffix}` : value}
        </output>
        <button
          type="button"
          onClick={inc}
          disabled={atMax}
          aria-label="Augmenter"
          style={{ fontSize: "1.4rem", padding: 0 }}
          className="nb-pill flex h-12 w-12 items-center justify-center font-black leading-none disabled:opacity-40"
        >
          +
        </button>
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
