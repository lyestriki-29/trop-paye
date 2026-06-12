import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { DossierSnapshot, Referentials, IrlIndexEntry } from "@troppaye/rules-engine";
import { resolveRentControl } from "@/lib/diagnostic/rent-control";

/**
 * Charge les référentiels injectés dans le moteur pur. Avec un `context`
 * (dossier + date d'évaluation), résout en plus le loyer de référence majoré
 * applicable au logement (encadrement) — sinon `rentControl` reste absent et la
 * règle ENCADREMENT est inerte.
 */
export async function getReferentials(context?: {
  snapshot: DossierSnapshot;
  asOf: string;
}): Promise<Referentials> {
  const { data } = await getSupabaseAdmin()
    .from("irl_index")
    .select("quarter, value, verified");

  const irl: IrlIndexEntry[] = (data ?? []).map((r) => ({
    quarter: r.quarter,
    value: Number(r.value),
    verified: r.verified,
  }));

  const rentControl = context
    ? ((await resolveRentControl(context.snapshot, context.asOf)) ?? undefined)
    : undefined;

  // TODO_VERIFIER [AVOCAT] : bouclier loyer = 3,5 % (métropole, T3-2022→T1-2024).
  // Valeur codée en dur — à confirmer à sa source officielle (loi pouvoir d'achat 2022).
  return {
    irl,
    shieldRatePct: 3.5,
    // TODO_VERIFIER [AVOCAT] : plafonds honoraires (décret 2014-890) = 12/10/8 €/m²
    // selon zone + 3 €/m² état des lieux. Valeurs à confirmer à la source.
    // zoneByInsee VIDE : tant que le dataset des zones tendues n'est pas chargé,
    // la règle AGENCY_FEES_CAP reste inerte (aucun chiffrage hasardeux). TODO_VERIFIER.
    agencyFees: {
      capsByZone: {
        TRES_TENDUE: { feePerM2Cents: 1200, edlPerM2Cents: 300 },
        TENDUE: { feePerM2Cents: 1000, edlPerM2Cents: 300 },
        RESTE: { feePerM2Cents: 800, edlPerM2Cents: 300 },
      },
      zoneByInsee: {},
    },
    rentControl,
  };
}
