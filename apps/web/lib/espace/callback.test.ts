import { describe, it, expect } from "vitest";
import { callbackSchema, slotLabel } from "@/lib/espace/callback";

describe("callbackSchema", () => {
  const base = { dossierId: "d1", subject: "Question loyer", preferredSlot: "MORNING", phone: "0612345678" };

  it("accepte une entrée valide", () => {
    const r = callbackSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("refuse un sujet vide", () => {
    expect(callbackSchema.safeParse({ ...base, subject: "  " }).success).toBe(false);
  });

  it("refuse un créneau inconnu", () => {
    expect(callbackSchema.safeParse({ ...base, preferredSlot: "NIGHT" }).success).toBe(false);
  });

  it("refuse un téléphone vide", () => {
    expect(callbackSchema.safeParse({ ...base, phone: "  " }).success).toBe(false);
  });
});

describe("slotLabel", () => {
  it("traduit les créneaux connus", () => {
    expect(slotLabel("ASAP")).toBe("Dès que possible");
    expect(slotLabel("EVENING")).toBe("Soir");
  });
  it("retombe sur la valeur brute si inconnu", () => {
    expect(slotLabel("XXX")).toBe("XXX");
  });
});
