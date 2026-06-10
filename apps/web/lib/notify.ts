import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Notifications = OUTBOX (table + console) jusqu'à une clé Resend/Brevo. Aucun email réel
 * n'est envoyé : on dépose une ligne `outbox_emails`. Écrit via service_role.
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
