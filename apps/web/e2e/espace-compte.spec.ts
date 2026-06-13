import { test, expect } from "@playwright/test";

test("mise à jour des coordonnées (téléphone + préférence notifications)", async ({ page }) => {
  await page.goto("/espace/compte");
  await expect(page.getByRole("heading", { name: "Mon compte" })).toBeVisible();

  await page.getByLabel("Téléphone").fill("0612345678");
  await page.getByRole("button", { name: "Enregistrer" }).click();

  await expect(page.getByText("Préférences enregistrées.")).toBeVisible({ timeout: 15_000 });
});
