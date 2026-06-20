"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/with-auth";
import { callbackSchema, slotLabel, type CallbackInput } from "@/lib/espace/callback";
import { queueEmail } from "@/lib/notify";
import { CONTACT_EMAIL } from "@/lib/content/legal-entity";

export type MessageResult = { ok: true } | { error: string };

/** Le client écrit un message sur SON dossier (RLS : `messages_insert_own`, sender=client). */
export async function postMessage(dossierId: string, body: string): Promise<MessageResult> {
  const { user, supabase } = await requireUser();
  const text = body.trim();
  if (text.length < 1) return { error: "Message vide." };
  if (text.length > 2000) return { error: "Message trop long (2000 caractères max)." };

  const { data: dossier } = await supabase
    .from("dossiers")
    .select("user_id")
    .eq("id", dossierId)
    .maybeSingle();
  if (!dossier || dossier.user_id !== user.id) return { error: "Dossier introuvable." };

  const { error } = await supabase
    .from("messages")
    .insert({ dossier_id: dossierId, sender: "client", body: text });
  if (error) return { error: "Envoi impossible pour ce dossier." };

  revalidatePath(`/espace/${dossierId}`);
  return { ok: true };
}

export type CallbackResult = { ok: true } | { error: string };

/**
 * Le client demande à être rappelé sur SON dossier. Insert RLS (`callback_insert_own`)
 * + ownership explicite (anti-IDOR, comme postMessage) + notification opérateur en
 * outbox (envoi réel gated sur Brevo). Ne loggue jamais le téléphone (PII).
 */
export async function requestCallback(input: CallbackInput): Promise<CallbackResult> {
  const { user, supabase } = await requireUser();
  const parsed = callbackSchema.safeParse(input);
  if (!parsed.success) return { error: "Demande incomplète : vérifiez le sujet et le téléphone." };
  const { dossierId, subject, preferredSlot, phone } = parsed.data;

  const { data: dossier } = await supabase
    .from("dossiers")
    .select("user_id")
    .eq("id", dossierId)
    .maybeSingle();
  if (!dossier || dossier.user_id !== user.id) return { error: "Dossier introuvable." };

  const { error } = await supabase.from("callback_requests").insert({
    dossier_id: dossierId,
    phone,
    subject,
    preferred_slot: preferredSlot,
    status: "PENDING",
  });
  if (error) return { error: "Demande impossible pour ce dossier." };

  // Notification opérateur (outbox ; partira au branchement Brevo). PII non loggée.
  await queueEmail({
    dossierId,
    toEmail: CONTACT_EMAIL,
    subject: `Demande de rappel — ${subject}`,
    body: `Un client demande à être rappelé.\nDossier : ${dossierId}\nCréneau : ${slotLabel(preferredSlot)}\nTéléphone : ${phone}`,
    template: "callback_request",
  });

  revalidatePath(`/espace/${dossierId}`);
  return { ok: true };
}
