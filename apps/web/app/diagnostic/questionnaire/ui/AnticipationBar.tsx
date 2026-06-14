"use client";

import type { ReactNode } from "react";
import { QUESTIONS } from "../question-graph";
import type { DiagnosticDraft } from "../use-diagnostic-form";
import { applicableQuestions } from "../reveal-state";
import { progress } from "../progress";

export function AnticipationBar({ draft }: { draft: DiagnosticDraft }): ReactNode {
  const pct = Math.round(progress(QUESTIONS, draft) * 100);
  const remaining = applicableQuestions(QUESTIONS, draft).filter(
    (q) => !q.optional && !q.isAnswered(draft),
  ).length;

  const label =
    remaining > 0
      ? `Plus que ${remaining} info${remaining > 1 ? "s" : ""} avant votre estimation`
      : "Tout est prêt";

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="nb-ghost flex flex-col gap-2 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-ink/70">{label}</span>
        <span className="font-mono text-xs font-semibold tabular-nums text-ink/55">
          {pct} %
        </span>
      </div>

      {/* Progress track */}
      <div className="h-[6px] w-full border-2 border-ink bg-paper">
        <div
          className="h-full bg-ink transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
