"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchAddressAction } from "@/app/diagnostic/actions";
import type { AddressSuggestion } from "@/lib/providers/geo";
import { FieldShell } from "./fields";

const FIELD_CLASS =
  "mt-1 w-full rounded-field border border-line bg-paper px-4 py-3 outline-none focus:border-ink focus:ring-2 focus:ring-ink/15";
/** Apparence « hero » (home) : pilule XL du témoin v2, posée seule ou dans un conteneur-pilule. */
const HERO_CLASS =
  "w-full rounded-badge border border-line bg-paper px-6 py-4 text-base text-ink placeholder:text-ink/40 outline-none focus:ring-2 focus:ring-accent sm:border-0 sm:bg-transparent sm:py-3";

export function AddressAutocomplete({
  value,
  onSelect,
  appearance = "form",
  placeholder,
}: {
  value?: AddressSuggestion;
  onSelect: (a: AddressSuggestion) => void;
  /** Apparence uniquement — la logique (débounce, anti-réponse-périmée) est identique. */
  appearance?: "form" | "hero";
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);
  const inputId = useId();
  const hero = appearance === "hero";

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3 || q === value?.label) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    const id = ++seq.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      const r = await searchAddressAction(q);
      if (id !== seq.current) return; // réponse périmée
      setResults(r);
      setOpen(true);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, value?.label]);

  const field = (
    <div className="relative">
      {hero ? (
        // Copy deck §2 — titre de l'étape adresse, en label invisible pour le hero.
        <label htmlFor={inputId} className="sr-only">
          Où habitez-vous ?
        </label>
      ) : null}
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        // Copy deck §2 — placeholder de l'étape adresse.
        placeholder={placeholder ?? (hero ? "12 rue de la République, Lyon" : "12 rue des Lilas, 75011 Paris")}
        className={hero ? HERO_CLASS : FIELD_CLASS}
      />
      {loading ? (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink/40">…</span>
      ) : null}
      {open && results.length > 0 ? (
        <ul
          className={`absolute z-10 mt-1 w-full overflow-hidden border border-line bg-paper ${
            hero ? "rounded-card text-left shadow-md" : "rounded-field shadow-sm"
          }`}
        >
          {results.map((r, idx) => (
            <li key={r.banId || `addr-${idx}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r);
                  setQuery(r.label);
                  setResults([]);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-paper-2"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  if (hero) return field;

  return (
    <FieldShell
      label="Adresse du logement"
      hint="Commencez à taper, puis choisissez dans la liste (source : Géoplateforme IGN)."
    >
      {field}
      {value ? (
        <span className="mt-1 block text-xs text-refund-text">✓ Adresse sélectionnée</span>
      ) : null}
    </FieldShell>
  );
}
