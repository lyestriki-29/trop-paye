import path from "node:path";
import { defineConfig } from "vitest/config";

/** Tests unitaires des libs pures (lib/**) — pas de composant React ici. */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      "@troppaye/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
      "@troppaye/rules-engine": path.resolve(
        __dirname,
        "../../packages/rules-engine/src/index.ts",
      ),
    },
  },
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
