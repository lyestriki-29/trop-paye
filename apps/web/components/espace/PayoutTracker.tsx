import { Amount } from "@/components/Amount";
import type { PayoutStage } from "@/lib/espace/payout";

export interface PayoutTrackerProps {
  stage: PayoutStage;
  recoverableCents: number;
  netCents: number;
}

interface Step {
  label: string;
  reached: boolean;
}

function buildSteps(stage: PayoutStage): Step[] {
  return [
    { label: "Récupéré", reached: stage === "recovered" || stage === "paid" },
    { label: "Programmé", reached: stage === "paid" },
    { label: "Versé", reached: stage === "paid" },
  ];
}

export function PayoutTracker({ stage, recoverableCents, netCents }: PayoutTrackerProps) {
  const steps = buildSteps(stage);

  return (
    <div className="rounded-card border border-line bg-paper-2 p-5 space-y-5">
      {/* Étapes */}
      <ol className="flex items-center gap-3">
        {steps.map((step, i) => (
          <li key={step.label} className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-sm">
              <span
                className={[
                  "inline-block h-3 w-3 rounded-full border",
                  step.reached
                    ? "bg-refund border-refund"
                    : "bg-transparent border-line",
                ].join(" ")}
                aria-hidden="true"
              />
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span className="h-px w-6 bg-line" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      {/* Montants */}
      <div className="rounded-card border border-line bg-paper p-4 space-y-1">
        <p className="text-xs text-ink/50 uppercase tracking-wide">Vous recevrez</p>
        <Amount cents={netCents} favorable className="text-2xl font-medium" />
        <p className="text-xs text-ink/60">
          après commission de 25 %{" "}
          <span className="font-mono tabular-nums text-ink/40">
            (sur <Amount cents={recoverableCents} />)
          </span>
        </p>
      </div>
    </div>
  );
}
