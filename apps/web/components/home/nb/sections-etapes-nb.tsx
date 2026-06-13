import type { ComponentType } from "react";
import { formatEUR } from "@troppaye/shared";
import { Reveal } from "@/components/home/Reveal";
import { IconHandCoins, IconPenLine, IconSearch } from "@/components/home/icons";

/**
 * Pièce n°04 — la méthode : les 3 étapes du copy deck §1 (mot pour mot,
 * identiques à la prod), version néubrutaliste (badge rond pivoté + artefact
 * comptable en carte dure). Données témoin P0 (fictives, déjà en prod).
 */

interface Etape {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
  artefact: { label: string; value: string; tone: "ink" | "refund" };
}

const ETAPES: ReadonlyArray<Etape> = [
  {
    Icon: IconSearch,
    title: "Vérifiez",
    text: "Tapez votre adresse. On croise votre loyer avec les données publiques : DPE, indice des loyers, règles de votre ville.",
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
    artefact: { label: "Signé en ligne", value: "10/06/2026", tone: "ink" },
  },
  {
    Icon: IconHandCoins,
    title: "Récupérez",
    text: "On réclame, on relance, on encaisse, on vous reverse. Notre commission : 25 % de ce qu'on récupère. Rien récupéré ? Rien payé.",
    artefact: {
      label: "Reversé au locataire",
      value: `+ ${formatEUR(107_775, { decimals: true })}`,
      tone: "refund",
    },
  },
];

export function EtapesNb() {
  return (
    <section className="border-b-3 border-nb-ink py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
            Pièce n°04 · La méthode
          </p>
          <h2 className="mt-3 text-[clamp(28px,4.5vw,52px)]">
            Comment <span className="nb-mark">ça marche</span>
          </h2>
        </Reveal>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {ETAPES.map(({ Icon, title, text, artefact }, i) => (
            <Reveal key={title} delay={0.08 + i * 0.08} className="h-full">
              <li className="nb-tilt nb-card flex h-full flex-col p-7">
                <div className="flex items-center gap-4">
                  <span className="nb-step-badge">{i + 1}</span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border-3 border-nb-ink bg-accent text-nb-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-5 text-xl">{title}</h3>
                <p className="mt-3 font-nb-body leading-relaxed text-nb-ink/75">{text}</p>
                {/* Artefact comptable — TODO_COPY (vocabulaire document). */}
                <div
                  aria-hidden="true"
                  className="mt-auto border-3 border-nb-ink bg-cream px-5 py-4"
                >
                  <p className="nb-mono text-[10px] uppercase tracking-widest text-nb-ink/55">
                    {artefact.label}
                  </p>
                  <p
                    className={`tabular mt-2 nb-mono text-base font-semibold ${
                      artefact.tone === "refund" ? "text-refund" : "text-nb-ink"
                    }`}
                  >
                    {artefact.value}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.32}>
          <p className="mt-8 nb-mono text-xs text-nb-ink/50">
            Montants d&apos;illustration — données fictives (dossier témoin).
          </p>
        </Reveal>
      </div>
    </section>
  );
}
