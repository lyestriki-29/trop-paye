import { describe, it, expect } from "vitest";
import { buildStudyChecklist } from "./study-checklist";

describe("buildStudyChecklist", () => {
  it("aucune pièce → bail et quittance manquants, non lançable", () => {
    const r = buildStudyChecklist([]);
    expect(r.launchable).toBe(false);
    expect(r.items.map((i) => i.state)).toEqual(["missing", "missing"]);
  });

  it("bail reçu + quittance reçue → lançable", () => {
    const r = buildStudyChecklist([
      { kind: "bail", status: "RECEIVED" },
      { kind: "quittance", status: "RECEIVED" },
    ]);
    expect(r.launchable).toBe(true);
  });

  it("statut VALIDATED reflété sur l'item, prioritaire sur RECEIVED", () => {
    const r = buildStudyChecklist([
      { kind: "bail", status: "VALIDATED" },
      { kind: "quittance", status: "RECEIVED" },
      { kind: "quittance", status: "VALIDATED" },
    ]);
    const bail = r.items.find((i) => i.kind === "bail")!;
    const quittance = r.items.find((i) => i.kind === "quittance")!;
    expect(bail.state).toBe("validated");
    expect(quittance.state).toBe("validated");
    expect(r.launchable).toBe(true);
  });

  it("pièce ILLEGIBLE ne compte pas comme présente", () => {
    const r = buildStudyChecklist([{ kind: "bail", status: "ILLEGIBLE" }]);
    expect(r.items.find((i) => i.kind === "bail")!.state).toBe("missing");
    expect(r.launchable).toBe(false);
  });
});
