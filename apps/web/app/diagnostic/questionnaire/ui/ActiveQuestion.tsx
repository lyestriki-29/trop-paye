"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CHAPTERS } from "../question-graph";
import type { Question } from "../question-graph";
import type { DiagnosticDraft, SetField } from "../use-diagnostic-form";

export function ActiveQuestion({
  question,
  draft,
  setField,
  advance,
}: {
  question: Question;
  draft: DiagnosticDraft;
  setField: SetField;
  advance: () => void;
}): ReactNode {
  const reduced = useReducedMotion();
  const chapterTitle = CHAPTERS.find((c) => c.id === question.chapter)?.title ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, x: reduced ? 0 : 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.18, ease: "easeOut" }}
      className="nb-card rounded-none border-3 border-ink"
      style={{ backgroundColor: "#FFF7E0", boxShadow: "4px 4px 0 rgb(var(--color-nb-ink))" }}
    >
      {chapterTitle && (
        <p className="border-b-2 border-ink px-4 py-2 text-[10px] font-black uppercase tracking-widest text-ink/60">
          {chapterTitle}
        </p>
      )}

      <div className="px-4 py-4">
        {question.render({ draft, setField, goNext: advance })}
      </div>

      {!question.autoAdvance && (
        <div className="border-t-2 border-ink px-4 py-3">
          <button
            type="button"
            onClick={advance}
            className="nb-pill w-full bg-ink px-4 py-2.5 text-sm font-black text-paper"
          >
            Continuer
          </button>
        </div>
      )}
    </motion.div>
  );
}
