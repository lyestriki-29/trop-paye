"use client";

import { useState } from "react";

/**
 * Sélecteur de déclinaison pastel (design-lab uniquement) : bascule la classe
 * de thème sur le scope `.nb` côté client — les sections lisent les vars CSS,
 * donc le changement est instantané, sans rechargement. La barre de contrôle
 * vit HORS du scope `.nb` (UI d'outil neutre, charte standard).
 */

const VARIANTS = [
  { id: "douce", label: "Douce", hint: "lavande + rose + jaune, titres capitales" },
  { id: "temperee", label: "Tempérée", hint: "jaune seul, fonds neutres, bandeau sombre" },
  { id: "editoriale", label: "Éditoriale", hint: "casse normale, déco minimale" },
] as const;

type VariantId = (typeof VARIANTS)[number]["id"];

export function VariantSwitcher({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<VariantId>("douce");
  const scope = variant === "douce" ? "nb" : `nb nb--${variant}`;
  const active = VARIANTS.find((v) => v.id === variant);

  return (
    <>
      <div className={`${scope} min-h-screen`}>{children}</div>

      <div className="fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4">
        <div className="flex max-w-full flex-col items-center gap-1 rounded-2xl border border-ink/15 bg-paper/95 px-3 py-2 shadow-deep backdrop-blur">
          <div className="flex items-center gap-1">
            <span className="px-2 font-mono text-[11px] uppercase tracking-widest text-ink/45">
              Variante
            </span>
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                aria-pressed={variant === v.id}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  variant === v.id
                    ? "bg-ink text-paper"
                    : "text-ink/70 hover:bg-paper-2"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          {active ? (
            <p className="px-2 text-center text-[11px] text-ink/45">{active.hint}</p>
          ) : null}
        </div>
      </div>
    </>
  );
}
