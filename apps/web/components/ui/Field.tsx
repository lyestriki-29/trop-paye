import type { ComponentPropsWithoutRef } from "react";

export interface FieldProps
  extends Omit<ComponentPropsWithoutRef<"input">, "id" | "placeholder"> {
  id: string;
  label: string;
  hint?: string;
  /** Message d'erreur — prioritaire sur `hint`, texte `stamp`. */
  error?: string;
}

/**
 * Champ texte charte v2 : focus ring ink 2 px, label flottant en CSS pur
 * (mécanique `peer` + `placeholder=" "` — aucun JS, aucun état React).
 */
export function Field({ id, label, hint, error, className, ...rest }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <div className="relative">
        <input
          id={id}
          {...rest}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="peer w-full rounded-field border border-line bg-paper px-4 pb-2.5 pt-5 text-base text-ink transition focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-3.5 text-base text-ink/50 transition-all peer-focus:top-1.5 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
        >
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-stamp">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink/60">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
