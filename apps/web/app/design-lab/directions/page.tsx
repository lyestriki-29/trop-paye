import Link from "next/link";

/**
 * Index du duel P0 — comparateur des 3 directions artistiques.
 * Arbitrage : choisir UNE direction. La gagnante devient la charte v2 ;
 * les perdantes partent dans /design-lab/archive.
 */

interface Direction {
  id: "d1" | "d2" | "d3";
  name: string;
  partiPris: string;
}

const DIRECTIONS: Direction[] = [
  {
    id: "d1",
    name: "D1 « Document officiel »",
    partiPris:
      "Le vocabulaire visuel de l'administration devient l'arme du locataire — quittance, filets, tampon.",
  },
  {
    id: "d2",
    name: "D2 « Relevé de compte »",
    partiPris:
      "La preuve par les chiffres — un produit financier de précision, montants mono en vedette, zéro métaphore papier.",
  },
  {
    id: "d3",
    name: "D3 « De votre côté »",
    partiPris:
      "L'allié chaleureux — gros boutons, langage humain, le surligneur jaune comme signature.",
  },
];

const SCREENS = [
  { slug: "home", label: "Home" },
  { slug: "verdict", label: "Verdict animé" },
  { slug: "identite", label: "Identité" },
] as const;

export default function DirectionsIndex() {
  return (
    <main className="mx-auto max-w-container px-6 py-12">
      <h1 className="font-display text-2xl font-extrabold tracking-display">
        Duel P0 · Trois directions artistiques
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Deux écrans témoins par direction (home + verdict animé) et une page identité.
        Critères d'arbitrage : lisibilité, caractère, cohérence avec le positionnement
        « sérieux mais pas corporate », envie de cliquer.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {DIRECTIONS.map((d) => (
          <article key={d.id} className="rounded-card border border-line bg-paper p-6">
            <h2 className="font-display text-lg font-bold">{d.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{d.partiPris}</p>
            <ul className="mt-5 space-y-2">
              {SCREENS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/design-lab/directions/${d.id}/${s.slug}`}
                    className="text-sm font-medium text-refund-text underline-offset-2 hover:underline"
                  >
                    {s.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="mt-12 border-t border-line pt-4 text-xs text-ink/50">
        Arbitrage : choisir UNE direction. La gagnante devient la charte v2 ; les perdantes
        partent dans /design-lab/archive.
      </p>
    </main>
  );
}
