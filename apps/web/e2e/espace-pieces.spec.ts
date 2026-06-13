import { test, expect } from "@playwright/test";
import { fixtures, SAMPLE_PDF, SAMPLE_PDF_2 } from "./helpers";

test("déposer bail + quittance lance l'étude (MANDATE_PENDING → IN_REVIEW)", async ({ page }) => {
  const { mandatePendingDossierId } = fixtures();
  await page.goto(`/espace/${mandatePendingDossierId}/pieces`);
  await expect(page.getByRole("heading", { name: /Vos pièces/i })).toBeVisible();

  // Bail (type par défaut "bail"). 1er upload = compile à froid de l'action serveur → marge large.
  // On vérifie la LIGNE de pièce (un lien /api/pieces/...), pas le texte "Reçue" de la checklist.
  await page.getByRole("combobox").selectOption("bail");
  await page.locator('input[type="file"]').setInputFiles(SAMPLE_PDF);
  await expect(page.getByRole("link", { name: /Bail/i })).toBeVisible({ timeout: 60_000 });

  // Quittance → déclenche le gate (bail + quittance présents).
  // Fichier DISTINCT du bail : ré-uploader le même fichier ne change pas la valeur
  // de l'input et peut ne pas déclencher le change → l'insert serait sauté.
  await page.getByRole("combobox").selectOption("quittance");
  await page.locator('input[type="file"]').setInputFiles(SAMPLE_PDF_2);
  await expect(page.getByRole("link", { name: /Quittance/i })).toBeVisible({ timeout: 60_000 });

  // Le dossier est passé en étude : visible sur l'Aperçu (KPI Statut)
  await page.goto(`/espace/${mandatePendingDossierId}`);
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByText("IN_REVIEW").first()).toBeVisible({ timeout: 45_000 });
});
