import { env } from "@/lib/env";

/** DPE issu de l'Observatoire ADEME (dataset dpe03existant). */
export interface DpeResult {
  numero: string;
  class: string; // A–G
  date: string; // ISO
  surfaceM2?: number;
  adresseBan?: string;
}

const SELECT = "numero_dpe,etiquette_dpe,date_etablissement_dpe,surface_habitable_logement,adresse_ban";

interface AdemeLine {
  numero_dpe?: string;
  etiquette_dpe?: string;
  date_etablissement_dpe?: string;
  surface_habitable_logement?: number;
  adresse_ban?: string;
}

function mapLine(l: AdemeLine): DpeResult | null {
  if (!l.etiquette_dpe || !l.date_etablissement_dpe) return null;
  return {
    numero: l.numero_dpe ?? "",
    class: l.etiquette_dpe.toUpperCase(),
    date: l.date_etablissement_dpe.slice(0, 10),
    surfaceM2: l.surface_habitable_logement,
    adresseBan: l.adresse_ban,
  };
}

/**
 * Résultat de recherche : ÉCHEC fournisseur (réseau/5xx) ≠ DPE introuvable.
 * `ok: false` affiche le message « indisponible » côté UI (≠ copy « introuvable » du deck).
 */
export type DpeLookupResult = { ok: true; results: DpeResult[] } | { ok: false };

/** `null` = échec fournisseur (réseau/5xx/JSON invalide) ; `[]` = zéro résultat. */
async function query(params: string): Promise<AdemeLine[] | null> {
  const url = `${env.ADEME_DPE_API_BASE}/${env.ADEME_DPE_DATASET}/lines?${params}&select=${encodeURIComponent(SELECT)}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  try {
    const data = (await res.json()) as { results?: AdemeLine[] };
    return data.results ?? [];
  } catch {
    return null;
  }
}

/** Recherche le DPE par numéro (13 caractères, ex 2611E0031228S). */
export async function dpeByNumber(numero: string): Promise<DpeLookupResult> {
  const n = numero.trim().toUpperCase();
  // Format invalide = introuvable (pas une panne fournisseur).
  if (!/^[0-9A-Z]{13}$/.test(n)) return { ok: true, results: [] };
  const lines = await query(`qs=${encodeURIComponent(`numero_dpe:"${n}"`)}&size=1`);
  if (lines === null) return { ok: false };
  const first = lines[0];
  const mapped = first ? mapLine(first) : null;
  return { ok: true, results: mapped ? [mapped] : [] };
}

/** Recherche les DPE candidats par adresse (texte libre, champ adresse_ban). */
export async function dpeByAddress(addressLabel: string): Promise<DpeLookupResult> {
  const a = addressLabel.trim();
  if (a.length < 5) return { ok: true, results: [] };
  const lines = await query(`q=${encodeURIComponent(a)}&q_fields=adresse_ban&size=5`);
  if (lines === null) return { ok: false };
  return { ok: true, results: lines.map(mapLine).filter((d): d is DpeResult => d !== null) };
}
