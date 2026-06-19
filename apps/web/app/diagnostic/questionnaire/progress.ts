import type { DiagnosticDraft } from "./use-diagnostic-form";
import type { Question } from "./question-graph";
import { applicableQuestions } from "./reveal-state";

/** Fraction [0..1] de questions applicables (hors optionnelles non engagées) répondues.
 *  Alimente la jauge d'anticipation NON monétaire. */
export function progress(graph: Question[], d: DiagnosticDraft): number {
  const app = applicableQuestions(graph, d).filter((q) => !q.optional);
  if (app.length === 0) return 0;
  return app.filter((q) => q.isAnswered(d)).length / app.length;
}
