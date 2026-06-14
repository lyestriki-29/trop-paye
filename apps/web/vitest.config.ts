import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Tests unitaires des libs pures (lib/**) et des Route Handlers (app/api/**) —
 * pas de rendu de composant React ici (la route OG rend via satori, hors DOM).
 */
export default defineConfig({
  // Next impose `jsx: preserve` dans tsconfig ; pour importer la route OG (.tsx),
  // oxc doit transformer le JSX vers le runtime React automatique.
  oxc: { jsx: { runtime: "automatic" } },
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
    // Composants du récit (notre-histoire) : tests de comportement en jsdom
    // (pragma `@vitest-environment jsdom` par fichier) — le reste en node.
    include: [
      "lib/**/*.test.ts",
      "app/api/**/*.test.ts",
      "app/diagnostic/**/*.test.ts",
      "components/**/*.test.tsx",
    ],
    environment: "node",
  },
});
