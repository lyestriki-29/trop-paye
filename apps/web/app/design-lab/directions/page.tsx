import Link from "next/link";

/**
 * Index du duel P0 — synthèse V2 (arbitrée) en tête + les trois directions
 * d'origine, conservées pour référence. Arbitrage du 2026-06-10 : home D3 +
 * carte-quittance D1 ; verdict D3 (surligneur + count-up) sur le contenu
 * quittance D1 ; identité D3 + tampon D1. La V2 devient la charte v2 ;
 * D1–D3 partiront dans /design-lab/archive.
 */

interface Direction {
  id: "d1" | "d2" | "d3";
  name: string;
  partiPris: string;
}

const ARCHIVED: Direction[] = [
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
        Duel P0 · Synthèse V2
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        L&apos;arbitrage est rendu : la V2 fusionne la chaleur de D3 et le langage
        documentaire de D1. Les trois directions du duel restent consultables
        ci-dessous, archivées pour référence.
      </p>

      <article className="mt-10 rounded-card border-2 border-ink bg-paper p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-refund-text">
          Direction retenue
        </p>
        <h2 className="mt-3 font-display text-xl font-extrabold tracking-display">
          V2 Synthèse (arbitrage du 2026-06-10)
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
          L&apos;allié chaleureux qui montre la preuve comptable — base D3, quittance et
          tampon D1.
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          {SCREENS.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/design-lab/directions/v2/${s.slug}`}
                className="text-sm font-semibold text-refund-text underline-offset-2 hover:underline"
              >
                {s.label} →
              </Link>
            </li>
          ))}
        </ul>
      </article>

      <h2 className="mt-14 font-display text-lg font-bold tracking-display text-ink/70">
        Directions du duel — archivées pour référence
      </h2>
      <div className="mt-5 grid gap-6 md:grid-cols-3">
        {ARCHIVED.map((d) => (
          <article key={d.id} className="rounded-card border border-line bg-paper-2 p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/45">
              Archivée pour référence
            </p>
            <h3 className="mt-2 font-display text-lg font-bold text-ink/80">{d.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{d.partiPris}</p>
            <ul className="mt-5 space-y-2">
              {SCREENS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/design-lab/directions/archive/${d.id}/${s.slug}`}
                    className="text-sm font-medium text-ink/55 underline-offset-2 hover:underline"
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
        Arbitrage rendu le 2026-06-10 : la V2 est la charte v2 du produit ; D1–D3 sont
        archivées ci-dessus pour référence.
      </p>
    </main>
  );
}
