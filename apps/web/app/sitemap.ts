import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** Sitemap statique des pages publiques indexables. */
export const revalidate = 300;

/** /legal exclu (noindex). Guides (→ PDF) et Méthode (→ espace client) retirés du public. */
const STATIC_PATHS = [
  "/",
  "/diagnostic",
  "/comment-ca-marche",
  "/notre-histoire",
  "/partenaires",
  "/presse",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return STATIC_PATHS.map((p) => ({ url: `${base}${p}` }));
}
