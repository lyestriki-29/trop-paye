import { brand } from "@troppaye/shared";

/**
 * D2 « Relevé de compte » — système de marque.
 * Logotypes en Inter Tight 800 (le thème d2 mappe `font-display` dessus).
 * Marque secondaire « +TP » : écriture comptable, le crédit en vert.
 * SVG : uniquement `currentColor` + classes de tokens (fill-refund…).
 */

/** Proposition A — deux encres : « Payé » bascule en vert refund (le crédit). */
export function LogoA({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 188 40"
      role="img"
      aria-label={brand.name}
      className={`overflow-visible ${className}`}
    >
      <text
        x="0"
        y="31"
        fontSize="34"
        fontWeight={800}
        letterSpacing="-0.02em"
        className="font-display"
      >
        <tspan fill="currentColor">Trop</tspan>
        <tspan className="fill-refund">Payé</tspan>
      </text>
    </svg>
  );
}

/** Proposition B — chiffre intégré : le « 0 » compteur en mono, détourné en vert. */
export function LogoB({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 216 40"
      role="img"
      aria-label={brand.name}
      className={`overflow-visible ${className}`}
    >
      <text
        x="0"
        y="31"
        fontSize="34"
        fontWeight={800}
        letterSpacing="-0.01em"
        fill="currentColor"
        className="font-display"
      >
        <tspan>TR</tspan>
        <tspan fontWeight={500} className="fill-refund font-mono">
          0
        </tspan>
        <tspan>P</tspan>
        <tspan dx="7">PAYÉ</tspan>
      </text>
    </svg>
  );
}

/** Marque secondaire — chip mono « +TP », style ligne de crédit sur un relevé. */
export function MarkTP({ onInk = false }: { onInk?: boolean }) {
  const tone = onInk
    ? "border-refund/40 bg-refund/15 text-refund"
    : "border-refund/30 bg-refund/10 text-refund-text";
  return (
    <span
      className={`inline-flex items-center rounded-badge border px-3 py-1 font-mono text-sm font-medium tabular ${tone}`}
    >
      +TP
    </span>
  );
}

/** Aperçu favicon 32 px — tuile ink, crédit « +TP » en vert (lisible sur les 2 fonds). */
export function FaviconTile({ onInk = false }: { onInk?: boolean }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-field border bg-ink ${
        onInk ? "border-paper/25" : "border-line"
      }`}
    >
      <span className="font-mono text-xs font-medium text-refund">+TP</span>
    </span>
  );
}

/** Gabarit OG 1200×630 — aperçu HTML/CSS réduit (le vrai next/og arrive en P2). */
export function OgCard({ onInk = false }: { onInk?: boolean }) {
  const frame = onInk
    ? "border-paper/15 bg-ink text-paper"
    : "border-line bg-paper text-ink";
  const muted = onInk ? "text-paper/50" : "text-ink/50";
  return (
    <div
      className={`flex aspect-[1200/630] w-full max-w-lg flex-col justify-between rounded-card border p-7 shadow-sm ${frame}`}
    >
      <div className="flex items-center justify-between gap-4">
        <LogoA className="h-5 w-auto" />
        <span className={`font-mono text-xs ${muted}`}>{brand.domain}</span>
      </div>
      <p className="max-w-md font-display text-xl font-extrabold leading-tight tracking-display">
        J'ai vérifié mon loyer :{" "}
        <span className="font-mono font-medium text-refund tabular">1 437 €</span> à
        récupérer
      </p>
      <div className="flex items-center justify-between gap-4">
        <MarkTP onInk={onInk} />
        <span className={`font-mono text-xs ${muted}`}>1200 × 630</span>
      </div>
    </div>
  );
}
