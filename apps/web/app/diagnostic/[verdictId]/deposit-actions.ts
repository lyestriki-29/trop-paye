"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { evaluateAll, type DossierSnapshot } from "@troppaye/rules-engine";
import { getSessionToken } from "@/lib/diagnostic/session";
import { UUID_RE } from "@/lib/diagnostic/verdict-read";
import { depositAnswersSchema, mergeDepositAnswers } from "@/lib/diagnostic/deposit-tunnel";
import { checkRateLimit } from "@/lib/rate-limit";
import { getReferentials } from "@/lib/referentials";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { trackEvent } from "@/lib/track";

const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX_PER_SESSION = 10;
const RATE_MAX_PER_IP = 40;

const submitSchema = z.object({ verdictId: z.string().regex(UUID_RE) }).and(depositAnswersSchema);
const NOT_FOUND_ERROR = "TODO_COPY — dossier introuvable ou session expirée";
const INVALID_ERROR = "TODO_COPY — saisie invalide";

export type SubmitDepositResult = { verdictId: string } | { error: string };

/**
 * Persistance AUTORITAIRE du mini-tunnel dépôt (LOT 3). Le client ne fournit
 * que les réponses ; le serveur refait le merge PUR, relance le moteur et
 * insère un verdict versionné. Ownership par cookie `tp_session` uniquement.
 * TODO_COPY — messages brouillon.
 */
export async function submitDeposit(raw: unknown): Promise<SubmitDepositResult> {
  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) return { error: INVALID_ERROR };
  const { verdictId, ...answers } = parsed.data;

  const token = await getSessionToken();
  if (!token) return { error: "TODO_COPY — session expirée" };
  if (!checkRateLimit(`deposit:s:${token}`, RATE_MAX_PER_SESSION, RATE_WINDOW_MS)) {
    return { error: "TODO_COPY — trop de tentatives, réessayez plus tard" };
  }
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`deposit:ip:${ip}`, RATE_MAX_PER_IP, RATE_WINDOW_MS)) {
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

  const source = dossier.engine_snapshot as unknown as DossierSnapshot;
  let snapshot: DossierSnapshot;
  try {
    snapshot = mergeDepositAnswers(source, answers);
  } catch {
    return { error: INVALID_ERROR };
  }

  const asOf = new Date().toISOString().slice(0, 10);
  const referentials = await getReferentials();
  const verdict = evaluateAll({ dossier: snapshot, referentials, asOf });

  const { error: sErr } = await admin
    .from("dossiers")
    .update({ engine_snapshot: snapshot as unknown as Json })
    .eq("id", v.dossier_id);
  if (sErr) return { error: "TODO_COPY — enregistrement impossible, réessayez" };

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

  await trackEvent("deposit_tunnel_applique", { dossierId: v.dossier_id });
  return { verdictId: inserted.id };
}
