import { describe, it, expect } from "vitest";
import { progress } from "./progress";
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
  Q({ id: "opt", optional: true, isAnswered: () => false }),
];
const base: DiagnosticDraft = { revisions: [] };

describe("progress", () => {
  it("0 quand rien n'est répondu (optionnelles exclues)", () => {
    expect(progress(G, base)).toBe(0);
  });
  it("compte la fraction des applicables non-optionnelles", () => {
    expect(progress(G, { ...base, surfaceM2: 38 })).toBe(0.5); // a répondu / (a,b)
  });
  it("1 quand toutes les applicables non-optionnelles sont répondues", () => {
    // isShared:false → c non applicable ; opt exclue ; a+b répondues
    expect(progress(G, { ...base, surfaceM2: 38, isShared: false })).toBe(1);
  });
  it("renvoie 0 si aucune question applicable non-optionnelle", () => {
    expect(progress([], base)).toBe(0);
  });
});
