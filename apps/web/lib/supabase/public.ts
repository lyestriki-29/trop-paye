import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { env } from "@/lib/env";

/**
 * Client Supabase PUBLIC (anon, sans cookies) pour les lectures de contenus
 * publiés (guides SEO). Contrairement à `getSupabaseServer`, il ne touche pas
 * à `cookies()` : les pages restent statiques/ISR (perf guides, spec P3).
 * RLS : seuls les contenus autorisés à `anon` sont lisibles.
 */
export function getSupabasePublic() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
