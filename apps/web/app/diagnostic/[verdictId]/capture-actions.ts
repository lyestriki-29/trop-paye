"use server";

import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSessionToken } from "@/lib/diagnostic/session";
import { leadSchema, LEAD_CONSENT_VERSION, LEAD_PURPOSE } from "@/lib/leads/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/track";

export type SubmitLeadResult = { ok: true } | { error: string };

const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX_PER_SESSION = 5;
const RATE_MAX_PER_IP = 20; // IP partagées (NAT, campus) : plafond plus large que par session

// Même message pour « verdict inexistant » et « cookie d'un autre dossier » :
// pas d'oracle d'existence sur les UUID de verdicts.
const NOT_FOUND_ERROR = "TODO_COPY — dossier introuvable ou session expirée";

/**
 * Capture email+téléphone AVANT verdict (porte sur `/diagnostic/[verdictId]`).
 * Anonyme par construction (pas de compte à ce stade) : la propriété se prouve
 * par le cookie `tp_session` === `dossiers.session_token`, exactement comme
 * `getVerdictForSession` (lib/diagnostic/verdict-read.ts).
 * AUCUN log de PII ; erreurs génériques uniquement.
 */
export async function submitLead(raw: unknown): Promise<SubmitLeadResult> {
  // 1. Validation zod (verdictId uuid, email strict, téléphone FR normalisé).
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return { error: "TODO_COPY — saisie invalide" };

  // 2. Consentement SÉPARÉ pour le téléphone : fourni sans case cochée = refus.
  if (parsed.data.phone && !parsed.data.phoneConsent) {
    return { error: "TODO_COPY [AVOCAT] — consentement téléphone requis" };
  }

  // 3. Session anonyme : sans cookie, inutile d'aller plus loin.
  const token = await getSessionToken();
  if (!token) return { error: "TODO_COPY — session expirée" };

  // 4. Rate-limit AVANT toute requête DB — par session puis par IP (clés en
  //    mémoire éphémères, jamais loguées ni persistées). Backstop dur : index
  //    unique leads(dossier_id).
  if (!checkRateLimit(`lead:s:${token}`, RATE_MAX_PER_SESSION, RATE_WINDOW_MS)) {
    return { error: "TODO_COPY — trop de tentatives, réessayez plus tard" };
  }
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`lead:ip:${ip}`, RATE_MAX_PER_IP, RATE_WINDOW_MS)) {
    return { error: "TODO_COPY — trop de tentatives, réessayez plus tard" };
  }

  // 5. Ownership : verdict → dossier → session_token === cookie (cf. verdict-read.ts).
  const admin = getSupabaseAdmin();
  const { data: verdict } = await admin
    .from("verdicts")
    .select("dossier_id")
    .eq("id", parsed.data.verdictId)
    .single();
  if (!verdict) return { error: NOT_FOUND_ERROR };

  const { data: dossier } = await admin
    .from("dossiers")
    .select("session_token")
    .eq("id", verdict.dossier_id)
    .single();
  if (!dossier || !dossier.session_token || dossier.session_token !== token) {
    return { error: NOT_FOUND_ERROR };
  }

  // 6. Upsert idempotent sur dossier_id : un retry ou une correction d'email
  //    réécrit la même ligne (jamais de doublon, jamais destructif pour le dossier).
  const { error } = await admin.from("leads").upsert(
    {
      dossier_id: verdict.dossier_id,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      consent_at: new Date().toISOString(), // horodate le DERNIER consentement affiché
      consent_text_version: LEAD_CONSENT_VERSION,
      purpose: LEAD_PURPOSE,
    },
    { onConflict: "dossier_id" },
  );
  // Message brut volontairement non propagé (détails internes / PII possibles).
  if (error) return { error: "TODO_COPY — enregistrement impossible, réessayez" };

  // Jalon funnel PRD §5 — l'événement ne porte AUCUNE PII (dossier_id + src seulement).
  await trackEvent("email_capture", { dossierId: verdict.dossier_id });

  return { ok: true };
}
