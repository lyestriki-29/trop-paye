/**
 * Vérif d'intégration encadrement (DB locale) : prouve le bout-en-bout
 * géo-rattachement → barème, contre les données SEEDÉES (polygones + référence).
 * `pnpm --filter @troppaye/web exec tsx scripts/verify-encadrement.ts`.
 * Réplique la logique pure du résolveur (PIP + selectBareme) ; les fonctions
 * réelles sont unit-testées dans lib/diagnostic/rent-control.test.ts.
 */
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(path.resolve(process.cwd(), "../.."));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("env Supabase manquant");
const admin = createClient(url, key, { auth: { persistSession: false } });

type Ring = [number, number][];
function ringsOf(g: { type: string; coordinates: unknown }): Ring[] {
  if (g.type === "Polygon") return g.coordinates as Ring[];
  if (g.type === "MultiPolygon") return (g.coordinates as Ring[][]).flat();
  return [];
}
function pip(lon: number, lat: number, g: { type: string; coordinates: unknown }): boolean {
  return ringsOf(g).some((ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]!;
      const [xj, yj] = ring[j]!;
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  });
}

async function main() {
  const TARGET = 7511038; // Porte-Saint-Denis
  const { data: zones } = await admin
    .from("encadrement_zone")
    .select("code_grand_quartier, nom_quartier, geometry");
  const target = (zones ?? []).find((z) => Number(z.code_grand_quartier) === TARGET);
  if (!target) throw new Error("quartier cible absent (seed ?)");

  // Point intérieur = centroïde grossier du 1er anneau.
  const ring = ringsOf(target.geometry as { type: string; coordinates: unknown })[0]!;
  const c = ring.reduce((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]).map((s) => s / ring.length);
  const [lon, lat] = c as [number, number];

  // PIP sur les polygones STOCKÉS → doit retomber sur le quartier cible (et un seul).
  const hits = (zones ?? []).filter((z) =>
    pip(lon, lat, z.geometry as { type: string; coordinates: unknown }),
  );
  const matched = hits.length === 1 && Number(hits[0]!.code_grand_quartier) === TARGET;
  console.log(`PIP centroïde Porte-Saint-Denis → ${hits.length} quartier(s), cible=${matched ? "OK" : "KO"}`);

  // Barème (2 pièces, 1946-1970, non meublé) à deux dates : l'arrêté N prend
  // effet le 1er juillet N, donc au 1er juin 2025 c'est encore le barème 2024.
  const bareme = async (asOf: string) => {
    const { data } = await admin
      .from("encadrement_reference")
      .select("max_cents, millesime, effective_from")
      .eq("code_grand_quartier", TARGET)
      .eq("rooms", 2)
      .eq("construction_period", "1946_1970")
      .eq("furnished", false)
      .lte("effective_from", asOf)
      .order("effective_from", { ascending: false });
    return data?.[0];
  };
  const juin = await bareme("2025-06-01"); // attendu 2024 / 3180
  const aout = await bareme("2025-08-01"); // attendu 2025 / 3290
  console.log(`au 2025-06-01 → millesime=${juin?.millesime} max_cents=${juin?.max_cents} (attendu 2024 / 3180)`);
  console.log(`au 2025-08-01 → millesime=${aout?.millesime} max_cents=${aout?.max_cents} (attendu 2025 / 3290)`);

  // Simulation chiffrage au barème 2025 : 30 m² × 32,90 €/m² = 987 € de plafond ; loyer 1200 €.
  const cap = Math.round((aout?.max_cents ?? 0) * 30);
  const excess = 120000 - cap;
  console.log(`plafond total=${cap}c (${cap / 100}€), loyer=1200€ → dépassement mensuel=${excess}c (${excess / 100}€)`);

  const ok =
    matched &&
    juin?.millesime === 2024 &&
    juin?.max_cents === 3180 &&
    aout?.millesime === 2025 &&
    aout?.max_cents === 3290;
  console.log(ok ? "✅ chaîne géo → date d'effet → barème OK" : "❌ PROBLÈME");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
