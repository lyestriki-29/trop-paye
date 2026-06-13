import { describe, it, expect } from "vitest";
import { netAfterFee, maskIban, payoutStage } from "./payout";

describe("netAfterFee", () => {
  it("retire 25 % (2500 bps) en centimes, arrondi à l'entier", () => {
    expect(netAfterFee(100_000, 2500)).toBe(75_000);
    expect(netAfterFee(99_999, 2500)).toBe(74_999); // 99999 - round(24999.75)=25000 -> 74999
  });
});

describe("maskIban", () => {
  it("masque le milieu, garde indicatif pays + 4 derniers", () => {
    expect(maskIban("FR7630006000011234567890189")).toBe("FR76 •••• 0189");
  });
});

describe("payoutStage", () => {
  it("OUT_TENANT présent → versé", () => {
    expect(payoutStage({ status: "WON", movements: [{ direction: "IN" }, { direction: "OUT_TENANT" }] })).toBe("paid");
  });
  it("IN seul → récupéré", () => {
    expect(payoutStage({ status: "WON", movements: [{ direction: "IN" }] })).toBe("recovered");
  });
  it("aucun mouvement → en attente", () => {
    expect(payoutStage({ status: "RECOVERY", movements: [] })).toBe("pending");
  });
});
