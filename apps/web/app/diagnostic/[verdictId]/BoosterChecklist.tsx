"use client";

import type { BoosterChecklistItem } from "@/lib/diagnostic/boosters";

/** Checklist d'une carte booster (extraite de BoostersModule, règle ~200 lignes). */
export function BoosterChecklist({
  items,
  checked,
  onToggle,
}: {
  items: BoosterChecklistItem[];
  checked: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <label
          key={item.id}
          className="flex cursor-pointer items-start gap-3 border-2 border-ink bg-paper px-4 py-3 text-sm transition-transform hover:-translate-y-0.5"
        >
          <input
            type="checkbox"
            checked={checked.includes(item.id)}
            onChange={() => onToggle(item.id)}
            className="mt-0.5 h-4 w-4 accent-ink"
          />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  );
}
