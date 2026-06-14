import { Reveal } from "@/components/home/Reveal";

/**
 * Pièce n°02 — l'instruction : pipeline réel du moteur (Géoplateforme IGN,
 * ADEME, INSEE, rules-engine), version néubrutaliste (cartes dures numérotées).
 * Sources factuelles (CLAUDE.md) ; intitulés = TODO_COPY (hors copy deck).
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

export function MoteurNb() {
  return (
    <section className="nb-dark border-b-3 border-nb-ink py-16 text-cream sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-cream/45">
            Pièce n°02 · L&apos;instruction
          </p>
          <h2 className="mt-3 max-w-3xl text-[clamp(28px,4.5vw,52px)] text-cream">
            Votre dossier est <span className="nb-mark">instruit</span>, pas estimé.
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PIPELINE.map(({ num, title, source, text, meta }, i) => (
            <Reveal key={num} delay={0.08 + i * 0.08} className="h-full">
              <li className="nb-tilt nb-card flex h-full flex-col p-6">
                <div className="flex items-center justify-between gap-4 border-b-3 border-nb-ink pb-4">
                  <span className="flex h-11 w-11 items-center justify-center border-3 border-nb-ink bg-acid font-nb-display text-lg">
                    {num}
                  </span>
                  <span className="nb-mono text-[10px] uppercase tracking-widest text-nb-ink/55">
                    {meta}
                  </span>
                </div>
                <h3 className="mt-5 text-xl">{title}</h3>
                <p className="mt-1 nb-mono text-xs uppercase tracking-wider text-refund">{source}</p>
                <p className="mt-3 font-nb-body text-sm leading-relaxed text-nb-ink/75">{text}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.4}>
          <p className="mt-10 max-w-2xl border-l-[6px] border-violet bg-paper p-4 nb-mono text-xs leading-relaxed text-nb-ink/70 shadow-nb-sm">
            Chaque verdict cite sa règle, sa base légale et son calcul complet. Rien n&apos;est
            affirmé qui ne soit traçable.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
