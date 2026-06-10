import type { ReactNode } from "react";
import { formatEUR } from "@troppaye/shared";

export interface QuittanceRow {
  label: string;
  cents?: number;
  text?: string;
  /** Ligne surlignée `accent` (la ligne fautive / mise en évidence). */
  highlight?: boolean;
}

export interface QuittanceCardProps {
  reference: string; // ex. « Réf. dossier TP-2026-0117 »
  kind: string; // ex. « Quittance de loyer » / « Verdict »
  meta?: string; // ligne mono optionnelle (adresse, date)
  rows: ReadonlyArray<QuittanceRow>;
  total?: { label: string; cents: number };
  children?: ReactNode; // annotations, CTA, mentions
  className?: string;
}

export function QuittanceCard({ reference, kind, meta, rows, total, children, className }: QuittanceCardProps) {
  return (
    <section className={`overflow-hidden rounded-card border border-line bg-paper ${className ?? ""}`}>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-paper-2 px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-ink/55">
        <span>{reference}</span>
        <span>{kind}</span>
      </header>
      <div className="px-5 py-5">
        {meta ? <p className="font-mono text-xs text-ink/55">{meta}</p> : null}
        <dl className={meta ? "mt-4" : ""}>
          {rows.map((row) => (
            <div
              key={row.label}
              className={
                row.highlight
                  ? "-mx-2 flex items-baseline justify-between gap-6 rounded-field bg-accent px-2 py-2.5"
                  : "flex items-baseline justify-between gap-6 border-b border-dashed border-line py-2.5"
              }
            >
              <dt className={`text-sm ${row.highlight ? "font-medium text-ink" : "text-ink/70"}`}>
                {row.label}
              </dt>
              <dd className="tabular whitespace-nowrap font-mono text-sm text-ink">
                {row.cents !== undefined ? formatEUR(row.cents, { decimals: true }) : row.text}
              </dd>
            </div>
          ))}
        </dl>
        {total ? (
          <div className="mt-4 flex items-end justify-between gap-6 border-t-2 border-ink pt-4">
            <p className="text-sm font-medium text-ink/80">{total.label}</p>
            <p className="tabular whitespace-nowrap font-mono text-xl font-medium text-refund-text">
              {formatEUR(total.cents, { decimals: true })}
            </p>
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
