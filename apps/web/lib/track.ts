import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

/** Cookie first-party d'attribution acquisition (posé par proxy.ts sur `?src=`). */
export const SRC_COOKIE = "tp_src";

/** Jalons funnel du PRD §5 + jauges DPE (dpe_match_*) + liste d'attente pilote. */
export type FunnelEvent =
  | "diagnostic_demarre"
  | "dpe_match_found"
  | "dpe_match_missed"
  | "verdict_affiche"
  | "booster_applique"
  | "email_capture"
  | "waitlist_rejointe"
  | "mandat_signe"
  | "j0_envoye"
  | "encaisse"
  | "reverse";

/**
 * Événement funnel first-party (PRD §5) — écrit côté serveur dans
 * `funnel_events` (deny-all RLS, service_role). Zéro PII, zéro cookie tiers,
 * zéro bannière : seul l'`src` d'acquisition (slug) est joint. Best-effort :
 * un échec de mesure ne casse JAMAIS le parcours.
 */
export async function trackEvent(
  event: FunnelEvent,
  opts: { dossierId?: string; metadata?: Record<string, Json> } = {},
): Promise<void> {
  try {
    // cookies() indisponible hors requête (cron) : l'attribution devient null.
    const src = await cookies()
      .then((jar) => jar.get(SRC_COOKIE)?.value ?? null)
      .catch(() => null);
    await getSupabaseAdmin()
      .from("funnel_events")
      .insert({
        event,
        dossier_id: opts.dossierId ?? null,
        src,
        metadata: (opts.metadata ?? {}) as Json,
      });
  } catch {
    /* best-effort : la mesure ne bloque jamais le produit */
  }
}
