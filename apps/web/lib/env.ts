/** Accès typé aux variables d'environnement. Publiques tolérantes (build), secrètes paresseuses. */

function req(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  get SUPABASE_SERVICE_ROLE_KEY(): string {
    return req("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
  get SIGNATURE_SECRET(): string {
    return req("SIGNATURE_SECRET", process.env.SIGNATURE_SECRET);
  },
  get CRON_SECRET(): string {
    return req("CRON_SECRET", process.env.CRON_SECRET);
  },
  get PIECES_ENCRYPTION_KEY(): string {
    return req("PIECES_ENCRYPTION_KEY", process.env.PIECES_ENCRYPTION_KEY);
  },
  STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET ?? "pieces",
  EMAIL_PROVIDER: (process.env.EMAIL_PROVIDER ?? "outbox") as "outbox" | "resend" | "brevo",
  EMAIL_FROM: process.env.EMAIL_FROM ?? "TropPayé <no-reply@troppaye.fr>",
  GEO_API_BASE: process.env.GEO_API_BASE ?? "https://data.geopf.fr/geocodage",
  ADEME_DPE_API_BASE:
    process.env.ADEME_DPE_API_BASE ?? "https://data.ademe.fr/data-fair/api/v1/datasets",
  ADEME_DPE_DATASET: process.env.ADEME_DPE_DATASET ?? "dpe03existant",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
  CONTENT_MODEL: process.env.CONTENT_MODEL ?? "claude-opus-4-8",
};
