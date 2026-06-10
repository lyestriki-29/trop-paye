import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      include: ["src/rules/**", "src/aggregate.ts"],
      reporter: ["text", "text-summary"],
    },
  },
});
