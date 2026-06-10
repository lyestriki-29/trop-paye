"use server";

import { revalidatePath } from "next/cache";
import { assertTransition, type DossierStatus } from "@troppaye/shared";
import { requireAdmin } from "@/lib/auth/with-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { actionScheduleFor } from "@/lib/pipeline/schedule";
import { advanceDossier } from "@/lib/pipeline/run";
import { getPaymentProvider } from "@/lib/providers/payment";
import { queueEmail } from "@/lib/notify";

export type AdminResult = { ok: true } | { error: string };

function refresh(dossierId: string): void {
  revalidatePath(`/admin/dossiers/${dossierId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
}

async function loadStatus(dossierId: string): Promise<DossierStatus | null> {
  const { data } = await getSupabaseAdmin()
    .from("dossiers")
    .select("status")
    .eq("id", dossierId)
    .single();
  return (data?.status as DossierStatus | undefined) ?? null;
}

/** Valide un dossier → RECOVERY + planifie J0/J21/J35/J50. LOW = bloqué (garde-fou code). */
export async function validateDossier(dossierId: string): Promise<AdminResult> {
  await requireAdmin();
  const admin = getSupabaseAdmin();
  const status = await loadStatus(dossierId);
  if (status !== "IN_REVIEW") return { error: "Dossier non éligible à la validation." };

  const { data: verdict } = await admin
    .from("verdicts")
    .select("confidence")
    .eq("dossier_id", dossierId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (verdict?.confidence === "LOW") {
    return { error: "Confiance LOW : validation bloquée tant que le dossier n'est pas consolidé." };
  }

  assertTransition("IN_REVIEW", "RECOVERY");
  await admin.from("dossiers").update({ status: "RECOVERY", recovery_state: "SCHEDULED" }).eq("id", dossierId);

  const j0 = new Date().toISOString().slice(0, 10);
  await admin
    .from("actions")
    .insert(actionScheduleFor(j0).map((s) => ({ dossier_id: dossierId, type: s.type, scheduled_at: s.scheduled_at })));

  refresh(dossierId);
  return { ok: true };
}

/** Refuse un dossier (IN_REVIEW → CLOSED). */
export async function refuseDossier(dossierId: string, reason: string): Promise<AdminResult> {
  await requireAdmin();
  const status = await loadStatus(dossierId);
  if (status !== "IN_REVIEW") return { error: "Dossier non éligible au refus." };
  assertTransition("IN_REVIEW", "CLOSED");
  const admin = getSupabaseAdmin();
  await admin.from("dossiers").update({ status: "CLOSED" }).eq("id", dossierId);
  await admin.from("messages").insert({
    dossier_id: dossierId,
    sender: "operator",
    body: reason.trim() || "Dossier clôturé après étude.",
  });
  refresh(dossierId);
  return { ok: true };
}

/** Demande une pièce complémentaire (message opérateur, statut inchangé). */
export async function requestPiece(dossierId: string, note: string): Promise<AdminResult> {
  await requireAdmin();
  const text = note.trim();
  if (!text) return { error: "Précisez la pièce demandée." };
  const admin = getSupabaseAdmin();
  await admin.from("messages").insert({ dossier_id: dossierId, sender: "operator", body: text });
  refresh(dossierId);
  return { ok: true };
}

/** Tag : réponse du bailleur → met la séquence en PAUSE (aucune relance ne part). */
export async function tagLandlordReply(dossierId: string): Promise<AdminResult> {
  await requireAdmin();
  const admin = getSupabaseAdmin();
  await admin.from("dossiers").update({ recovery_state: "PAUSED" }).eq("id", dossierId);
  await admin.from("actions").insert({
    dossier_id: dossierId,
    type: "LANDLORD_REPLY",
    executed_at: new Date().toISOString(),
  });
  refresh(dossierId);
  return { ok: true };
}

/** Reprend une séquence en pause (PAUSED → SCHEDULED). */
export async function resumeRecovery(dossierId: string): Promise<AdminResult> {
  await requireAdmin();
  await getSupabaseAdmin().from("dossiers").update({ recovery_state: "SCHEDULED" }).eq("id", dossierId);
  refresh(dossierId);
  return { ok: true };
}

/** Tag : contestation de fond → VERROUILLE la séquence + escalade. */
export async function tagContestation(dossierId: string): Promise<AdminResult> {
  await requireAdmin();
  const status = await loadStatus(dossierId);
  if (status !== "RECOVERY") return { error: "Escalade possible seulement en recouvrement." };
  assertTransition("RECOVERY", "ESCALATED");
  const admin = getSupabaseAdmin();
  await admin
    .from("dossiers")
    .update({ status: "ESCALATED", recovery_state: "LOCKED" })
    .eq("id", dossierId);
  await admin.from("actions").insert({
    dossier_id: dossierId,
    type: "ESCALATION",
    executed_at: new Date().toISOString(),
  });
  refresh(dossierId);
  return { ok: true };
}

/** Encaissement simulé : fund_movements (IN + commission + reversement) → WON. */
export async function recordPayment(dossierId: string, amountCents: number): Promise<AdminResult> {
  await requireAdmin();
  if (!Number.isInteger(amountCents) || amountCents <= 0) return { error: "Montant invalide." };
  const status = await loadStatus(dossierId);
  if (status !== "RECOVERY" && status !== "ESCALATED") {
    return { error: "Encaissement possible seulement en recouvrement/escalade." };
  }

  const admin = getSupabaseAdmin();
  const { data: mandate } = await admin
    .from("mandates")
    .select("fee_rate_bps")
    .eq("dossier_id", dossierId)
    .maybeSingle();
  const feeBps = mandate?.fee_rate_bps ?? 2500;
  const fee = Math.round((amountCents * feeBps) / 10000);
  const tenant = amountCents - fee;

  const payment = getPaymentProvider();
  const incoming = await payment.recordIncoming(dossierId, amountCents);
  const out = await payment.payout(dossierId, tenant);

  await admin.from("fund_movements").insert([
    { dossier_id: dossierId, direction: "IN", amount_cents: amountCents, reference: incoming.reference },
    { dossier_id: dossierId, direction: "OUT_FEE", amount_cents: fee, reference: incoming.reference },
    { dossier_id: dossierId, direction: "OUT_TENANT", amount_cents: tenant, reference: out.reference },
  ]);
  await admin.from("actions").insert([
    { dossier_id: dossierId, type: "PAYMENT_RECEIVED", executed_at: new Date().toISOString() },
    { dossier_id: dossierId, type: "PAYOUT_SENT", executed_at: new Date().toISOString() },
  ]);

  assertTransition(status, "WON");
  await admin.from("dossiers").update({ status: "WON", recovery_state: "LOCKED" }).eq("id", dossierId);
  refresh(dossierId);
  return { ok: true };
}

/** « Avancer le temps » (dev) : exécute la prochaine Action en attente du dossier. */
export async function advanceTime(dossierId: string): Promise<AdminResult> {
  await requireAdmin();
  const res = await advanceDossier(dossierId, new Date().toISOString());
  refresh(dossierId);
  if (res.processed === 0) return { error: "Aucune action exécutable (séquence en pause/verrou ou terminée)." };
  return { ok: true };
}
