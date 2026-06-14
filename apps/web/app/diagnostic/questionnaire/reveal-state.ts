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

/**
 * Décide l'`activeId` à afficher, à partir de l'état courant. Pur → testable
 * sans rendre le composant. Encapsule trois règles que pilotait l'effet
 * d'auto-avance :
 *  1. `activeId` pointe une question NON applicable (ex. `tenantCount` après
 *     bascule `isShared=false`, ou restauré depuis localStorage) → on retombe
 *     sur la première non répondue (ou "recap"). Évite que `revealOrder` ne
 *     renvoie `slice(0,1)` et fasse remonter le tunnel en haut.
 *  2. L'utilisateur vient de cliquer « modifier » (`isEditing`) sur une
 *     question à avance auto déjà répondue → on RESTE dessus (pas de rebond).
 *  3. Sinon, question à avance auto déjà répondue → on avance (frontière).
 *
 * Renvoie l'`activeId` inchangé quand rien ne doit bouger ; l'appelant ne
 * `setState` que sur changement effectif → pas de boucle.
 */
export function resolveActiveId(
  graph: Question[],
  d: DiagnosticDraft,
  activeId: string | null,
  isEditing: boolean,
): string | null {
  if (activeId === null || activeId === "recap") return activeId;
  const app = applicableQuestions(graph, d);
  // (1) id non applicable (conditionnelle retirée, ou restore obsolète).
  if (!app.some((q) => q.id === activeId)) {
    return firstUnansweredId(graph, d) ?? "recap";
  }
  // (2) édition en cours : on ne fait pas rebondir la question rouverte.
  if (isEditing) return activeId;
  // (3) frontière : pilule répondue → question suivante (ou recap).
  const q = app.find((x) => x.id === activeId);
  if (q && q.autoAdvance && q.isAnswered(d)) {
    return nextQuestionId(graph, d, activeId) ?? "recap";
  }
  return activeId;
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
