/**
 * Garde-fou copy (spec notre-histoire) : le build de PROD échoue tant que des
 * placeholders TODO_COPY subsistent dans les modules de contenu du récit.
 *
 * Périmètre volontairement limité aux modules de contenu de la page récit
 * (le reste du site porte des TODO_COPY historiques gérés autrement).
 *
 * Dérogation explicite : TODO_COPY_ALLOW=1 (CI d'intégration uniquement —
 * le build de déploiement ne doit JAMAIS la poser).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SCOPED_FILES = ["lib/content/notre-histoire.ts"];

if (process.env.TODO_COPY_ALLOW === "1") {
  console.log("[check-copy] TODO_COPY_ALLOW=1 — vérification sautée (CI d'intégration).");
  process.exit(0);
}

const offenders = [];
for (const rel of SCOPED_FILES) {
  const text = readFileSync(resolve(process.cwd(), rel), "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    // Une entrée non remplie = un appel au helper `todo("…")` (le marqueur
    // littéral n'existe qu'à l'exécution). Lyes remplit en remplaçant l'appel
    // par la chaîne du deck §7.
    if (!/\btodo\(\s*"/.test(line)) return;
    offenders.push(`${rel}:${i + 1}`);
  });
}

if (offenders.length > 0) {
  console.error(
    `[check-copy] ÉCHEC : ${offenders.length} placeholder(s) TODO_COPY dans le contenu du récit.\n` +
      offenders.map((o) => `  - ${o}`).join("\n") +
      "\n→ Remplir docs/copy-deck-troppaye.md §7 puis aligner lib/content/notre-histoire.ts.",
  );
  process.exit(1);
}
console.log("[check-copy] OK — aucun TODO_COPY dans le contenu du récit.");
