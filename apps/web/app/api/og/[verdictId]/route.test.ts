import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { VerdictTeaser } from "@/lib/diagnostic/verdict-teaser";

/**
 * Rendu RÉEL de la route OG (satori + resvg, hors ligne) : la lecture teaser est
 * mockée (zéro DB), les TTF statiques sont lus depuis assets/fonts. Les PNG
 * produits sont déposés dans test-results/og/ (gitignoré) pour contrôle visuel.
 */
const mocks = vi.hoisted(() => ({
  getVerdictTeaser: vi.fn<(id: string) => Promise<VerdictTeaser | null>>(),
}));
vi.mock("@/lib/diagnostic/verdict-teaser", () => ({
  getVerdictTeaser: mocks.getVerdictTeaser,
}));

import { GET } from "./route";

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const OUT_DIR = path.join(process.cwd(), "test-results", "og");

function request(verdictId: string) {
  return [
    new Request(`http://localhost/api/og/${verdictId}`),
    { params: Promise.resolve({ verdictId }) },
  ] as const;
}

async function expectPng(res: Response, file: string): Promise<void> {
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("image/png");
  const bytes = new Uint8Array(await res.arrayBuffer());
  expect([...bytes.slice(0, 8)]).toEqual(PNG_MAGIC);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, file), bytes);
}

describe("GET /api/og/[verdictId]", () => {
  it("404 si le teaser est introuvable (UUID inconnu)", async () => {
    mocks.getVerdictTeaser.mockResolvedValueOnce(null);
    const res = await GET(...request("00000000-0000-0000-0000-000000000000"));
    expect(res.status).toBe(404);
  });

  it("verdict chiffré → PNG gabarit montant + type + ville (jamais l'adresse)", async () => {
    mocks.getVerdictTeaser.mockResolvedValueOnce({
      outcome: "IRREGULAR",
      amountCents: 143_700,
      kindLabel: "Gel des loyers (passoire F/G)",
      city: "Lyon",
    });
    const res = await GET(...request("11111111-1111-4111-8111-111111111111"));
    await expectPng(res, "verdict-chiffre.png");
  }, 30_000);

  it("verdict non chiffré → PNG gabarit générique sans montant", async () => {
    mocks.getVerdictTeaser.mockResolvedValueOnce({
      outcome: "COMPLIANT",
      amountCents: null,
      kindLabel: null,
      city: null,
    });
    const res = await GET(...request("22222222-2222-4222-8222-222222222222"));
    await expectPng(res, "verdict-generique.png");
  }, 30_000);
});
