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
    <nav
      aria-label="Progression du questionnaire"
      className="flex w-full items-stretch gap-1.5"
    >
      {CHAPTERS.map((chapter, i) => {
        const status = chapterStatus(QUESTIONS, draft, chapter.id, activeId);
        // Segment plein-largeur : fait = ✦ + ink, en cours = boîte accent bord ink,
        // à venir = numéroté discret. Plus de `.nb-step-badge` (cercle qui débordait).
        const segment =
          status === "current"
            ? "border-2 border-ink bg-accent text-ink"
            : status === "done"
              ? "border-2 border-ink bg-paper text-ink"
              : "border-2 border-ink/20 bg-transparent text-ink/35";

        return (
          <div
            key={chapter.id}
            aria-current={status === "current" ? "step" : undefined}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1 px-2 py-1.5 text-center text-[11px] font-black uppercase tracking-wide ${segment}`}
          >
            <span aria-hidden="true" className="text-[10px]">
              {status === "done" ? "✦" : i + 1}
            </span>
            <span className="truncate">{chapter.title}</span>
          </div>
        );
      })}
    </nav>
  );
}
