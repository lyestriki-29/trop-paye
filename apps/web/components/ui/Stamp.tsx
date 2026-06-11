import type { CSSProperties } from "react";

/**
 * Tampon administratif (charte §3 — marque secondaire : verdict gagné,
 * réseaux, preuves). Premium v2.1 : « claque » au reveal via `tp-stamp`
 * (globals.css) quand il vit dans un conteneur [data-reveal].
 */
export function Stamp({
  children,
  rotate = -8,
  tone = "stamp",
  className,
}: {
  children: string;
  /** Rotation en degrés (négatif = penché à gauche). */
  rotate?: number;
  tone?: "stamp" | "refund";
  className?: string;
}) {
  const color = tone === "refund" ? "border-refund text-refund" : "border-stamp text-stamp";
  return (
    <span
      className={`tp-stamp inline-block rounded-card border-[3px] px-4 py-1 font-display text-sm font-extrabold uppercase tracking-[0.18em] ${color} ${className ?? ""}`}
      style={{ "--stamp-rotate": `${rotate}deg`, transform: `rotate(${rotate}deg)` } as CSSProperties}
    >
      {children}
    </span>
  );
}
