export interface KpiItem {
  label: string;
  value: string;
  tone?: "default" | "refund" | "stamp";
}

export interface KpiStripProps {
  items: KpiItem[];
}

const TONE_CLASS: Record<NonNullable<KpiItem["tone"]>, string> = {
  default: "text-ink",
  refund: "text-refund-text",
  stamp: "text-stamp",
};

/**
 * Bande de KPI (4 cases max) — DA papier, valeurs mono tabulaires.
 * Server Component.
 */
export function KpiStrip({ items }: KpiStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-field border border-line bg-paper px-4 py-3"
        >
          <p className="text-xs text-ink/60">{item.label}</p>
          <p
            className={`mt-1 font-mono tabular-nums text-base font-medium ${TONE_CLASS[item.tone ?? "default"]}`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
