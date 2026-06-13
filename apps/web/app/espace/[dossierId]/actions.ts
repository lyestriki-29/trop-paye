"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/with-auth";

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
