import { test, expect } from "@playwright/test";
import { fixtures } from "./helpers";

test("saisir un IBAN l'enregistre et l'affiche masqué", async ({ page }) => {
  const { dossierId } = fixtures();
  await page.goto(`/espace/${dossierId}/versement`);
  await expect(page.getByRole("heading", { name: "Versement" })).toBeVisible();

  await page.getByLabel(/titulaire/i).fill("Jean Locataire");
  await page.getByLabel(/IBAN/i).fill("FR7630006000011234567890189");
  await page.getByRole("button", { name: /enregistrer mon rib/i }).click();

  await expect(page.getByText("FR76 •••• 0189")).toBeVisible({ timeout: 15_000 });
});
