import type { DiagnosticDraft } from "./use-diagnostic-form";
import type { Question } from "./question-graph";

const applies = (q: Question, d: DiagnosticDraft) => !q.revealWhen || q.revealWhen(d);

export function applicableQuestions(graph: Question[], d: DiagnosticDraft): Question[] {
  return graph.filter((q) => applies(q, d));
}

export function firstUnansweredId(graph: Question[], d: DiagnosticDraft): string | null {
  return applicableQuestions(graph, d).find((q) => !q.isAnswered(d))?.id ?? null;
}

export function nextQuestionId(
  graph: Question[],
  d: DiagnosticDraft,
  currentId: string,
): string | null {
  const app = applicableQuestions(graph, d);
  const i = app.findIndex((q) => q.id === currentId);
  return i >= 0 && i + 1 < app.length ? app[i + 1]!.id : null;
}

/** Blocs à afficher : toutes les applicables jusqu'à `activeId` inclus
 *  (les précédentes = confirmées repliées, la dernière = active). */
export function revealOrder(
  graph: Question[],
  d: DiagnosticDraft,
  activeId: string | null,
): Question[] {
  const app = applicableQuestions(graph, d);
  if (activeId === null) return app;
  const i = app.findIndex((q) => q.id === activeId);
  return i >= 0 ? app.slice(0, i + 1) : app.slice(0, 1);
}

/** Chapitre : done si toutes ses questions applicables sont répondues. */
export function chapterStatus(
  graph: Question[],
  d: DiagnosticDraft,
  chapter: string,
  activeId: string | null,
): "done" | "current" | "todo" {
  const qs = applicableQuestions(graph, d).filter((q) => q.chapter === chapter);
  if (qs.length === 0) return "todo";
  if (qs.every((q) => q.isAnswered(d))) return "done";
  const activeChapter = graph.find((q) => q.id === activeId)?.chapter;
  return activeChapter === chapter ? "current" : "todo";
}
