import { test, expect, type Page } from "@playwright/test";

/**
 * Tunnel public /diagnostic de bout en bout (adresse → logement → loyer → bail
 * → récap → soumission → page verdict). Exerce explicitement 3 correctifs :
 *   1. Mois/Année dans n'importe quel ordre (année AVANT mois) à la date de bail.
 *   2. Récap pleine largeur, CTA actif, restauration au récap après reload.
 *   3. Chip suggestion IRL « Augmentation légale » (tolérant : si absent, on passe).
 *
 * Le tunnel est PUBLIC : on neutralise la session de l'espace client (global-setup)
 * via un storageState vide. L'autocomplete d'adresse appelle la VRAIE Géoplateforme
 * IGN (Server Action, non mockable côté navigateur) → adresse parisienne réelle +
 * waits généreux. La soumission insère un dossier+verdict ANONYMES en base cloud
 * (cf. NOTE POLLUTION ci-dessous) ; le cookie de session du diagnostic ouvre le
 * verdict complet au propriétaire.
 *
 * NOTE POLLUTION : chaque exécution crée un dossier anonyme dont l'adresse contient
 * « rue du Bac » (Paris) — marqueur de nettoyage. Une purge périodique des dossiers
 * de test (adresse reconnaissable + source de session e2e) sera nécessaire en cloud.
 */

// Adresse de test parisienne réelle (marqueur de nettoyage : « rue du Bac »).
const TEST_ADDRESS_QUERY = "6 rue du Bac, Paris";
const ADDRESS_MARKER = /rue du bac/i;

// Le tunnel est public : on ne veut PAS la session espace partagée du global-setup.
test.use({ storageState: { cookies: [], origins: [] } });

// Marges très généreuses : cloud lent + dev Next à froid + débounce IGN 250 ms.
const LONG = 30_000;

test.beforeEach(async ({ page }) => {
  // Repart propre : on vide le brouillon (clé `tp_diagnostic_draft_v1`) ET la
  // question active (`tp_diagnostic_active_v1`) avant de relancer le tunnel.
  await page.goto("/diagnostic");
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      /* mode privé : non bloquant */
    }
  });
  await page.goto("/diagnostic");
});

/** Pilule de choix (ChoiceField / boutons aria-pressed) repérée par libellé exact. */
function pill(page: Page, label: string) {
  return page.getByRole("button", { name: label, exact: true });
}

