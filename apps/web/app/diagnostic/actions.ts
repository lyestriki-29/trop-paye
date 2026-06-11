"use server";

import { cookies } from "next/headers";
import { evaluateAll } from "@troppaye/rules-engine";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { completeAddress, type AddressSearchResult } from "@/lib/providers/geo";
import { dpeByAddress, dpeByNumber, type DpeLookupResult } from "@/lib/providers/dpe";
import { getReferentials } from "@/lib/referentials";
import { diagnosticSchema, toSnapshot } from "@/lib/diagnostic/schema";
import { SESSION_COOKIE } from "@/lib/diagnostic/session";
import { trackEvent } from "@/lib/track";

// Échec fournisseur (`ok: false`) ≠ zéro résultat : l'UI bascule en saisie manuelle.
export async function searchAddressAction(query: string): Promise<AddressSearchResult> {
  // Garde-fou anti-abus : trop court = bruit, trop long = requête forgée. On ne propage pas.
  const q = query.trim();
  if (q.length < 3 || q.length > 200) return { ok: true, suggestions: [] };
  return completeAddress(q);
}

// Même mécanique : échec ADEME (`ok: false`) ≠ DPE introuvable (`results: []`).
export async function lookupDpeAction(input: {
  numero?: string;
  label?: string;
}): Promise<DpeLookupResult> {
  if (input.numero) {
    const numero = input.numero.trim();
    if (numero.length === 0 || numero.length > 64) return { ok: true, results: [] };
    return tracked(await dpeByNumber(numero), "numero");
  }
  if (input.label) {
    const label = input.label.trim();
    if (label.length < 3 || label.length > 200) return { ok: true, results: [] };
    return tracked(await dpeByAddress(label), "adresse");
  }
  return { ok: true, results: [] };
}

/** Jauge n°1 du PRD §6 : taux de matching DPE ≥ 60 % — mesuré dès le jour 1. */
async function tracked(res: DpeLookupResult, mode: string): Promise<DpeLookupResult> {
  if (res.ok) {
    await trackEvent(res.results.length > 0 ? "dpe_match_found" : "dpe_match_missed", {
      metadata: { mode },
    });
  }
  return res;
}

export type SubmitResult = { verdictId: string } | { error: string };

export async function submitDiagnostic(raw: unknown): Promise<SubmitResult> {
  const parsed = diagnosticSchema.safeParse(raw);
  if (!parsed.success) return { error: "Données du diagnostic incomplètes." };
  const input = parsed.data;

  const asOf = new Date().toISOString().slice(0, 10);
  const snapshot = toSnapshot(input, asOf);
  const referentials = await getReferentials();
  const verdict = evaluateAll({ dossier: snapshot, referentials, asOf });

  const admin = getSupabaseAdmin();

  // Session anonyme : cookie httpOnly signé côté Supabase, le dossier porte le token.
  const jar = await cookies();
  let token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    token = crypto.randomUUID();
    jar.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  const { data: dossier, error: dErr } = await admin
    .from("dossiers")
    .insert({
      session_token: token,
      status: "DIAGNOSED",
      address_label: input.addressLabel,
      ban_id: input.banId,
      insee_code: input.inseeCode,
      surface_m2: input.surfaceM2,
      furnished: input.furnished,
      lease_signed_at: input.leaseSignedAt,
      initial_rent_cents: input.initialRentCents,
      current_rent_cents: input.currentRentCents,
      revision_clause: input.revisionClause,
      revision_quarter: input.revisionQuarter,
      dpe_class: input.dpe?.class,
      dpe_date: input.dpe?.date,
      dpe_number: input.dpe?.numero,
      dpe_source: input.dpe?.source,
      engine_snapshot: snapshot as unknown as Json,
    })
    .select("id")
    .single();
  if (dErr || !dossier) return { error: dErr?.message ?? "Impossible d'enregistrer le dossier." };

  const { data: v, error: vErr } = await admin
    .from("verdicts")
    .insert({
      dossier_id: dossier.id,
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
  if (vErr || !v) return { error: vErr?.message ?? "Impossible d'enregistrer le verdict." };

  return { verdictId: v.id };
}
