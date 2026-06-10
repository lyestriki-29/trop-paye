import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { env } from "@/lib/env";

/**
 * Client service_role — BYPASSE la RLS. À n'utiliser QUE côté serveur
 * (back-office, cron, création de dossier anonyme). Jamais exposé au navigateur.
 */
export function getSupabaseAdmin() {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
