import Link from "next/link";
import type { ReactNode } from "react";
import { formatEUR } from "@troppaye/shared";
import { Reveal } from "@/components/home/Reveal";
import { CtaFinalNb } from "@/components/home/nb/CtaFinalNb";

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

export function CasZeroNb() {
  return (
    <section className="nb-band-caszero border-b-3 border-nb-ink py-12 sm:py-14">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <div className="grid gap-x-12 gap-y-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/60">
                Cas n°0 · le fondateur
              </p>
              <h2 className="mt-3 text-[clamp(28px,4.5vw,52px)]">
                Tout a commencé par <span className="nb-mark">mon propre loyer</span>.
              </h2>
            </div>
            <p className="max-w-xl font-nb-body text-lg leading-relaxed text-nb-ink/80 lg:pb-2">
              Logement classé F, complément de loyer abusif. En faisant valoir mes droits, j&apos;ai
              récupéré le trop-perçu, fait baisser mon loyer et allégé mon préavis. TropPayé existe
              pour que ce soit simple pour vous aussi.
            </p>
          </div>
        </Reveal>
        <div className="mt-7 grid gap-6 sm:grid-cols-3">
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
            className="nb-card-hover mt-7 inline-flex items-center gap-2 border-3 border-nb-ink bg-paper px-6 py-3 font-nb-display text-base uppercase shadow-nb"
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
  // Questions ci-dessous : brouillons TODO_COPY (formulation juridique à valider [AVOCAT]).
  {
    q: "Comment vérifiez-vous mon loyer ?",
    a: (
      <>
        Nous n&apos;estimons rien : votre dossier est <strong>instruit</strong> à partir de données
        officielles. L&apos;adresse via le géocodage de l&apos;État (Géoplateforme IGN), le DPE
        réellement enregistré à l&apos;ADEME, et l&apos;indice de référence des loyers de
        l&apos;INSEE. À l&apos;arrivée, chaque verdict cite sa règle, sa base légale et son calcul,
        ligne à ligne.
      </>
    ),
  },
  {
    q: "Sur quelle loi vous appuyez-vous ?",
    a: (
      <>
        Uniquement sur des droits déjà inscrits dans la loi, jamais sur une interprétation maison.
        Trois régimes distincts : le gel des loyers des passoires F/G, le bouclier
        d&apos;indexation +3,5 % (T3 2022 → T1 2024) et l&apos;encadrement par l&apos;indice de
        référence des loyers. Chaque calcul renvoie au texte applicable à la date de votre bail.
      </>
    ),
  },
  {
    q: "Mes données sont-elles protégées ?",
    a: (
      <>
        Oui. Tout est hébergé en France, les pièces sensibles sont chiffrées, et chaque euro
        récupéré transite par un <strong>compte dédié</strong> et tracé. Vous pouvez demander la
        suppression de vos données à tout moment.
      </>
    ),
  },
  {
    q: "Et si mes informations sont incertaines ?",
    a: (
      <>
        Chaque verdict porte un <strong>score de confiance</strong> (élevé, moyen ou faible).
        S&apos;il manque une donnée, nous vous le signalons et consolidons le dossier avant toute
        démarche. Rien n&apos;est affirmé qui ne soit traçable.
      </>
    ),
  },
];

function FaqNb() {
  return (
    <section className="border-b-3 border-nb-ink py-12 sm:py-14">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
            Pièce n°05 · Questions fréquentes
          </p>
          <h2 className="mt-3 text-[clamp(28px,4.5vw,52px)]">Questions fréquentes</h2>
        </Reveal>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
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

export function ClosingNb() {
  return (
    <>
      <FaqNb />
      <CtaFinalNb />
    </>
  );
}
