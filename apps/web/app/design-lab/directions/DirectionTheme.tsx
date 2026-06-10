import type { ReactNode } from "react";

const THEME_CLASS = { d1: "theme-d1", d2: "theme-d2", d3: "theme-d3" } as const;
export type DirectionId = keyof typeof THEME_CLASS;

/** Scope un thème du duel : re-ancre fond/texte/police sur les variables du thème. */
export function DirectionTheme({ dir, children }: { dir: DirectionId; children: ReactNode }) {
  return (
    <div className={`${THEME_CLASS[dir]} min-h-screen bg-paper font-body text-ink`}>
      {children}
    </div>
  );
}
