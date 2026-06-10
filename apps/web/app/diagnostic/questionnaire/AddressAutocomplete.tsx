"use client";

import { useEffect, useRef, useState } from "react";
import { searchAddressAction } from "@/app/diagnostic/actions";
import type { AddressSuggestion } from "@/lib/providers/geo";
import { FieldShell } from "./fields";

const FIELD_CLASS =
  "mt-1 w-full rounded-field border border-line bg-paper px-4 py-3 outline-none focus:border-ink focus:ring-2 focus:ring-ink/15";

export function AddressAutocomplete({
  value,
  onSelect,
}: {
  value?: AddressSuggestion;
  onSelect: (a: AddressSuggestion) => void;
}) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);

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

  return (
    <FieldShell
      label="Adresse du logement"
      hint="Commencez à taper, puis choisissez dans la liste (source : Géoplateforme IGN)."
    >
      <div className="relative">
        <input
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
          placeholder="12 rue des Lilas, 75011 Paris"
          className={FIELD_CLASS}
        />
        {loading ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink/40">…</span>
        ) : null}
        {open && results.length > 0 ? (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-field border border-line bg-paper shadow-sm">
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
      {value ? (
        <span className="mt-1 block text-xs text-refund-text">✓ Adresse sélectionnée</span>
      ) : null}
    </FieldShell>
  );
}
