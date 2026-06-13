import Link from "next/link";
import type { ReactNode } from "react";
import { brand, formatEUR } from "@troppaye/shared";
import { HeroAddress } from "@/components/home/HeroAddress";
import { Reveal } from "@/components/home/Reveal";

/**
 * Cas n°0 (le fondateur) + FAQ (copy deck §1 mot pour mot, mêmes 2 extraits
 * que la prod) + verdict final néubrutaliste : bande pleine largeur, champ
 * adresse re-câblé. Version DA publique scopée `.nb`.
 */

/* Chiffres RÉELS du fondateur (Lyes), validés le 2026-06-13. */
const CAS_ZERO: ReadonlyArray<{ value: string; label: string; tone: "refund" | "ink" }> = [
  { value: formatEUR(490_000), label: "récupérés sur les loyers trop-perçus", tone: "refund" },
  { value: `− ${formatEUR(23_400)} / mois`, label: "de loyer en moins, pour de bon", tone: "refund" },
  { value: "Préavis allégé", label: "le logement étant non décent", tone: "ink" },
];

function CasZeroNb() {
  return (
    <section className="nb-band-caszero border-b-3 border-nb-ink py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/60">
            Cas n°0 · le fondateur
          </p>
          <h2 className="mt-3 max-w-3xl text-[clamp(28px,4.5vw,52px)]">
            Tout a commencé par <span className="nb-mark">mon propre loyer</span>.
          </h2>
          <p className="mt-5 max-w-2xl font-nb-body text-lg leading-relaxed text-nb-ink/80">
            Logement classé F, complément de loyer abusif. En faisant valoir mes droits, j&apos;ai
            récupéré le trop-perçu, fait baisser mon loyer et allégé mon préavis. TropPayé existe
            pour que ce soit simple pour vous aussi.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {CAS_ZERO.map(({ value, label, tone }, i) => (
            <Reveal key={label} delay={0.1 + i * 0.08}>
              <div className="nb-card h-full p-6">
                <p
                  className={`tabular font-nb-display text-2xl sm:text-3xl ${
                    tone === "refund" ? "text-refund" : "text-nb-ink"
                  }`}
                >
                  {value}
                </p>
                <p className="mt-3 font-nb-body text-sm leading-relaxed text-nb-ink/75">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <Link
            href="/notre-histoire"
            className="nb-card-hover mt-10 inline-flex items-center gap-2 border-3 border-nb-ink bg-paper px-6 py-3 font-nb-display text-base uppercase shadow-nb"
          >
            Lire notre histoire
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

const FAQ: ReadonlyArray<{ q: string; a: ReactNode }> = [
  {
    q: "Combien ça coûte ?",
    a: (
      <>
        Rien d&apos;avance, jamais. Si nous récupérons de l&apos;argent, notre commission est de
        25 % des sommes récupérées. Si nous ne récupérons rien, vous ne payez rien. Le barème
        détaillé est{" "}
        <Link
          href="/comment-ca-marche#bareme"
          className="font-semibold text-refund underline underline-offset-2"
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
        La plupart des dossiers se règlent à l&apos;amiable en 1 à 3 mois. S&apos;il faut aller plus
        loin, nous vous aidons à saisir un avocat, toujours sans frais d&apos;avance de notre part.
      </>
    ),
  },
];

function FaqNb() {
  return (
    <section className="border-b-3 border-nb-ink py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
            Pièce n°07 · Questions fréquentes
          </p>
          <h2 className="mt-3 text-[clamp(28px,4.5vw,52px)]">Questions fréquentes</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {FAQ.map(({ q, a }, i) => (
            <Reveal key={q} delay={0.1 + i * 0.08} className="h-full">
              <details className="nb-card group h-full p-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 font-nb-display text-lg uppercase [&::-webkit-details-marker]:hidden">
                  {q}
                  <span
                    aria-hidden
                    className="font-nb-display text-2xl leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="border-t-3 border-nb-ink p-6 font-nb-body leading-relaxed text-nb-ink/80">
                  {a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function VerdictFinalNb() {
  return (
    // Bandeau final thématisé : jaune accent (douce) ou ink sombre (tempérée/édito).
    <section className="nb-band-final border-t-3 border-nb-ink py-16 sm:py-24">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <div className="flex flex-wrap items-start justify-between gap-8">
            <h2 className="max-w-2xl text-[clamp(32px,5vw,60px)]">{brand.baseline}</h2>
            <span className="nb-tag bg-paper text-nb-ink">0 € d&apos;avance</span>
          </div>
          <div className="mt-10">
            <HeroAddress />
          </div>
          <p className="mt-5 nb-mono text-xs uppercase tracking-wider opacity-70">
            {brand.hero.reassurance.join(" · ")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function ClosingNb() {
  return (
    <>
      <CasZeroNb />
      <FaqNb />
      <VerdictFinalNb />
    </>
  );
}
