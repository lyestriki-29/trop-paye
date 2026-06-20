import { describe, it, expect } from "vitest";
import {
  applicableQuestions,
  firstUnansweredId,
  initialActiveId,
  nextQuestionId,
  resolveActiveId,
  revealOrder,
} from "./reveal-state";
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

// Graphe avec une pilule à avance auto (BUG 1) + une conditionnelle (BUG 2).
const A: Question[] = [
  Q({ id: "a", autoAdvance: true, isAnswered: (d) => d.isShared !== undefined }),
  Q({ id: "b", isAnswered: (d) => !!d.surfaceM2 }),
  Q({
    id: "cond",
    autoAdvance: true,
    isAnswered: (d) => !!d.tenantCount,
    revealWhen: (d) => d.isShared === true,
  }),
];

describe("resolveActiveId", () => {
  // BUG 1 — édition d'une pilule déjà répondue : on RESTE dessus.
  it("édition d'une pilule répondue → reste (pas d'avance)", () => {
    const d = { ...base, isShared: false }; // "a" est répondue
    expect(resolveActiveId(A, d, "a", true)).toBe("a");
  });

  // BUG 1 (C) — après édition, un nouveau passage SANS flag reprend l'avance.
  it("pilule répondue hors édition → avance vers la suivante", () => {
    const d = { ...base, isShared: false };
    expect(resolveActiveId(A, d, "a", false)).toBe("b");
  });

  // BUG 1 (A) — frontière : une pilule répondue passe à la question suivante ;
  // une question non-autoAdvance reste (bouton « Continuer »).
  it("frontière : pilule répondue avance, champ libre reste", () => {
    const d = { ...base, isShared: false, surfaceM2: 38 };
    expect(resolveActiveId(A, d, "a", false)).toBe("b"); // "a" autoAdvance → avance
    expect(resolveActiveId(A, d, "b", false)).toBe("b"); // "b" libre → reste
  });

  // BUG 2 — activeId pointe une conditionnelle devenue non applicable
  // (isShared repassé à false) → on retombe sur la 1re non répondue, PAS slice(0,1)/top.
  it("activeId non applicable → première non répondue (jamais le haut)", () => {
    const d = { ...base, isShared: false }; // "cond" sort des applicables, "a" répondue
    expect(resolveActiveId(A, d, "cond", false)).toBe("b");
    // Garantit que revealOrder sur l'id résolu n'écrase pas le tunnel à 1 bloc.
    const resolved = resolveActiveId(A, d, "cond", false)!;
    expect(revealOrder(A, d, resolved).map((q) => q.id)).toEqual(["a", "b"]);
  });

  // BUG 2 bis — id non applicable alors que tout est répondu → recap.
  it("activeId non applicable et tout répondu → recap", () => {
    const d = { ...base, isShared: false, surfaceM2: 38 };
    expect(resolveActiveId(A, d, "cond", false)).toBe("recap");
  });

  // L'édition ne court-circuite PAS la garde d'applicabilité : un id non
  // applicable est corrigé même avec le flag (sinon tunnel cassé).
  it("id non applicable + édition → corrigé quand même", () => {
    const d = { ...base, isShared: false };
    expect(resolveActiveId(A, d, "cond", true)).toBe("b");
  });

  it("activeId null ou recap → inchangé", () => {
    expect(resolveActiveId(A, base, null, false)).toBeNull();
    expect(resolveActiveId(A, base, "recap", false)).toBe("recap");
  });
});

describe("initialActiveId (restauration localStorage)", () => {
  // Le bug : un "recap" laissé en localStorage par une session précédente
  // ramenait un nouveau visiteur (dossier vide, NON soumettable) au récap au
  // lieu de la 1re question. recap n'est restauré que si `submittable`.
  it("recap sauvé mais dossier non soumettable → 1re non répondue", () => {
    expect(initialActiveId(A, base, "recap", false)).toBe("a");
  });
  it("recap sauvé ET dossier soumettable → recap", () => {
    expect(initialActiveId(A, base, "recap", true)).toBe("recap");
  });
  it("id de question applicable sauvé → restauré tel quel", () => {
    expect(initialActiveId(A, base, "b", false)).toBe("b");
  });
  it("id non applicable ou inconnu → 1re non répondue", () => {
    expect(initialActiveId(A, base, "cond", false)).toBe("a"); // cond non applicable
    expect(initialActiveId(A, base, "zzz", false)).toBe("a"); // inconnu
  });
  it("rien en localStorage → 1re non répondue", () => {
    expect(initialActiveId(A, base, null, false)).toBe("a");
  });
  it("tout répondu et rien sauvé → recap", () => {
    const d = { ...base, isShared: false, surfaceM2: 38 };
    expect(initialActiveId(A, d, null, true)).toBe("recap");
  });
});
