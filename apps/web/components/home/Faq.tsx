import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";

/** FAQ home — 2 extraits sûrs du copy deck §1, mot pour mot. */
const FAQ: ReadonlyArray<{ q: string; a: ReactNode }> = [
  {
    q: "Combien ça coûte ?",
    a: (
      <>
        Rien d&apos;avance, jamais. Si nous récupérons de l&apos;argent, notre commission est
        de 25 % des sommes récupérées. Si nous ne récupérons rien, vous ne payez rien. Le
        barème détaillé est{" "}
        <Link
          href="/comment-ca-marche#bareme"
          className="font-medium text-refund-text underline underline-offset-2"
        >
          ici
        </Link>
        .
      </>
    ),
  },
  {
    q: "Combien de temps ça prend ?",
    a: (
      <>
        {/* Décision Lyes 2026-06-11 : formulation VRAIE tant qu'aucune convention
            d'avocat partenaire n'est signée (anti-L121-2). Deck à amender. */}
        La plupart des dossiers se règlent à l&apos;amiable en 1 à 3 mois. S&apos;il faut
        aller plus loin, nous vous aidons à saisir un avocat, toujours sans frais
        d&apos;avance de notre part.
      </>
    ),
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-container px-6 py-16 sm:py-20">
      <Reveal>
        <p aria-hidden className="font-mono text-xs font-medium tracking-widest text-ink/45">
          05
        </p>
        {/* TODO_COPY : intitulé de section non couvert par le copy deck. */}
        <h2 className="mt-2 font-display text-xl font-extrabold tracking-display sm:text-2xl">
          Questions fréquentes
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FAQ.map(({ q, a }, i) => (
          <Reveal key={q} delay={0.1 + i * 0.08} className="h-full">
            <article className="h-full rounded-card border border-line bg-paper p-8 shadow-sm">
              <h3 className="font-display text-lg font-bold">{q}</h3>
              <p className="mt-3 leading-relaxed text-ink/70">{a}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
