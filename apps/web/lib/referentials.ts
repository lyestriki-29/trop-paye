import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Referentials, IrlIndexEntry } from "@troppaye/rules-engine";

/** Charge les référentiels (IRL depuis la base) injectés dans le moteur pur. */
export async function getReferentials(): Promise<Referentials> {
  const { data } = await getSupabaseAdmin()
    .from("irl_index")
    .select("quarter, value, verified");

  const irl: IrlIndexEntry[] = (data ?? []).map((r) => ({
    quarter: r.quarter,
    value: Number(r.value),
    verified: r.verified,
  }));

  // TODO_VERIFIER [AVOCAT] : bouclier loyer = 3,5 % (métropole, T3-2022→T1-2024).
  // Valeur codée en dur — à confirmer à sa source officielle (loi pouvoir d'achat 2022).
  return { irl, shieldRatePct: 3.5 };
}
