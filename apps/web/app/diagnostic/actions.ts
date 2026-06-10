"use server";

import { cookies } from "next/headers";
import { evaluateAll } from "@troppaye/rules-engine";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { completeAddress, type AddressSuggestion } from "@/lib/providers/geo";
import { dpeByAddress, dpeByNumber, type DpeResult } from "@/lib/providers/dpe";
import { getReferentials } from "@/lib/referentials";
import { diagnosticSchema, toSnapshot } from "@/lib/diagnostic/schema";

const SESSION_COOKIE = "tp_session";

export async function searchAddressAction(query: string): Promise<AddressSuggestion[]> {
  return completeAddress(query);
}

export async function lookupDpeAction(input: {
  numero?: string;
  label?: string;
}): Promise<DpeResult[]> {
  if (input.numero) {
    const d = await dpeByNumber(input.numero);
    return d ? [d] : [];
  }
  if (input.label) return dpeByAddress(input.label);
  return [];
}

export type SubmitResult = { verdictId: string } | { error: string };

export async function submitDiagnostic(raw: unknown): Promise<SubmitResult> {
  const parsed = diagnosticSchema.safeParse(raw);
  if (!parsed.success) return { error: "Données du diagnostic incomplètes." };
  const input = parsed.data;

  const snapshot = toSnapshot(input);
  const referentials = await getReferentials();
  const asOf = new Date().toISOString().slice(0, 10);
  const verdict = evaluateAll({ dossier: snapshot, referentials, asOf });

  const admin = getSupabaseAdmin();

  // Session anonyme : cookie httpOnly signé côté Supabase, le dossier porte le token.
  const jar = await cookies();
  let token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    token = crypto.randomUUID();
    jar.set(SESSION_COOKIE, token, {
      httpOnly: true,
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
