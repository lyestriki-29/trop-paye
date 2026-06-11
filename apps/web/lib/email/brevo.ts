import { env } from "@/lib/env";

/**
 * Envoi transactionnel via l'API Brevo (décision Lyes 2026-06-11).
 * SERVEUR uniquement (clé API). Ne lève jamais : retourne { ok } pour que
 * l'appelant marque la ligne d'outbox `sent` ou `error` sans casser le cron.
 */

interface BrevoSendResult {
  ok: boolean;
  error?: string;
}

/** « TropPayé <no-reply@troppaye.fr> » → { name, email } attendu par Brevo. */
function parseSender(from: string): { name?: string; email: string } {
  const match = from.match(/^(.*)<([^>]+)>\s*$/);
  if (match?.[2]) {
    const name = match[1]?.trim().replace(/^"|"$/g, "");
    return name ? { name, email: match[2].trim() } : { email: match[2].trim() };
  }
  return { email: from.trim() };
}

export async function sendBrevoEmail(params: {
  toEmail: string;
  subject: string;
  text: string;
}): Promise<BrevoSendResult> {
  if (!env.BREVO_API_KEY) return { ok: false, error: "BREVO_API_KEY absente" };
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: parseSender(env.EMAIL_FROM),
        to: [{ email: params.toEmail }],
        subject: params.subject,
        textContent: params.text,
      }),
    });
    if (!res.ok) {
      // Jamais le corps complet en erreur (peut refléter du contenu) : code + statut.
      return { ok: false, error: `Brevo HTTP ${res.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Brevo injoignable" };
  }
}
