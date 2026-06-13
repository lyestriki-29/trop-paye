import fs from "node:fs";
import path from "node:path";

export interface E2EFixtures {
  dossierId: string;
  mandatePendingDossierId: string;
}

/** Ids écrits par global-setup (compte démo). */
export function fixtures(): E2EFixtures {
  const raw = fs.readFileSync(path.resolve(__dirname, ".auth/fixtures.json"), "utf8");
  return JSON.parse(raw) as E2EFixtures;
}

export const SAMPLE_PDF = path.resolve(__dirname, "fixtures/sample.pdf");
export const SAMPLE_PDF_2 = path.resolve(__dirname, "fixtures/sample2.pdf");
