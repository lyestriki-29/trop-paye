import type { ReactNode } from "react";

/**
 * Surligneur signature (charte v2 §1) : trait `accent` sous le mot
 * (hauteur en em → suit le corps du texte). Extrait du témoin
 * design-lab v2 lors de la promotion de la home (P2 Task 3).
 */
export function Marker({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-[0.02em] h-[0.42em] rounded-badge bg-accent"
      />
      <span className="relative">{children}</span>
    </span>
  );
}
