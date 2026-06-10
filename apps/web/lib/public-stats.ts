import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Statistiques publiques agrégées (compteur home). */
export interface PublicStats {
  /** Somme des reversements aux locataires (fund_movements.direction = 'OUT_TENANT'). */
  recoveredCents: number;
  /** Dossiers en recouvrement (dossiers.status = 'RECOVERY'). */
  inProgressCount: number;
}

/**
 * Compteur public de la home (copy deck §1) — chiffres RÉELS ou rien :
 * retourne `null` si les deux valent 0 OU si la lecture échoue (env/DB
 * indisponible) → la section Confiance rend le bloc SANS la ligne compteur.
 * Lecture service-role (agrégats anonymes, aucune PII) ; la home reste ISR
 * (`revalidate = 300`), donc au plus une lecture toutes les 5 minutes.
 * NB : somme côté JS — suffisant au lancement, à remplacer par un RPC
 * d'agrégation si le volume de mouvements grossit.
 */
export async function getPublicStats(): Promise<PublicStats | null> {
  try {
    const admin = getSupabaseAdmin();
    const [movements, dossiers] = await Promise.all([
      admin.from("fund_movements").select("amount_cents").eq("direction", "OUT_TENANT"),
      admin
        .from("dossiers")
        .select("id", { count: "exact", head: true })
        .eq("status", "RECOVERY"),
    ]);
    if (movements.error || dossiers.error) return null;

    const recoveredCents = (movements.data ?? []).reduce((sum, m) => sum + m.amount_cents, 0);
    const inProgressCount = dossiers.count ?? 0;
    if (recoveredCents <= 0 && inProgressCount <= 0) return null;
    return { recoveredCents, inProgressCount };
  } catch {
    // Clé service-role absente ou DB injoignable : pas de compteur (jamais de placeholder).
    return null;
  }
}
