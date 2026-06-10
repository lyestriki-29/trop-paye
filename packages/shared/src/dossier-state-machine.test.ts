import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  nextStatuses,
} from "./dossier-state-machine";

describe("machine à états du dossier", () => {
  it("autorise les transitions valides", () => {
    expect(canTransition("IN_REVIEW", "RECOVERY")).toBe(true);
    expect(canTransition("RECOVERY", "WON")).toBe(true);
    expect(canTransition("MANDATE_PENDING", "IN_REVIEW")).toBe(true);
  });

  it("interdit les transitions invalides", () => {
    expect(canTransition("DRAFT", "WON")).toBe(false);
    expect(canTransition("CLOSED", "RECOVERY")).toBe(false);
    expect(canTransition("DIAGNOSED", "RECOVERY")).toBe(false);
  });

  it("assertTransition lève sur une transition interdite", () => {
    expect(() => assertTransition("DRAFT", "WON")).toThrow();
    expect(() => assertTransition("IN_REVIEW", "RECOVERY")).not.toThrow();
  });

  it("expose les états suivants autorisés", () => {
    expect(nextStatuses("IN_REVIEW")).toEqual(["RECOVERY", "CLOSED"]);
    expect(nextStatuses("CLOSED")).toEqual([]);
  });
});
