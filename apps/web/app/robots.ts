import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** Socle SEO P3 : surfaces privées et internes hors index, sitemap déclaré. */
export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/espace", "/mandat", "/api", "/auth", "/login"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
