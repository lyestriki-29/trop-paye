import type { MetadataRoute } from "next";
import { getSupabasePublic } from "@/lib/supabase/public";
import { env } from "@/lib/env";

/** ISR : régénéré toutes les 5 min (client public sans cookies, RLS published). */
export const revalidate = 300;

/** Pages publiques indexables (P3) — /legal volontairement exclu (noindex). */
const STATIC_PATHS = [
  "/",
  "/diagnostic",
  "/comment-ca-marche",
  "/resultats",
  "/notre-histoire",
  "/methode",
  "/partenaires",
  "/presse",
  "/guides",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const { data } = await getSupabasePublic()
    .from("articles")
    .select("slug, published_at")
    .eq("status", "PUBLISHED");

  const guides: MetadataRoute.Sitemap = (data ?? []).map((a) => ({
    url: `${base}/guides/${a.slug}`,
    lastModified: a.published_at ?? undefined,
  }));

  return [...STATIC_PATHS.map((p) => ({ url: `${base}${p}` })), ...guides];
}
