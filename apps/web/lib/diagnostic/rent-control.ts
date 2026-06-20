import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  ConstructionPeriod,
  DossierSnapshot,
  RentControlReference,
} from "@troppaye/rules-engine";

/**
 * Résolveur d'encadrement (I/O) : géo-rattachement adresse → quartier
 * (point-in-polygon) puis lookup du loyer de référence majoré applicable. Le
 * moteur reste PUR : il ne reçoit que la référence résolue (`RentControlReference`).
 * Les parties pures (PIP, sélection de barème) sont exportées et testées à part.
 */

type Ring = [number, number][];
interface Geometry {
  type: string;
  coordinates: unknown;
}

/**
 * Ray-casting even-odd sur TOUS les anneaux d'UN polygone (extérieur + trous) :
 * un point dans un trou est traversé deux fois (pair) → dehors. PUR.
 */
function pointInSinglePolygon(lon: number, lat: number, rings: Ring[]): boolean {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]!;
      const [xj, yj] = ring[j]!;
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/** Le point [lon, lat] est-il dans la géométrie (Polygon ou MultiPolygon) ? PUR. */
export function pointInPolygon(lon: number, lat: number, geom: Geometry): boolean {
  if (geom.type === "Polygon") return pointInSinglePolygon(lon, lat, geom.coordinates as Ring[]);
  if (geom.type === "MultiPolygon") {
    return (geom.coordinates as Ring[][]).some((poly) => pointInSinglePolygon(lon, lat, poly));
  }
  return false;
}

export interface BaremeRow {
  max_cents: number;
  ref_cents: number;
  min_cents: number;
  millesime: number;
  effective_from: string;
}

/**
 * Barème applicable à `asOf` (effective_from le plus récent ≤ asOf) + début
 * d'encadrement (le plus ancien effective_from, borne de prescription). PUR.
 */
export function selectBareme(
  rows: BaremeRow[],
  asOf: string,
): { applicable: BaremeRow; schemeStart: string } | null {
  if (rows.length === 0) return null;
  const sorted = [...rows].sort((a, b) => a.effective_from.localeCompare(b.effective_from));
  const day = asOf.slice(0, 10);
  const eligible = sorted.filter((r) => r.effective_from <= day);
  // asOf antérieur à TOUT barème (avant l'entrée en vigueur de l'encadrement) →
  // pas de plafond applicable : on ne fabrique pas un droit (règle inerte).
  if (eligible.length === 0) return null;
  return { applicable: eligible[eligible.length - 1]!, schemeStart: sorted[0]!.effective_from };
}

const PERIOD_LABEL: Record<ConstructionPeriod, string> = {
  BEFORE_1946: "avant 1946",
  "1946_1970": "1946-1970",
  "1971_1990": "1971-1990",
  AFTER_1990: "après 1990",
};

interface ZoneRow {
  code_grand_quartier: number;
  nom_quartier: string;
  geometry: Geometry;
}

// Les 80 polygones sont statiques : on les charge une fois par processus.
let zonesCache: ZoneRow[] | null = null;

async function loadZones(): Promise<ZoneRow[]> {
  if (zonesCache) return zonesCache;
  const { data } = await getSupabaseAdmin()
    .from("encadrement_zone")
    .select("code_grand_quartier, nom_quartier, geometry");
  zonesCache = (data ?? []).map((z) => ({
    code_grand_quartier: Number(z.code_grand_quartier),
    nom_quartier: z.nom_quartier,
    geometry: z.geometry as unknown as Geometry,
  }));
  return zonesCache;
}

/**
 * Résout le loyer de référence majoré du logement. null si une donnée manque
 * (coordonnées, pièces, époque, meublé), si l'adresse tombe hors des quartiers
 * encadrés (trou parisien), ou si aucun barème ne correspond.
 */
export async function resolveRentControl(
  snapshot: DossierSnapshot,
  asOf: string,
): Promise<RentControlReference | null> {
  const { lat, lon, roomCount, constructionPeriod, furnished } = snapshot;
  if (
    lat === undefined ||
    lon === undefined ||
    roomCount === undefined ||
    constructionPeriod === undefined ||
    furnished === undefined
  ) {
    return null;
  }

  const quartier = (await loadZones()).find((z) => pointInPolygon(lon, lat, z.geometry));
  if (!quartier) return null; // hors zone encadrée (ou trou parisien)

  const { data } = await getSupabaseAdmin()
    .from("encadrement_reference")
    .select("max_cents, ref_cents, min_cents, millesime, effective_from")
    .eq("code_grand_quartier", quartier.code_grand_quartier)
    // Barème plafonné à 4 pièces (« 4 et plus ») : la saisie est désormais exacte
    // (5, 6, 7…), donc on regroupe ici tout roomCount ≥ 4 sur la ligne « 4 » pour
    // ne pas retomber silencieusement sur zéro ligne. La valeur exacte reste
    // stockée plus bas (`rooms: roomCount`) pour l'audit trail.
    .eq("rooms", Math.min(roomCount, 4))
    .eq("construction_period", constructionPeriod)
    .eq("furnished", furnished);

  const picked = selectBareme((data ?? []) as BaremeRow[], asOf);
  if (!picked) return null;

  return {
    capPerM2Cents: picked.applicable.max_cents,
    refPerM2Cents: picked.applicable.ref_cents,
    minPerM2Cents: picked.applicable.min_cents,
    millesime: picked.applicable.millesime,
    effectiveFrom: picked.schemeStart,
    zoneLabel: quartier.nom_quartier,
    periodLabel: PERIOD_LABEL[constructionPeriod],
    rooms: roomCount,
    furnished,
  };
}
