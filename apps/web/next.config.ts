import type { NextConfig } from "next";

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
