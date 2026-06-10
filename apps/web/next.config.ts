import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Monorepo : charge le .env.local de la RACINE (source unique) en plus de apps/web.
loadEnvConfig(path.resolve(process.cwd(), "..", ".."));

const nextConfig: NextConfig = {
  output: "standalone",
  // Le moteur et la marque sont des packages TS du monorepo → à transpiler.
  transpilePackages: ["@troppaye/shared", "@troppaye/rules-engine"],
  images: { remotePatterns: [] },
  // NB : cacheComponents (use cache) sera activé plus tard, uniquement sur les
  // surfaces publiques. Par défaut tout est dynamique : sain pour une legaltech
  // (aucune fuite de cache entre dossiers locataires).
};

export default nextConfig;
