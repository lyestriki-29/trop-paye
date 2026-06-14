import type { ComponentType } from "react";
import { formatEUR } from "@troppaye/shared";
import { Reveal } from "@/components/home/Reveal";
import { IconHandCoins, IconPenLine, IconSearch } from "@/components/home/icons";

/**
 * Parcours détaillé (page « Comment ça marche ») — version explicite des 3 étapes
 * du copy deck §1. Le `text` de chaque étape reste VERBATIM ; les lignes « Vous » /
 * « Nous » sont des clarifications TODO_COPY (qui fait quoi). Layout vertical aéré,
 * plus lisible que les 3 cartes condensées de la home.
 */

interface Etape {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
  vous: string;
  nous: string;
  artefact: { label: string; value: string; tone: "ink" | "refund" };
}

const ETAPES: ReadonlyArray<Etape> = [
  {
    Icon: IconSearch,
    title: "Vérifiez",
    text: "Tapez votre adresse. On croise votre loyer avec les données publiques : DPE, indice des loyers, règles de votre ville.",
    vous: "Votre adresse et votre loyer actuel. 2 minutes, gratuit, sans engagement.",
    nous: "On interroge les bases officielles (géocodage IGN, DPE de l'ADEME, indice INSEE) et on calcule l'écart avec le loyer légal.",
    artefact: {
      label: "Différence détectée",
      value: `${formatEUR(7_185, { decimals: true })} / mois`,
      tone: "ink",
    },
  },
  {
    Icon: IconPenLine,
    title: "Mandatez-nous",
    text: "Une signature en ligne, vos quittances, et c'est tout. Vous ne parlerez jamais loyer avec votre propriétaire — nous, si.",
    vous: "Une signature électronique et vos quittances. Rien d'autre à faire.",
    nous: "On monte le dossier (règle citée, base légale, calcul détaillé) et on vous représente face au bailleur.",
    artefact: { label: "Mandat signé en ligne", value: "10/06/2026", tone: "ink" },
  },
  {
    Icon: IconHandCoins,
    title: "Récupérez",
    text: "On réclame, on relance, on encaisse, on vous reverse. Notre commission : 25 % de ce qu'on récupère. Rien récupéré ? Rien payé.",
    vous: "Vous suivez l'avancement depuis votre espace et vous touchez le trop-perçu.",
    nous: "On réclame à l'amiable, on relance, et si besoin on vous oriente vers un avocat partenaire. 0 € d'avance.",
    artefact: {
      label: "Reversé au locataire",
      value: `+ ${formatEUR(107_775, { decimals: true })}`,
      tone: "refund",
    },
  },
];

export function ParcoursNb() {
  return (
    <section className="border-b-3 border-nb-ink py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <div className="grid gap-x-12 gap-y-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
                Le parcours · 3 étapes
              </p>
              <h2 className="mt-3 text-[clamp(28px,4.5vw,52px)]">
                De votre adresse au <span className="nb-mark">virement</span>.
              </h2>
            </div>
            <p className="max-w-xl font-nb-body text-xl font-medium leading-relaxed text-nb-ink/90">
              Vous faites le minimum : votre adresse, votre loyer, une signature. On s&apos;occupe
              du reste, et vous ne parlez jamais d&apos;argent avec votre propriétaire.
            </p>
          </div>
        </Reveal>

        <ol className="mt-12 space-y-6">
          {ETAPES.map(({ Icon, title, text, vous, nous, artefact }, i) => (
            <Reveal key={title} delay={0.06 + i * 0.08}>
              <li className="nb-tilt nb-card grid gap-7 p-7 sm:p-9 lg:grid-cols-[auto_1.4fr_1fr] lg:items-center">
                {/* Repère étape : gros numéro + icône */}
                <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
                  <span className="tabular font-nb-display text-[clamp(44px,6vw,72px)] leading-none text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center border-3 border-nb-ink bg-accent text-nb-ink">
                    <Icon className="h-6 w-6" />
                  </span>
                </div>

                {/* Le quoi (verbatim copy deck) */}
                <div>
                  <h3 className="text-2xl">{title}</h3>
                  <p className="mt-3 font-nb-body leading-relaxed text-nb-ink/80">{text}</p>
                </div>

                {/* Le qui-fait-quoi + artefact */}
                <div className="flex flex-col gap-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div className="border-l-3 border-nb-ink pl-3">
                      <p className="nb-mono text-[10px] font-semibold uppercase tracking-widest text-nb-ink/55">
                        Vous
                      </p>
                      <p className="mt-1 font-nb-body text-sm leading-snug text-nb-ink/80">{vous}</p>
                    </div>
                    <div className="border-l-3 border-accent pl-3">
                      <p className="nb-mono text-[10px] font-semibold uppercase tracking-widest text-nb-ink/55">
                        TropPayé
                      </p>
                      <p className="mt-1 font-nb-body text-sm leading-snug text-nb-ink/80">{nous}</p>
                    </div>
                  </div>
                  <div
                    aria-hidden="true"
                    className="flex items-baseline justify-between gap-3 border-3 border-nb-ink bg-cream px-4 py-3"
                  >
                    <span className="nb-mono text-[10px] uppercase tracking-widest text-nb-ink/55">
                      {artefact.label}
                    </span>
                    <span
                      className={`tabular nb-mono text-base font-semibold ${
                        artefact.tone === "refund" ? "text-refund" : "text-nb-ink"
                      }`}
                    >
                      {artefact.value}
                    </span>
                  </div>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.3}>
          <p className="mt-8 nb-mono text-xs text-nb-ink/50">Montants d&apos;illustration.</p>
        </Reveal>
      </div>
    </section>
  );
}
