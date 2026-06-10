import { StepBadge, type StepState } from "@/components/ui/StepBadge";

export interface FriseStep {
  label: string;
  /** Détail optionnel (date, précision) — rendu en mono sous le libellé. */
  detail?: string;
  state: StepState;
}

const LABEL: Record<StepState, string> = {
  done: "text-refund-text",
  current: "font-semibold text-ink",
  todo: "text-ink/60",
};

/**
 * Frise de progression « suivi de colis » (charte §7) : étapes verticales
 * reliées par un filet `line`, étape courante marquée du surligneur `accent`
 * (StepBadge `current`), étapes faites en `refund`. Pur, sans I/O.
 */
export function Frise({
  steps,
  className,
}: {
  steps: ReadonlyArray<FriseStep>;
  className?: string;
}) {
  return (
    <ol className={className}>
      {steps.map((step, i) => (
        <li key={step.label} className="relative flex gap-4 pb-7 last:pb-0">
          {i < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute left-4 top-9 h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-line"
            />
          ) : null}
          <StepBadge state={step.state}>
            {String(i + 1).padStart(2, "0")}
          </StepBadge>
          <div className="pt-1.5">
            <p className={`text-sm ${LABEL[step.state]}`}>{step.label}</p>
            {step.detail ? (
              <p className="mt-1 font-mono text-xs text-ink/55">{step.detail}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
