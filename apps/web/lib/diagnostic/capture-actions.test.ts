import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Garde de propriété de session de la capture email (TC-CAP-007, P0 sécurité).
 *
 * Le module de capture est anonyme : la « preuve » qu'un visiteur agit sur SON
 * dossier est le cookie `tp_session` === `dossiers.session_token`. Ces tests
 * verrouillent ce comportement contre une régression future :
 *   - on ne peut pas poser de lead sur le dossier d'un tiers (cookie étranger) ;
 *   - aucun oracle d'existence : « verdict inexistant » et « cookie étranger »
 *     renvoient un message STRICTEMENT identique (impossible de deviner un UUID).
 *
 * Niveau unitaire (et non e2e UI) à dessein : sans le bon cookie, la page verdict
 * n'affiche jamais le module de capture (teaser anonymisé) — la garde testée vit
 * dans l'action serveur `submitLead`. Même patron que `deposit-actions.test.ts`.
 */

type QueryResult = { data: unknown; error?: unknown };
type QueryBuilder = {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
};

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn<() => boolean>(),
  getSessionToken: vi.fn<() => Promise<string | undefined>>(),
  getSupabaseAdmin: vi.fn<() => unknown>(),
  headers: vi.fn<() => Promise<Headers>>(),
  trackEvent: vi.fn<() => Promise<void>>(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("@/lib/diagnostic/session", () => ({ getSessionToken: mocks.getSessionToken }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));
vi.mock("@/lib/track", () => ({ trackEvent: mocks.trackEvent }));

import { submitLead } from "@/app/diagnostic/[verdictId]/capture-actions";

const VERDICT_ID = "11111111-1111-4111-8111-111111111111";
const VALID_PAYLOAD = {
  verdictId: VERDICT_ID,
  email: "locataire@example.com",
  phoneConsent: false,
};

const NOT_FOUND = "Ce résultat est introuvable, ou votre session a expiré.";

/** File de réponses Supabase consommées dans l'ordre par chaque `.single()`. */
function builderQueue(results: QueryResult[]): QueryBuilder {
  const builder = {} as QueryBuilder;
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.single = vi.fn(async () => results.shift() ?? { data: null });
  return builder;
}

describe("submitLead — garde de propriété de session (TC-CAP-007)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockReturnValue(true);
    mocks.headers.mockResolvedValue(new Headers({ "x-forwarded-for": "127.0.0.1" }));
  });

  it("refuse un email invalide avant même de lire la session", async () => {
    const res = await submitLead({ ...VALID_PAYLOAD, email: "pas-un-email" });
    expect(res).toEqual({ error: "Vérifiez votre adresse email, elle semble incorrecte." });
    expect(mocks.getSessionToken).not.toHaveBeenCalled();
  });

  it("refuse sans cookie de session", async () => {
    mocks.getSessionToken.mockResolvedValue(undefined);
    const res = await submitLead(VALID_PAYLOAD);
    expect(res).toEqual({ error: "Votre session a expiré. Relancez votre diagnostic." });
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it("refuse la capture sur le dossier d'un tiers (cookie étranger), sans rien insérer", async () => {
    const results: QueryResult[] = [
      { data: { dossier_id: "dossier-1" } }, // le verdict existe…
      { data: { session_token: "le-token-du-proprietaire" } }, // …mais appartient à un autre
    ];
    const from = vi.fn(() => builderQueue(results));
    mocks.getSessionToken.mockResolvedValue("cookie-d-un-intrus");
    mocks.getSupabaseAdmin.mockReturnValue({ from });

    const res = await submitLead(VALID_PAYLOAD);

    expect(res).toEqual({ error: NOT_FOUND });
    expect(from).toHaveBeenCalledWith("verdicts");
    expect(from).toHaveBeenCalledWith("dossiers");
    expect(from).not.toHaveBeenCalledWith("leads"); // jamais d'insertion pour un intrus
    expect(mocks.trackEvent).not.toHaveBeenCalled();
  });

  it("ne livre aucun oracle : verdict inexistant et cookie étranger sont indistinguables", async () => {
    mocks.getSessionToken.mockResolvedValue("un-token");

    // a) le verdict n'existe pas du tout.
    mocks.getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => builderQueue([{ data: null }])) });
    const resInexistant = await submitLead(VALID_PAYLOAD);

    // b) le verdict existe mais le cookie ne correspond pas.
    mocks.getSupabaseAdmin.mockReturnValue({
      from: vi.fn(() =>
        builderQueue([
          { data: { dossier_id: "dossier-1" } },
          { data: { session_token: "autre-token" } },
        ]),
      ),
    });
    const resEtranger = await submitLead(VALID_PAYLOAD);

    expect(resInexistant).toEqual({ error: NOT_FOUND });
    expect(resEtranger).toEqual(resInexistant); // même message → pas d'oracle d'existence
  });
});
