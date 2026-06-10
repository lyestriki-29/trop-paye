import { describe, it, expect } from "vitest";
import { buildRentHistory } from "./rent-history";

const base = { leaseSignedAt: "2021-03-15", asOf: "2024-09-10", revisions: [] as { date: string; rentCents: number }[] };

describe("buildRentHistory — injection du loyer courant", () => {
  it("loyer courant == initial, sans révision → un seul événement INITIAL", () => {
    const h = buildRentHistory({ ...base, initialRentCents: 100000, currentRentCents: 100000 });
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ type: "INITIAL", rentCents: 100000 });
  });

  it("hausse sans révision → INITIAL + REVISION synthétique à l'anniversaire récent", () => {
    const h = buildRentHistory({ ...base, initialRentCents: 100000, currentRentCents: 110000 });
    expect(h).toHaveLength(2);
    expect(h[1]).toMatchObject({ type: "REVISION", rentCents: 110000, date: "2024-03-15" });
  });

  it("baisse sans révision → injecte aussi le loyer courant (paidAt doit refléter la réalité)", () => {
    const h = buildRentHistory({ ...base, initialRentCents: 100000, currentRentCents: 95000 });
    expect(h).toHaveLength(2);
    expect(h[1]).toMatchObject({ type: "REVISION", rentCents: 95000 });
  });

  it("révisions fournies, courant == dernière révision → pas de doublon", () => {
    const h = buildRentHistory({
      ...base,
      initialRentCents: 100000,
      currentRentCents: 104000,
      revisions: [{ date: "2023-03-15", rentCents: 104000 }],
    });
    expect(h).toHaveLength(2);
    expect(h.filter((e) => e.type === "REVISION")).toHaveLength(1);
  });

  it("révisions fournies, courant distinct à une autre date → ajoute la synthétique", () => {
    const h = buildRentHistory({
      ...base,
      initialRentCents: 100000,
      currentRentCents: 108000,
      revisions: [{ date: "2023-03-15", rentCents: 104000 }],
    });
    expect(h).toHaveLength(3);
    expect(h[2]).toMatchObject({ type: "REVISION", rentCents: 108000, date: "2024-03-15" });
  });

  it("collision de date : réécrit le montant au lieu d'empiler deux événements", () => {
    const h = buildRentHistory({
      ...base,
      initialRentCents: 100000,
      currentRentCents: 109000,
      revisions: [{ date: "2024-03-15", rentCents: 104000 }],
    });
    // la révision saisie tombe pile à l'anniversaire récent → un seul événement à cette date
    const sameDay = h.filter((e) => e.date === "2024-03-15");
    expect(sameDay).toHaveLength(1);
    expect(sameDay[0]!.rentCents).toBe(109000);
  });

  it("sans date de bail → INITIAL en date de repli, synthétique ancrée sur asOf", () => {
    const h = buildRentHistory({
      leaseSignedAt: undefined,
      asOf: "2024-09-10",
      revisions: [],
      initialRentCents: 100000,
      currentRentCents: 110000,
    });
    expect(h[0]).toMatchObject({ type: "INITIAL", date: "2020-01-01" });
    expect(h[1]).toMatchObject({ type: "REVISION", date: "2024-09-10" });
  });
});
