"use client";

import type { ReactNode } from "react";
import { CHAPTERS, QUESTIONS } from "../question-graph";
import type { DiagnosticDraft } from "../use-diagnostic-form";
import { chapterStatus } from "../reveal-state";

export function ChapterRail({
  activeId,
  draft,
}: {
  activeId: string | null;
  draft: DiagnosticDraft;
}): ReactNode {
  return (
    <nav aria-label="Progression du questionnaire" className="flex items-center gap-0">
      {CHAPTERS.map((chapter, i) => {
        const status = chapterStatus(QUESTIONS, draft, chapter.id, activeId);
        const isLast = i === CHAPTERS.length - 1;

        return (
          <div key={chapter.id} className="flex min-w-0 items-center">
            {/* Chapter label */}
            <div
              className={
                status === "current"
                  ? "nb-step-badge px-2.5 py-1 text-xs font-black uppercase tracking-wide"
                  : status === "done"
                    ? "px-2.5 py-1 text-xs font-semibold text-ink"
                    : "px-2.5 py-1 text-xs font-semibold text-ink/35"
              }
              aria-current={status === "current" ? "step" : undefined}
            >
              {status === "done" && (
                <span className="mr-1 text-[10px]" aria-hidden="true">✦</span>
              )}
              {chapter.title}
            </div>

            {/* Connector bar — not after the last chapter */}
            {!isLast && (
              <div
                aria-hidden="true"
                className={`h-[2px] w-6 shrink-0 ${status === "done" ? "bg-ink" : "bg-ink/20"}`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