test("parcours happy-path du tunnel public jusqu'au verdict", async ({ page }) => {
  test.slow(); // triple les timeouts : cloud + compile à froid.

  // ── Chapitre ADRESSE ────────────────────────────────────────────────
  // Autocomplete IGN réel : on tape une adresse parisienne connue, on attend la
  // liste de suggestions (ul li button), on clique la première. Le tunnel
  // auto-avance après la sélection de l'adresse.
  const addressInput = page.getByPlaceholder("12 rue de la République, Lyon");
  await expect(addressInput).toBeVisible({ timeout: LONG });
  await addressInput.fill(TEST_ADDRESS_QUERY);

  const firstSuggestion = page.locator("ul li button").first();
  await expect(firstSuggestion).toBeVisible({ timeout: LONG });
  await firstSuggestion.click();

  // ── Chapitre LOGEMENT ───────────────────────────────────────────────
  // DPE : « Je ne le connais pas — continuer sans » (bouton, auto-avance).
  const dpeUnknown = page.getByRole("button", { name: /Je ne le connais pas/ });
  await expect(dpeUnknown).toBeVisible({ timeout: LONG });
  await dpeUnknown.click();

  // Surface : facultative → on passe avec « Continuer ».
  await clickContinue(page);

  // Époque de construction (pilule, auto-avance).
  const constructionPill = pill(page, "Avant 1946");
  await expect(constructionPill).toBeVisible({ timeout: LONG });
  await constructionPill.click();

  // Meublé : « Non meublé » (pilule, auto-avance).
  const furnishedPill = pill(page, "Non meublé");
  await expect(furnishedPill).toBeVisible({ timeout: LONG });
  await furnishedPill.click();

  // Pièces : stepper EXACT. « — » avant saisie ; un clic « Augmenter » pose le
  // minimum (1), un second clic mène à 2 pièces. Puis « Continuer ».
  const stepperOutput = page.locator("output").first();
  await expect(stepperOutput).toBeVisible({ timeout: LONG });
  await expect(stepperOutput).toHaveText("—");
  const increase = page.getByRole("button", { name: "Augmenter" });
  await increase.click(); // 1
  await increase.click(); // 2
  await expect(stepperOutput).toHaveText("2");
  await clickContinue(page);

  // Colocation : « Non » (pilule, auto-avance). Évite tenantCount / rentBasis.
  const colocNo = pill(page, "Non");
  await expect(colocNo).toBeVisible({ timeout: LONG });
  await colocNo.click();

  // ── Chapitre LOYER ──────────────────────────────────────────────────
  // Mode de saisie : « Hors charges » (pilule, auto-avance).
  const modeHc = pill(page, "Hors charges");
  await expect(modeHc).toBeVisible({ timeout: LONG });
  await modeHc.click();

  // Loyer actuel (MoneyField, label flottant). Ordre du graphe : actuel AVANT départ.
  const currentRent = page.getByLabel("Loyer mensuel actuel (hors charges)");
  await expect(currentRent).toBeVisible({ timeout: LONG });
  await currentRent.fill("1500");
  await clickContinue(page);

  // Loyer de départ (MoneyField).
  const initialRent = page.getByLabel("Loyer mensuel de départ (hors charges)");
  await expect(initialRent).toBeVisible({ timeout: LONG });
  await initialRent.fill("1200");
  await clickContinue(page);

  // Dépôt de garantie : facultatif → on passe.
  await clickContinue(page);

  // Complément de loyer : « Non » (pilule, mais PAS d'auto-avance pour cette
  // question → il faut cliquer « Continuer » après l'avoir cochée).
  const supplementNo = pill(page, "Non");
  await expect(supplementNo).toBeVisible({ timeout: LONG });
  await supplementNo.click();
  await clickContinue(page);

  // ── Chapitre BAIL ───────────────────────────────────────────────────
  // FIX #1 : Mois/Année dans n'importe quel ordre. On choisit l'ANNÉE (2020)
  // PUIS le MOIS (Janvier = 1) — l'inverse de l'ordre visuel.
  const yearSelect = page.locator('select[aria-label="Année"]');
  const monthSelect = page.locator('select[aria-label="Mois"]');
  await expect(yearSelect).toBeVisible({ timeout: LONG });
  await yearSelect.selectOption("2020");
  await monthSelect.selectOption("1"); // option value = numéro de mois
  await clickContinue(page);

  // Clause de révision : « Oui » + trimestre IRL « T1 » → alimente la suggestion
  // IRL des hausses (fix #3). Champs auto-avance/Continuer mêlés sur cet écran.
  const clauseYes = pill(page, "Oui");
  await expect(clauseYes).toBeVisible({ timeout: LONG });
  await clauseYes.click();
  const quarterT1 = pill(page, "T1");
  if (await quarterT1.count()) {
    await quarterT1.first().click();
  }
  await clickContinue(page);

  // Historique des hausses : facultatif.
  // FIX #3 (tolérant) : si un chip « Augmentation légale » apparaît, on le clique
  // et on vérifie qu'un champ montant se remplit. Sinon (pas d'anniversaire / pas
  // d'indice IRL dispo), on ne fait PAS échouer le test sur ce point.
  const irlChip = page.getByRole("button", { name: /Augmentation légale/ });
  // Laisse le temps aux suggestions IRL (Server Actions par anniversaire) d'arriver.
  await page.waitForTimeout(2_000);
  if (await irlChip.count()) {
    const amountFields = page.getByLabel("Nouveau loyer après la hausse");
    await irlChip.first().click();
    // Le chip n'existe que pour les lignes qui ont une suggestion : `first()` peut
    // donc viser une ligne autre que la 1re. On vérifie qu'AU MOINS un champ
    // montant d'anniversaire est devenu non vide (la ligne du chip cliqué).
    await expect
      .poll(
        async () =>
          (
            await amountFields.evaluateAll((els) =>
              els.map((e) => (e as HTMLInputElement).value),
            )
          ).some((v) => v.trim() !== ""),
        { timeout: LONG },
      )
      .toBe(true);
  }

  // On passe l'étape hausses (bouton de friction réduite) pour atteindre le récap.
  const skipHistory = page.getByRole("button", { name: /passer cette étape/ });
  if (await skipHistory.count()) {
    await skipHistory.first().click();
  } else {
    await clickContinue(page);
  }

  // ── Chapitre RÉCAP ──────────────────────────────────────────────────
  // FIX #2 : récap pleine largeur. Le panneau récap est visible et le CTA
  // « Voir mon résultat » est ENABLED (dossier soumettable).
  const submitCta = page.getByRole("button", { name: "Voir mon résultat" });
  await expect(submitCta).toBeVisible({ timeout: LONG });
  await expect(submitCta).toBeEnabled({ timeout: LONG });

  // La synthèse (DossierPanel pleine largeur au récap) reflète l'adresse de test
  // ET la date de bail. Le résumé du graphe formate la signature en ISO tronqué
  // (`Bail 2020-01`) — preuve que le fix #1 (année puis mois) a bien été capté.
  await expect(page.getByText(ADDRESS_MARKER).first()).toBeVisible({ timeout: LONG });
  await expect(page.getByText(/2020-01/).first()).toBeVisible({ timeout: LONG });

  // FIX #2 (suite) : on recharge. Le dossier étant soumettable, on REVIENT au
  // récap (et non au début du tunnel).
  await page.reload();
  const submitCtaAfterReload = page.getByRole("button", { name: "Voir mon résultat" });
  await expect(submitCtaAfterReload).toBeVisible({ timeout: LONG });
  await expect(submitCtaAfterReload).toBeEnabled({ timeout: LONG });

  // ── SOUMISSION → VERDICT ────────────────────────────────────────────
  await submitCtaAfterReload.click();

  // On attend l'URL /diagnostic/<uuid>.
  await page.waitForURL(/\/diagnostic\/[0-9a-f-]{36}/, { timeout: 60_000 });

  // Au moins un état de verdict est rendu (montant chiffré, conforme, orientation,
  // ou pièces manquantes). On couvre les libellés réels des 4 états + le héros
  // chiffré (badge « Réf. dossier »).
  const verdictState = page.getByText(
    /Réf\. dossier|rien à signaler|appelle une vérification|manque une information|Diagnostic terminé|Diagnostic à compléter/i,
  );
  await expect(verdictState.first()).toBeVisible({ timeout: LONG });
});

/** Clique le bouton « Continuer » (champs libres : avance manuelle). */
async function clickContinue(page: Page): Promise<void> {
  const cont = page.getByRole("button", { name: "Continuer" });
  await expect(cont).toBeVisible({ timeout: LONG });
  await cont.click();
}
