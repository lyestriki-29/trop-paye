import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendBrevoEmail } from "@/lib/email/brevo";
import { env } from "@/lib/env";

/**
 * Notifications = OUTBOX d'abord (file durable), envoi réel ensuite : tant que
 * EMAIL_PROVIDER ≠ brevo (ou clé absente), rien ne part — la file s'accumule et
 * tout part au branchement de la clé. Écrit via service_role.
 */
export async function queueEmail(params: {
  dossierId?: string;
  toEmail: string;
  subject: string;
  body: string;
  template?: string;
}): Promise<void> {
  const admin = getSupabaseAdmin();
  await admin.from("outbox_emails").insert({
    dossier_id: params.dossierId ?? null,
    to_email: params.toEmail,
    subject: params.subject,
    body: params.body,
    template: params.template ?? null,
    status: "queued",
  });
}

export interface FlushResult {
  sent: number;
  failed: number;
  skipped: boolean;
}

/**
 * Vide l'outbox via Brevo (appelé par le cron run-due-actions). Claim atomique
 * ligne à ligne (`queued` → `sending`) : deux crons concurrents n'envoient
 * jamais le même email. Échec d'envoi → `error` (re-tentable à la main).
 */
export async function flushOutbox(limit = 25): Promise<FlushResult> {
  if (env.EMAIL_PROVIDER !== "brevo" || !env.BREVO_API_KEY) {
    return { sent: 0, failed: 0, skipped: true };
  }
  const admin = getSupabaseAdmin();
  const { data: queued } = await admin
    .from("outbox_emails")
    .select("id, to_email, subject, body")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(limit);

  let sent = 0;
  let failed = 0;
  for (const row of queued ?? []) {
    const { data: claimed } = await admin
      .from("outbox_emails")
      .update({ status: "sending" })
      .eq("id", row.id)
      .eq("status", "queued")
      .select("id")
      .maybeSingle();
    if (!claimed) continue; // déjà pris par un autre passage

    const res = await sendBrevoEmail({
      toEmail: row.to_email,
      subject: row.subject,
      text: row.body,
    });
    await admin
      .from("outbox_emails")
      .update(
        res.ok
          ? { status: "sent", sent_at: new Date().toISOString() }
          : { status: "error" },
      )
      .eq("id", row.id);
    if (res.ok) sent += 1;
    else failed += 1;
  }
  return { sent, failed, skipped: false };
}
