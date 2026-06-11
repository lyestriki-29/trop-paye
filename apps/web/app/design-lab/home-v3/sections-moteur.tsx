import { Reveal } from "@/components/home/Reveal";
import { Marker } from "@/components/ui/Marker";

/**
 * Pièce n°02 — l'instruction : le pipeline réel du moteur (Géoplateforme IGN,
 * ADEME, INSEE, rules-engine) mis en scène sur papier millimétré. C'est la
 * section « expertise » : on montre les vraies sources, pas du marketing.
 * Intitulés = TODO_COPY (hors copy deck) ; sources factuelles (CLAUDE.md).
 */

interface Etape {
  num: string;
  title: string;
  source: string;
  text: string;
  meta: string;
}

const PIPELINE: ReadonlyArray<Etape> = [
  {
    num: "A",
    title: "Adresse",
    source: "Géoplateforme IGN",
    text: "Le géocodage officiel de l'État situe le logement et son contexte locatif.",
    meta: "data.geopf.fr",
  },
  {
    num: "B",
    title: "DPE",
    source: "Base ADEME",
    text: "Le diagnostic énergétique réellement enregistré pour le logement — pas une estimation.",
    meta: "DPE logements existants",
  },
  {
    num: "C",
    title: "Indice des loyers",
    source: "INSEE — série 001515333",
    text: "L'indice de référence des loyers, celui qui borne légalement chaque hausse.",
    meta: "IRL trimestriel",
  },
  {
    num: "D",
    title: "Verdict",
    source: "Moteur TropPayé",
    text: "Règle citée (id + version), base légale, calcul détaillé ligne à ligne.",
    meta: "score de confiance",
  },
];

export function MoteurV3() {
  return (
    <section className="v3-grid border-b border-line py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="font-mono text-xs font-medium uppercase tracking-widest text-ink/45">
            Pièce n°02 · L&apos;instruction
          </p>
          {/* TODO_COPY — intitulé de section (hors copy deck). */}
          <h2 className="mt-2 max-w-2xl font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Votre dossier est <Marker>instruit</Marker>, pas estimé.
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PIPELINE.map(({ num, title, source, text, meta }, i) => (
            <Reveal key={num} delay={0.08 + i * 0.08} className="relative h-full">
              {/* Connecteur pointillé vers l'étape suivante (desktop). */}
              {i < PIPELINE.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute -right-6 top-1/2 hidden w-6 border-t-2 border-dashed border-ink/25 xl:block"
                />
              ) : null}
              <li className="flex h-full flex-col rounded-card border border-line bg-paper p-6 shadow-lift">
                <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-field border-2 border-ink font-mono text-sm font-medium">
                    {num}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/45">
                    {meta}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-refund-text">
                  {source}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{text}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        {/* Principe n°3 du produit, reformulé — TODO_COPY (hors copy deck). */}
        <Reveal delay={0.4}>
          <p className="mt-10 max-w-2xl border-l-4 border-accent pl-4 font-mono text-xs leading-relaxed text-ink/60">
            Chaque verdict cite sa règle, sa base légale et son calcul complet.
            Rien n&apos;est affirmé qui ne soit traçable.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
