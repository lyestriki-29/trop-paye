import { env } from "@/lib/env";

/** Suggestion d'adresse (Géoplateforme IGN — la BAN historique est morte). */
export interface AddressSuggestion {
  label: string;
  banId: string;
  inseeCode: string;
  postcode?: string;
  city?: string;
  lat?: number;
  lon?: number;
}

interface GeoFeature {
  properties?: {
    label?: string;
    id?: string;
    banId?: string;
    citycode?: string;
    postcode?: string;
    city?: string;
  };
  geometry?: { coordinates?: [number, number] };
}

/**
 * Autocomplétion + géocodage d'adresse via la Géoplateforme IGN.
 * Renvoie banId + code INSEE (clés de jointure DPE/zonages).
 */
export async function completeAddress(query: string): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = `${env.GEO_API_BASE}/search?q=${encodeURIComponent(q)}&limit=6&autocomplete=1&index=address`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    return [];
  }
  if (!res.ok) return [];

  const data = (await res.json()) as { features?: GeoFeature[] };
  return (data.features ?? [])
    .map((f): AddressSuggestion | null => {
      const p = f.properties ?? {};
      const inseeCode = p.citycode ?? "";
      const label = p.label ?? "";
      if (!label) return null;
      return {
        label,
        banId: p.banId ?? p.id ?? "",
        inseeCode,
        postcode: p.postcode,
        city: p.city,
        lat: f.geometry?.coordinates?.[1],
        lon: f.geometry?.coordinates?.[0],
      };
    })
    .filter((s): s is AddressSuggestion => s !== null);
}
