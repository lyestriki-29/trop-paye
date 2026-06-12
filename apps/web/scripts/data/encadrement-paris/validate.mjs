// Validation hors ligne du GeoJSON des quartiers + preuve du point-in-polygon.
// Ray-casting maison (le moteur restera pur ; ceci n'est qu'un contrôle data).
import { readFileSync } from "node:fs";

const fc = JSON.parse(readFileSync(new URL("./quartiers-geo.geojson", import.meta.url), "utf8"));

// Anneaux d'une géométrie Polygon ou MultiPolygon → liste d'anneaux [ [lng,lat], ... ].
function rings(geom) {
  if (geom.type === "Polygon") return geom.coordinates;
  if (geom.type === "MultiPolygon") return geom.coordinates.flat();
  throw new Error("type géométrie inattendu: " + geom.type);
}

function pointInRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const hit = yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}
const pointInGeom = (pt, geom) => rings(geom).some((r) => pointInRing(pt, r));

// Centroïde grossier du 1er anneau (suffisant pour un point intérieur de test).
function roughCentroid(geom) {
  const r = rings(geom)[0];
  let x = 0,
    y = 0;
  for (const [lng, lat] of r) {
    x += lng;
    y += lat;
  }
  return [x / r.length, y / r.length];
}

let badGeom = 0,
  selfMiss = 0,
  ambiguous = 0;
const types = {};
for (const f of fc.features) {
  types[f.geometry?.type] = (types[f.geometry?.type] ?? 0) + 1;
  if (!f.geometry?.type || !f.properties?.code_grand_quartier || f.properties?.id_zone == null) {
    badGeom++;
    continue;
  }
  const c = roughCentroid(f.geometry);
  if (!pointInGeom(c, f.geometry)) selfMiss++;
  const matches = fc.features.filter((g) => pointInGeom(c, g.geometry));
  if (matches.length !== 1) ambiguous++;
}

console.log("features:", fc.features.length);
console.log("types géométrie:", JSON.stringify(types));
console.log("propriétés manquantes:", badGeom);
console.log("centroïde hors de son propre polygone:", selfMiss);
console.log("centroïdes rattachés à ≠ 1 quartier (chevauchement/trou):", ambiguous);
console.log(badGeom + selfMiss === 0 ? "OK — données géo exploitables" : "PROBLÈME data géo");
