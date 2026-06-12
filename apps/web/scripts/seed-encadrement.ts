/**
 * Seed du référentiel d'encadrement des loyers (Paris, ODbL). Idempotent (upsert).
 * À lancer avec Supabase local démarré : `pnpm --filter @troppaye/web db:seed-encadrement`.
 * Source : apps/web/scripts/data/encadrement-paris/ (récupéré via fetch-geo.mjs + curl).
 * Valeurs réglementaires non vérifiées (verified=false) — NE PAS publier sans [AVOCAT].
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(path.resolve(process.cwd(), "../.."));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.");
}
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const DATA_DIR = path.resolve(process.cwd(), "scripts/data/encadrement-paris");

interface RentRow {
  annee: string;
  id_zone: number;
  nom_quartier: string;
  piece: number;
  epoque: string;
  meuble_txt: string;
  ref: number;
  max: number;
  min: number;
  code_grand_quartier: number;
}

interface ZoneFeature {
  properties: { code_grand_quartier: number; nom_quartier: string; id_zone: number };
  geometry: { type: string; coordinates: unknown };
}

/** Époque du dataset → enum normalisé (calque `ConstructionPeriod` du moteur). */
const PERIOD: Record<string, string> = {
  "Avant 1946": "BEFORE_1946",
  "1946-1970": "1946_1970",
  "1971-1990": "1971_1990",
  "Apres 1990": "AFTER_1990",
};

const euroToCents = (v: number): number => Math.round(v * 100);
const read = <T>(file: string): T => JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf8")) as T;

async function seedZones(): Promise<void> {
  const fc = read<{ features: ZoneFeature[] }>("quartiers-geo.geojson");
  const rows = fc.features.map((f) => ({
    code_grand_quartier: f.properties.code_grand_quartier,
    nom_quartier: f.properties.nom_quartier,
    id_secteur: f.properties.id_zone,
    geometry: f.geometry,
  }));
  const { error } = await admin
    .from("encadrement_zone")
    .upsert(rows, { onConflict: "code_grand_quartier" });
  if (error) throw error;
  console.log(`encadrement_zone : ${rows.length} quartiers`);
}

async function seedReference(): Promise<void> {
  const data = read<RentRow[]>("loyers-reference-paris.json");
  const rows = data.map((r) => {
    const period = PERIOD[r.epoque];
    if (!period) throw new Error(`Époque inconnue dans le dataset : ${r.epoque}`);
    return {
      millesime: Number(r.annee),
      code_grand_quartier: r.code_grand_quartier,
      id_secteur: r.id_zone,
      rooms: r.piece,
      construction_period: period,
      furnished: r.meuble_txt === "meublé",
      ref_cents: euroToCents(r.ref),
      max_cents: euroToCents(r.max),
      min_cents: euroToCents(r.min),
      effective_from: `${Number(r.annee)}-07-01`,
    };
  });
  const BATCH = 1000;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await admin.from("encadrement_reference").upsert(chunk, {
      onConflict: "millesime,code_grand_quartier,rooms,construction_period,furnished",
    });
    if (error) throw error;
    process.stdout.write(`\rencadrement_reference : ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  process.stdout.write("\n");
}

async function main(): Promise<void> {
  await seedZones();
  await seedReference();
  console.log("Seed encadrement terminé.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
