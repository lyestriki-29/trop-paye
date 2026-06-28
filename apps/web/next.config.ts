import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Monorepo : charge le .env.local de la RACINE (source unique) en plus de apps/web.
// forceReload=true (4e arg) est OBLIGATOIRE : Next appelle déjà loadEnvConfig sur
// apps/web (sans .env) au démarrage, ce qui remplit le cache interne de @next/env.
// Sans forceReload, notre appel retombe sur ce cache vide et le .env.local racine
// n'est jamais lu → variables NEXT_PUBLIC_* indéfinies et proxy.ts/Supabase plantent.
loadEnvConfig(path.resolve(process.cwd(), "..", ".."), process.env.NODE_ENV !== "production", undefined, true);

const nextConfig: NextConfig = {
  output: "standalone",
  // Les TTF de l'image OG sont lus via fs à l'exécution : sans ce tracing,
  // le build standalone ne les embarque pas (ENOENT en prod).
  outputFileTracingIncludes: { "/api/og/[verdictId]": ["./assets/fonts/**/*"] },
  // Le moteur et la marque sont des packages TS du monorepo → à transpiler.
  transpilePackages: ["@troppaye/shared", "@troppaye/rules-engine"],
  // Redirections 308 pour les pages retirées (évite 404 + préserve le SEO).
  async redirects() {
    return [
      // /a-propos → /notre-histoire (arbitrage Lyes 2026-06-11 : une seule page récit).
      { source: "/a-propos", destination: "/notre-histoire", permanent: true },
      // /resultats supprimée → section #resultats de la home (Lyes 2026-06-13).
      { source: "/resultats", destination: "/#resultats", permanent: true },
      // /guides retirés (→ futur PDF mails de bienvenue) → home (Lyes 2026-06-14).
      { source: "/guides", destination: "/", permanent: true },
      { source: "/guides/:slug", destination: "/", permanent: true },
      // /methode retirée (→ futur espace client) → home (Lyes 2026-06-14).
      { source: "/methode", destination: "/", permanent: true },
    ];
  },
  images: { remotePatterns: [] },
  // Upload de pièces (bail/quittance) via Server Action : le défaut Next de 1 Mo
  // fait planter l'envoi d'un PDF/scan (« Body exceeded 1 MB limit »). On relève la
  // limite — la pièce est chiffrée côté serveur (AES-256-GCM), d'où le passage par
  // Server Action et non un upload direct vers Storage.
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  // NB : cacheComponents (use cache) sera activé plus tard, uniquement sur les
  // surfaces publiques. Par défaut tout est dynamique : sain pour une legaltech
  // (aucune fuite de cache entre dossiers locataires).
};

export default nextConfig;
