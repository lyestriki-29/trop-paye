"use client";

import type { ReactNode } from "react";

export function ConfirmedBlock({
  label,
  value,
  prefilled,
  onEdit,
}: {
  label: string;
  value: string;
  prefilled?: boolean;
  onEdit: () => void;
}): ReactNode {
  return (
    <div
      className={`nb-confirmed flex items-center justify-between gap-3 rounded-none px-4 py-3${prefilled ? " nb-confirmed--prefill" : ""}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-xs font-bold uppercase tracking-wide text-ink/70">
          {label}
        </span>
        <span className="truncate text-sm text-ink/55">{value}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {prefilled && (
          <span className="border border-[#1a7a4a] px-1.5 py-0.5 text-[10px] font-semibold text-[#1a7a4a]">
            à vérifier
          </span>
        )}
        <button
          type="button"
          aria-label={`Modifier : ${label}`}
          onClick={onEdit}
          className="border-2 border-ink bg-[#e8e0ff] px-2.5 py-1 text-xs font-semibold text-ink transition-transform hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
        >
          ✏️ modifier
        </button>
      </div>
    </div>
  );
}
