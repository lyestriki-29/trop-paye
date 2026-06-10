import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Rendu des 7 compositions P4 (+ déclinaison VerdictReveal 1:1) en MP4 —
 * critère de fin de phase : `pnpm video:render` produit tous les fichiers
 * depuis les fixtures DEMO. Bundle unique, rendus séquentiels (CPU-bound).
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const outDir = path.join(root, "out");
mkdirSync(outDir, { recursive: true });

const COMPOSITIONS = [
  "VerdictReveal",
  "VerdictReveal-Carre",
  "HookLoop",
  "StatPunch",
  "Explainer",
  "TeaserLancement",
  "Temoignage",
  "DemoScreen",
];

console.log("Bundle Remotion…");
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });

for (const id of COMPOSITIONS) {
  const started = Date.now();
  const composition = await selectComposition({ serveUrl, id });
  const outputLocation = path.join(outDir, `${id}.mp4`);
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    onProgress: ({ progress }) => {
      if (progress === 1) return;
      process.stdout.write(`\r${id} : ${Math.round(progress * 100)} %   `);
    },
  });
  const secs = Math.round((Date.now() - started) / 1000);
  console.log(`\r${id} : rendu en ${secs}s → out/${id}.mp4`);
}

console.log(`\n${COMPOSITIONS.length} rendus terminés dans packages/video/out/.`);
