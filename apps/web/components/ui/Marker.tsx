import type { ReactNode } from "react";

/**
 * Surligneur signature (charte v2 §1) : trait `accent` sous le mot
 * (hauteur en em → suit le corps du texte). Premium v2.1 : la barre
 * (`tp-marker`, globals.css) balaie de gauche à droite au reveal —
 * statique en no-JS / reduced-motion.
 */
export function Marker({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span
        aria-hidden
        className="tp-marker absolute inset-x-0 bottom-[0.02em] h-[0.42em] rounded-badge bg-accent"
      />
      <span className="relative">{children}</span>
    </span>
  );
}
