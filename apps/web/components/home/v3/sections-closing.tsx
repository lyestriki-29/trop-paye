import Link from "next/link";
import type { ReactNode } from "react";
import { brand } from "@troppaye/shared";
import { HeroAddress } from "@/components/home/HeroAddress";
import { Reveal } from "@/components/home/Reveal";
import { Stamp } from "@/components/ui/Stamp";

/**
 * Pièce n°07 (FAQ, copy deck §1 mot pour mot — mêmes 2 extraits que la prod)
 * + verdict final : CTA pleine largeur `accent` (texte `ink` obligatoire),
 * champ adresse re-câblé, tampon de clôture.
 */

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
        La plupart des dossiers se règlent à l&apos;amiable en 1 à 3 mois. S&apos;il faut
        aller plus loin, nous vous proposons un avocat partenaire — toujours sans frais
        d&apos;avance.
      </>
    ),
  },
];

export function ClosingV3() {
  return (
    <>
      <section className="border-b border-line py-16 sm:py-20">
        <div className="mx-auto max-w-container px-6">
          <Reveal>
            <p aria-hidden className="font-mono text-xs font-medium uppercase tracking-widest text-ink/45">
              Pièce n°07 · Questions fréquentes
            </p>
            {/* TODO_COPY — intitulé de section (hors copy deck, identique prod). */}
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
        </div>
      </section>

      {/* Verdict final — bande accent pleine largeur, plus de carte flottante. */}
      <section className="bg-accent py-16 text-ink sm:py-24">
        <div className="mx-auto max-w-container px-6">
          <Reveal>
            <div className="flex flex-wrap items-start justify-between gap-8">
              <h2 className="max-w-2xl font-display text-2xl font-extrabold leading-tight tracking-display sm:text-[52px]">
                {brand.baseline}
              </h2>
              {/* TODO_COPY — tampon de clôture (vocabulaire document). */}
              <Stamp rotate={6} className="bg-paper/60">
                0 € d&apos;avance
              </Stamp>
            </div>
            <div className="mt-10">
              <HeroAddress />
            </div>
            <p className="mt-5 text-sm font-semibold text-ink/70">
              {brand.hero.reassurance.join(" · ")}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
