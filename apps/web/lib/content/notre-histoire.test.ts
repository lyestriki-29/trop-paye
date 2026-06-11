import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { siteFlags } from "@/lib/config";
import { casZero, notreHistoireCopy, NICOLAS_ROLE, TODO_COPY_MARKER } from "./notre-histoire";

/** Tous les fichiers source du périmètre récit (garde-fou Nicolas). */
function storySourceFiles(): string[] {
  const roots = [
    "lib/content/notre-histoire.ts",
    "components/story",
    "app/notre-histoire",
  ].map((p) => resolve(__dirname, "..", "..", p));
  const out: string[] = [];
  const walk = (p: string) => {
    if (!existsSync(p)) return;
    if (statSync(p).isFile()) {
      out.push(p);
      return;
    }
    for (const entry of readdirSync(p)) walk(join(p, entry));
  };
  roots.forEach(walk);
  return out;
}

describe("notre-histoire — garde-fous (spec)", () => {
  it("Nicolas n'est JAMAIS qualifié de juriste/expert juridique dans le périmètre récit", () => {
    const forbidden = /juriste|expert\s+juridique|expertise\s+juridique/i;
    for (const file of storySourceFiles()) {
      const text = readFileSync(file, "utf8");
      expect(forbidden.test(text), `terme interdit dans ${file}`).toBe(false);
    }
    expect(NICOLAS_ROLE).toBe("Expert de la location");
  });

  it("legalReviewDone est false par défaut (aucune mention avocat sans validation)", () => {
    expect(siteFlags.legalReviewDone).toBe(false);
  });

  it("chiffres du cas zéro = cas réel acté (120 €/mois de complément, classe F)", () => {
    expect(casZero.supplementCents).toBe(12000);
    expect(casZero.rentHcCents).toBe(90000);
    expect(casZero.totalCents).toBe(casZero.rentHcCents + casZero.supplementCents);
    expect(casZero.dpeClass).toBe("F");
  });

  it("l'état vide de la preuve sociale est la phrase imposée par la spec (pas un TODO)", () => {
    expect(notreHistoireCopy.preuve.emptyState).toBe("Premier dossier en cours : le nôtre.");
    expect(notreHistoireCopy.preuve.emptyState).not.toContain(TODO_COPY_MARKER);
  });

  it("scanner de build et placeholders à l'exécution restent d'accord", () => {
    // Marqueurs présents dans l'objet à l'exécution (bien formés)…
    const runtimeMarkers: string[] = [];
    const walk = (v: unknown): void => {
      if (typeof v === "string") {
        if (v.includes(TODO_COPY_MARKER)) runtimeMarkers.push(v);
        return;
      }
      if (Array.isArray(v)) {
        v.forEach(walk);
        return;
      }
      if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk(notreHistoireCopy);
    walk(casZero);
    for (const m of runtimeMarkers) {
      expect(m).toMatch(/^TODO_COPY — notre-histoire\./);
    }
    // …et le scanner source (même règle que scripts/check-copy.mjs) en voit
    // autant : si l'un dérive de l'autre, le garde-fou de build est troué.
    const moduleText = readFileSync(resolve(__dirname, "notre-histoire.ts"), "utf8");
    const sourceCalls = moduleText.match(/\btodo\(\s*"/g) ?? [];
    expect(sourceCalls.length).toBe(runtimeMarkers.length);
  });
});
