import { test, expect } from "@playwright/test";
import { fixtures } from "./helpers";

test("le locataire envoie un message et le voit apparaître", async ({ page }) => {
  const { dossierId } = fixtures();
  await page.goto(`/espace/${dossierId}/messages`);
  await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();

  const txt = `Message e2e ${Date.now()}`;
  await page.getByPlaceholder(/une question sur votre dossier/i).fill(txt);
  await page.getByRole("button", { name: "Envoyer" }).click();

  await expect(page.getByText(txt)).toBeVisible({ timeout: 15_000 });
});
