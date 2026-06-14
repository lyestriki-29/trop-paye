import { describe, it, expect } from "vitest";
import { applicableQuestions, firstUnansweredId, nextQuestionId, revealOrder } from "./reveal-state";
import type { Question } from "./question-graph";
import type { DiagnosticDraft } from "./use-diagnostic-form";

const Q = (over: Partial<Question> & Pick<Question, "id">): Question => ({
  chapter: "housing", render: () => null, isAnswered: () => false,
  summary: () => "", ...over,
});
const G: Question[] = [
  Q({ id: "a", isAnswered: (d) => !!d.surfaceM2 }),
  Q({ id: "b", isAnswered: (d) => d.isShared !== undefined }),
  Q({ id: "c", isAnswered: (d) => !!d.tenantCount, revealWhen: (d) => d.isShared === true }),
];
const base: DiagnosticDraft = { revisions: [] };

describe("reveal-state", () => {
  it("filtre par revealWhen", () => {
    expect(applicableQuestions(G, base).map((q) => q.id)).toEqual(["a", "b"]);
    expect(applicableQuestions(G, { ...base, isShared: true }).map((q) => q.id)).toEqual(["a", "b", "c"]);
  });
  it("première question non répondue", () => {
    expect(firstUnansweredId(G, base)).toBe("a");
    expect(firstUnansweredId(G, { ...base, surfaceM2: 38 })).toBe("b");
  });
  it("question suivante applicable", () => {
    expect(nextQuestionId(G, { ...base, isShared: true }, "b")).toBe("c");
    expect(nextQuestionId(G, base, "b")).toBeNull();
  });
  it("revealOrder : confirmées jusqu'à l'active incluse", () => {
    const d = { ...base, surfaceM2: 38 };
    expect(revealOrder(G, d, "b").map((q) => q.id)).toEqual(["a", "b"]);
  });
});
