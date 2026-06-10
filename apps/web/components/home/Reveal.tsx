import type { CSSProperties, ReactNode } from "react";

/**
 * Reveal au scroll charte §4 (fade + 16 px, once, sobre mais systématique) —
 * composant SERVEUR : pose `data-reveal` + le délai en custom property, la
 * transition vit dans globals.css et l'observer unique de RevealInit passe
 * l'état à "in". Zéro lib d'animation côté home (TBT).
 */
export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
