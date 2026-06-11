"use server";

import { z } from "zod";
import { evaluateAll, type DossierSnapshot } from "@troppaye/rules-engine";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { getSessionToken } from "@/lib/diagnostic/session";
import { UUID_RE } from "@/lib/diagnostic/verdict-read";
import { boosterAnswersSchema, mergeBoosterAnswers } from "@/lib/diagnostic/boosters";
import { getReferentials } from "@/lib/referentials";
import { checkRateLimit } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/track";

const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX_PER_SESSION = 10;

const submitSchema = boosterAnswersSchema.extend({
  verdictId: z.string().regex(UUID_RE),
});

// Même message « introuvable » et « session étrangère » : pas d'oracle d'existence.
const NOT_FOUND_ERROR = "TODO_COPY — dossier introuvable ou session expirée";

export type SubmitBoostersResult = { verdictId: string } | { error: string };

/**
 * Persistance AUTORITAIRE des boosters post-verdict (LOT 2). L'aperçu live du
 * client n'est qu'un affichage : ici on refusionne les réponses dans le snapshot
 * (merge PUR partagé), on relance le moteur côté serveur et on insère un NOUVEAU
 * verdict (versionné — le pipeline lit le plus récent). Jamais le total client.
 * Ownership par cookie de session (cf. verdict-read.ts) ; pas de log de PII.
 */
export async function submitBoosters(raw: unknown): Promise<SubmitBoostersResult> {
  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) return { error: "TODO_COPY — saisie invalide" };
  const { verdictId, ...answers } = parsed.data;

  const token = await getSessionToken();
  if (!token) return { error: "TODO_COPY — session expirée" };
  if (!checkRateLimit(`boosters:s:${token}`, RATE_MAX_PER_SESSION, RATE_WINDOW_MS)) {
    return { error: "TODO_COPY — trop de tentatives, réessayez plus tard" };
  }

  const admin = getSupabaseAdmin();
  const { data: v } = await admin
    .from("verdicts")
    .select("dossier_id")
    .eq("id", verdictId)
    .single();
  if (!v) return { error: NOT_FOUND_ERROR };

  const { data: dossier } = await admin
    .from("dossiers")
    .select("session_token, engine_snapshot")
    .eq("id", v.dossier_id)
    .single();
  if (!dossier || !dossier.session_token || dossier.session_token !== token) {
    return { error: NOT_FOUND_ERROR };
  }
  if (!dossier.engine_snapshot) return { error: NOT_FOUND_ERROR };

  // Merge PUR partagé avec l'aperçu client : mêmes entrées ⇒ même snapshot.
  const snapshot = mergeBoosterAnswers(
    dossier.engine_snapshot as unknown as DossierSnapshot,
    answers,
  );

  const asOf = new Date().toISOString().slice(0, 10);
  const referentials = await getReferentials();
  const verdict = evaluateAll({ dossier: snapshot, referentials, asOf });

  // Nouveau verdict (audit trail conservé) + snapshot enrichi sur le dossier.
  const { data: inserted, error: vErr } = await admin
    .from("verdicts")
    .insert({
      dossier_id: v.dossier_id,
      outcome: verdict.outcome,
      confidence: verdict.confidence,
      total_recoverable_cents: verdict.totalRecoverableCents,
      total_future_monthly_saving_cents: verdict.totalFutureMonthlySavingCents,
      results: verdict.results as unknown as Json,
      signals: verdict.signals as unknown as Json,
      as_of: asOf,
    })
    .select("id")
    .single();
  if (vErr || !inserted) return { error: "TODO_COPY — enregistrement impossible, réessayez" };

  await admin
    .from("dossiers")
    .update({ engine_snapshot: snapshot as unknown as Json })
    .eq("id", v.dossier_id);

  // Jalon funnel — aucun montant ni PII dans l'événement.
  await trackEvent("booster_applique", { dossierId: v.dossier_id });

  return { verdictId: inserted.id };
}
