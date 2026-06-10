import type { MetadataRoute } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const { data } = await getSupabaseAdmin()
    .from("articles")
    .select("slug, published_at")
    .eq("status", "PUBLISHED");

  const guides: MetadataRoute.Sitemap = (data ?? []).map((a) => ({
    url: `${base}/guides/${a.slug}`,
    lastModified: a.published_at ?? undefined,
  }));

  return [
    { url: `${base}/` },
    { url: `${base}/diagnostic` },
    { url: `${base}/guides` },
    ...guides,
  ];
}
