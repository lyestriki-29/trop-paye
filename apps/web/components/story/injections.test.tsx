import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { siteFlags } from "@/lib/config";
import { notreHistoireCopy } from "@/lib/content/notre-histoire";
import { MethodeSection } from "./sections-histoire";
import { ReviewerReassurance, VerdictStoryLine } from "./injections";

describe("injections du récit (spec notre-histoire)", () => {
  it("legalReviewDone=false → la phrase avocat est ABSENTE du DOM", () => {
    expect(siteFlags.legalReviewDone).toBe(false);
    const html = renderToStaticMarkup(createElement(MethodeSection));
    expect(html).not.toContain(notreHistoireCopy.legalReviewLine);
  });

  it("ReviewerReassurance : reviewerName paramétrable (défaut Nicolas)", () => {
    expect(renderToStaticMarkup(createElement(ReviewerReassurance))).toContain("Nicolas");
    expect(
      renderToStaticMarkup(createElement(ReviewerReassurance, { reviewerName: "Camille" })),
    ).toContain("Camille");
  });

  it("VerdictStoryLine : une ligne qui pointe vers /notre-histoire", () => {
    const html = renderToStaticMarkup(createElement(VerdictStoryLine));
    expect(html).toContain("/notre-histoire");
  });
});
