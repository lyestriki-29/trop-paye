import { describe, it, expect } from "vitest";
import { buildActivityFeed } from "./activity";

describe("buildActivityFeed", () => {
  it("fusionne actions exécutées + messages, trié du plus récent au plus ancien", () => {
    const feed = buildActivityFeed({
      actions: [
        { type: "LETTER_J0", scheduled_at: "2026-01-01T00:00:00Z", executed_at: "2026-01-02T10:00:00Z" },
      ],
      messages: [{ id: "m1", sender: "operator", body: "Bonjour", created_at: "2026-01-03T09:00:00Z" }],
    });
    expect(feed).toHaveLength(2);
    const first = feed[0];
    const second = feed[1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first!.at >= second!.at).toBe(true);
    expect(first!.kind).toBe("message");
  });

  it("ignore les actions non exécutées (planifiées seulement)", () => {
    const feed = buildActivityFeed({
      actions: [{ type: "REMINDER_J21", scheduled_at: "2026-02-01T00:00:00Z", executed_at: null }],
      messages: [],
    });
    expect(feed).toHaveLength(0);
  });

  it("messages du client exclus du flux d'activité (c'est lui qui les a écrits)", () => {
    const feed = buildActivityFeed({
      actions: [],
      messages: [{ id: "m1", sender: "client", body: "test", created_at: "2026-01-01T00:00:00Z" }],
    });
    expect(feed).toHaveLength(0);
  });
});
