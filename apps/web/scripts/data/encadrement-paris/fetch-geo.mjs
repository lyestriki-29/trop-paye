// ETL — récupère un polygone par quartier (80) du dataset Paris des loyers de
// référence, et assemble un GeoJSON propre pour le point-in-polygon (adresse →
// quartier → zone). Source : opendata.paris.fr, dataset logement-encadrement-
// des-loyers (ODbL). Le geo_shape est dupliqué sur 17 920 lignes ; on n'en
// garde qu'un par code_grand_quartier. Idempotent, relançable.
import { readFileSync, writeFileSync } from "node:fs";

const DATASET = "logement-encadrement-des-loyers";
const BASE = `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/${DATASET}/records`;
const SRC = new URL("./loyers-reference-paris.json", import.meta.url);
const OUT = new URL("./quartiers-geo.geojson", import.meta.url);

// Quartiers distincts (code → métadonnées) depuis la table tarifaire déjà téléchargée.
const rows = JSON.parse(readFileSync(SRC, "utf8"));
const byCode = new Map();
for (const r of rows) {
  if (!byCode.has(r.code_grand_quartier)) {
    byCode.set(r.code_grand_quartier, {
      code_grand_quartier: r.code_grand_quartier,
      id_quartier: r.id_quartier,
      nom_quartier: r.nom_quartier,
      id_zone: r.id_zone,
    });
  }
}
const quartiers = [...byCode.values()];
console.log(`${quartiers.length} quartiers à géolocaliser`);

async function fetchGeo(q) {
  const url = `${BASE}?where=code_grand_quartier=${q.code_grand_quartier}&limit=1&select=geo_shape`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${q.code_grand_quartier}`);
  const j = await res.json();
  const shape = j.results?.[0]?.geo_shape;
  const geometry = shape?.geometry ?? shape; // ODS renvoie un Feature {type,geometry,...}
  if (!geometry?.type) throw new Error(`geo_shape absent pour ${q.code_grand_quartier}`);
  return { type: "Feature", properties: q, geometry };
}

// Concurrence limitée (8) — poli avec l'API publique.
const features = [];
const POOL = 8;
for (let i = 0; i < quartiers.length; i += POOL) {
  const batch = quartiers.slice(i, i + POOL);
  const got = await Promise.all(batch.map(fetchGeo));
  features.push(...got);
  process.stdout.write(`\r${features.length}/${quartiers.length}`);
}
process.stdout.write("\n");

const fc = { type: "FeatureCollection", features };
writeFileSync(OUT, JSON.stringify(fc));
const zones = new Set(features.map((f) => f.properties.id_zone));
console.log(`écrit ${features.length} polygones, ${zones.size} zones distinctes → quartiers-geo.geojson`);
