import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryResult = { data: unknown; error?: unknown };
type QueryBuilder = {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
};

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn<() => boolean>(),
  getReferentials: vi.fn<() => Promise<unknown>>(),
  getSessionToken: vi.fn<() => Promise<string | undefined>>(),
  getSupabaseAdmin: vi.fn<() => unknown>(),
  headers: vi.fn<() => Promise<Headers>>(),
  trackEvent: vi.fn<() => Promise<void>>(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("@/lib/diagnostic/session", () => ({ getSessionToken: mocks.getSessionToken }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("@/lib/referentials", () => ({ getReferentials: mocks.getReferentials }));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));
vi.mock("@/lib/track", () => ({ trackEvent: mocks.trackEvent }));

import { submitDeposit } from "@/app/diagnostic/[verdictId]/deposit-actions";

const VERDICT_ID = "11111111-1111-4111-8111-111111111111";
const VALID_PAYLOAD = {
  verdictId: VERDICT_ID,
  leaveDate: "2025-03-10",
  edlConforme: true,
  depositCents: 90000,
  refunded: "NO",
};

function builderQueue(results: QueryResult[]): QueryBuilder {
  const builder = {} as QueryBuilder;
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.single = vi.fn(async () => results.shift() ?? { data: null });
  return builder;
}

describe("submitDeposit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockReturnValue(true);
    mocks.headers.mockResolvedValue(new Headers({ "x-forwarded-for": "127.0.0.1" }));
  });

  it("refuse un payload invalide avant toute lecture session", async () => {
    const res = await submitDeposit({ ...VALID_PAYLOAD, verdictId: "not-a-uuid" });
    expect(res).toEqual({ error: "TODO_COPY — saisie invalide" });
    expect(mocks.getSessionToken).not.toHaveBeenCalled();
  });

  it("refuse sans cookie de session valide", async () => {
    mocks.getSessionToken.mockResolvedValue(undefined);
    const res = await submitDeposit(VALID_PAYLOAD);
    expect(res).toEqual({ error: "TODO_COPY — session expirée" });
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it("refuse une session étrangère au dossier sans oracle d'existence", async () => {
    const results: QueryResult[] = [
      { data: { dossier_id: "dossier-1" } },
      {
        data: {
          session_token: "other-token",
          engine_snapshot: { dpeHistory: [], rentHistory: [] },
        },
      },
    ];
    const from = vi.fn(() => builderQueue(results));
    mocks.getSessionToken.mockResolvedValue("cookie-token");
    mocks.getSupabaseAdmin.mockReturnValue({ from });

    const res = await submitDeposit(VALID_PAYLOAD);
    expect(res).toEqual({ error: "TODO_COPY — dossier introuvable ou session expirée" });
    expect(from).toHaveBeenCalledWith("verdicts");
    expect(from).toHaveBeenCalledWith("dossiers");
  });
});
