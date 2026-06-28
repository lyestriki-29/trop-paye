import { test, expect } from "@playwright/test";
import { fixtures } from "./helpers";

test("l'aperçu du dossier affiche les onglets et la fourchette", async ({ page }) => {
  const { dossierId } = fixtures();
  await page.goto(`/espace/${dossierId}`);

  const tabs = page.getByRole("navigation", { name: /onglets du dossier/i });
  await expect(tabs).toBeVisible();
  await expect(tabs.getByRole("link", { name: "Aperçu" })).toBeVisible();
  await expect(tabs.getByRole("link", { name: "Pièces" })).toBeVisible();
  await expect(page.getByText(/Trop-perçu visé/i).first()).toBeVisible();
});
