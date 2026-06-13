import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

/**
 * E2E TropPayé — espace client. Auth via `global-setup` (lien démo à usage unique
 * échangé dans un vrai navigateur → storageState). Serveur dev local sur :3000.
 * Série (workers=1) : le compte démo est partagé et le test du gate mute un dossier.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  // Dev Next est lent (4-10 s/requête en compile à froid) : marges généreuses.
  timeout: 120_000,
  expect: { timeout: 25_000 },
  reporter: [["list"]],
  globalSetup: path.resolve(__dirname, "e2e/global-setup.ts"),
  use: {
    baseURL: "http://localhost:3000",
    storageState: path.resolve(__dirname, "e2e/.auth/state.json"),
    trace: "on-first-retry",
    navigationTimeout: 90_000,
    actionTimeout: 25_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
