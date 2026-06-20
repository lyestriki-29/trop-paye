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
  /** Optionnel : la séquence verdict imprime ses lignes animées en `children`. */
  rows?: ReadonlyArray<QuittanceRow>;
  total?: { label: string; cents: number };
  children?: ReactNode; // annotations, CTA, mentions
  /** Espacement généreux du moment verdict (séquence signature, charte §4). */
  spotlight?: boolean;
  /** Bord inférieur de ticket perforé (premium v2.1 — reçus, preuves). */
  perforated?: boolean;
  /** Variante DA « quittance » (nb) : surface `nb-card` (bord 3px + ombre dure). */
  nb?: boolean;
  /** Pied détachable : perforation pointillée + code-barres (scope `.nb`). */
  footerBarcode?: string | boolean;
  className?: string;
}

export function QuittanceCard({
  reference,
  kind,
  meta,
  rows = [],
  total,
  children,
  spotlight = false,
  perforated = false,
  nb = false,
  footerBarcode,
  className,
}: QuittanceCardProps) {
  // Surface : sobre charte (`rounded-card border`) ou reçu dur nb (`nb-card`).
  const surface = nb
    ? "nb-card bg-paper"
    : `rounded-card border border-line bg-paper ${perforated ? "receipt-edge rounded-b-none border-b-0 pb-3" : ""}`;
  // Filets/labels : encre nb sous scope `.nb`, encre charte sinon.
  const rule = nb ? "border-nb-ink/15" : "border-line";
  const monoMuted = nb ? "text-nb-ink/55" : "text-ink/55";
  return (
    <section className={`overflow-hidden ${surface} ${className ?? ""}`}>
      <header
        className={`flex items-center justify-between gap-4 border-b ${rule} ${nb ? "" : "bg-paper-2"} py-3 font-mono text-[11px] uppercase tracking-widest ${monoMuted} ${spotlight ? "px-7 sm:px-12" : "px-5"}`}
      >
        <span>{reference}</span>
        <span>{kind}</span>
      </header>
      <div className={spotlight ? "p-7 sm:p-12" : "px-5 py-5"}>
        {meta ? <p className="font-mono text-xs text-ink/55">{meta}</p> : null}
        {rows.length > 0 ? (
          <dl className={meta ? "mt-4" : ""}>
            {rows.map((row) => (
              <div
                key={row.label}
                className={
                  row.highlight
                    ? "-mx-2 flex items-baseline justify-between gap-6 rounded-field bg-accent px-2 py-2.5"
                    : `flex items-baseline justify-between gap-6 border-b border-dashed ${rule} py-2.5`
                }
              >
                <dt
                  className={`shrink-0 text-sm ${row.highlight ? "font-medium text-ink" : "text-ink/70"}`}
                >
                  {row.label}
                </dt>
                {/* Montants : jamais coupés. Textes longs (descriptif logement) :
                    retour à la ligne au lieu d'être tronqués (retour Lyes 2026-06-11). */}
                <dd
                  className={`tabular font-mono text-sm text-ink ${
                    row.cents !== undefined ? "whitespace-nowrap" : "min-w-0 break-words text-right"
                  }`}
                >
                  {row.cents !== undefined ? formatEUR(row.cents, { decimals: true }) : row.text}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {total ? (
          <div className={`mt-4 flex items-end justify-between gap-6 border-t-2 ${nb ? "border-nb-ink" : "border-ink"} pt-4`}>
            <p className={`text-sm font-medium ${nb ? "text-nb-ink/80" : "text-ink/80"}`}>{total.label}</p>
            <p className="tabular whitespace-nowrap font-mono text-xl font-medium text-refund-text">
              {formatEUR(total.cents, { decimals: true })}
            </p>
          </div>
        ) : null}
        {children}
        {footerBarcode ? (
          <div className="mt-6 border-t-2 border-dashed border-nb-ink/40 pt-3">
            <div className="v3-barcode h-9 w-full" aria-hidden />
            {typeof footerBarcode === "string" ? (
              <p className="nb-mono mt-2 text-center text-[10px] tracking-[0.3em] text-nb-ink/45">
                {footerBarcode}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
