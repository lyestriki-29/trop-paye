import type { ComponentType } from "react";
import { formatEUR } from "@troppaye/shared";
import { Reveal } from "@/components/home/Reveal";
import { IconHandCoins, IconPenLine, IconSearch } from "@/components/home/icons";
import { Marker } from "@/components/ui/Marker";

/**
 * Pièce n°04 — la méthode : les 3 étapes du copy deck §1 (textes mot pour mot,
 * identiques à la prod) recomposées en rangées éditoriales denses — numéro
 * géant au trait, artefact comptable compact par étape (données témoin P0,
 * fictives, déjà utilisées en prod).
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
    // Témoin P0 : différence mensuelle détectée (fictif, déjà en prod).
    artefact: { label: "Différence détectée", value: `${formatEUR(7_185, { decimals: true })} / mois`, tone: "ink" },
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
    // 75 % du témoin 1 437,00 € (fictif, déjà en prod).
    artefact: { label: "Reversé au locataire", value: `+ ${formatEUR(107_775, { decimals: true })}`, tone: "refund" },
  },
];

export function EtapesV3() {
  return (
    <section id="comment-ca-marche" className="scroll-mt-6 border-b border-line py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="font-mono text-xs font-medium uppercase tracking-widest text-ink/45">
            Pièce n°04 · La méthode
          </p>
          <h2 className="mt-2 font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Comment <Marker>ça marche</Marker>
          </h2>
        </Reveal>

        <ol className="mt-6">
          {ETAPES.map(({ Icon, title, text, artefact }, i) => (
            <Reveal key={title} delay={0.08 + i * 0.08}>
              <li className="relative grid items-center gap-x-10 gap-y-6 border-b border-line py-10 sm:grid-cols-[auto_1fr_auto]">
                {/* Numéro de pièce géant au trait — décoratif. */}
                <span
                  aria-hidden
                  className="v3-outline select-none font-display text-[88px] font-extrabold leading-none tracking-display sm:text-[120px]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-badge bg-accent text-ink">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-lg font-bold sm:text-xl">{title}</h3>
                  </div>
                  <p className="mt-4 leading-relaxed text-ink/70">{text}</p>
                </div>
                {/* Artefact comptable compact — TODO_COPY (vocabulaire document). */}
                <div
                  aria-hidden="true"
                  className="w-full rounded-card border border-line bg-paper px-5 py-4 shadow-sm sm:w-56"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                    {artefact.label}
                  </p>
                  <p
                    className={`tabular mt-2 font-mono text-base font-medium ${
                      artefact.tone === "refund" ? "text-refund-text" : "text-ink"
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
          <p className="mt-8 font-mono text-xs text-ink/45">
            Montants d&apos;illustration — données fictives (dossier témoin).
          </p>
        </Reveal>
      </div>
    </section>
  );
}
