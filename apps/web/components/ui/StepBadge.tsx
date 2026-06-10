import type { ReactNode } from "react";

export type StepState = "done" | "current" | "todo";

const STATE: Record<StepState, string> = {
  done: "bg-refund text-paper",
  current: "bg-accent text-ink",
  todo: "bg-paper-2 text-ink/60",
};

/**
 * Pastille d'étape charte v2 : rond `badge`, surligneur `accent` pour l'étape
 * courante, `refund` pour le fait. Contenu : numéro mono (« 01 ») ou icône.
 */
export function StepBadge({
  state,
  children,
  className,
}: {
  state: StepState;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-badge font-mono text-xs font-medium tabular ${STATE[state]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
