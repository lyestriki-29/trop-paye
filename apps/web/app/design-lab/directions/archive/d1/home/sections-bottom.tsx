import type { ReactNode } from "react";
import { brand } from "@troppaye/shared";
import { AddressField } from "@/app/design-lab/directions/archive/d1/home/sections-hero";
import { SectionKicker } from "@/app/design-lab/directions/archive/d1/home/sections-process";
import { LogoA } from "@/app/design-lab/directions/archive/d1/identite/logos";

interface DpeRow {
  letter: string;
  width: string;
  frozen?: boolean;
}

const DPE_ROWS: readonly DpeRow[] = [
  { letter: "A", width: "w-12" },
  { letter: "B", width: "w-16" },
  { letter: "C", width: "w-20" },
  { letter: "D", width: "w-24" },
  { letter: "E", width: "w-28" },
  { letter: "F", width: "w-32", frozen: true },
  { letter: "G", width: "w-36", frozen: true },
];

/** FAQ home — 2 extraits sûrs du copy deck, verbatim. */
const FAQ_ITEMS: { q: string; a: ReactNode }[] = [
  {
    q: "Combien ça coûte ?",
    a: (
      <>
        Rien d'avance, jamais. Si nous récupérons de l'argent, notre commission est de 25 % des
        sommes récupérées. Si nous ne récupérons rien, vous ne payez rien. Le barème détaillé
        est{" "}
        <a href="#" className="underline underline-offset-2 transition-colors hover:text-ink">
          ici
        </a>
        .
      </>
    ),
  },
  {
    q: "Combien de temps ça prend ?",
    a: "La plupart des dossiers se règlent à l'amiable en 1 à 3 mois. S'il faut aller plus loin, nous vous proposons un avocat partenaire — toujours sans frais d'avance.",
  },
];

/** Figure DPE façon document : barres A→G, F et G gelées (décoratif). */
function DpeFigure() {
  return (
    <aside aria-hidden="true" className="rounded-card border border-line bg-paper p-6">
      <p className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-ink/55">
        {/* TODO_COPY — libellés de figure (hors copy deck) */}
        <span>Classe DPE</span>
        <span className="text-stamp">Gel des loyers</span>
      </p>
      <ul className="mt-4 space-y-1.5">
        {DPE_ROWS.map((row) => (
          <li key={row.letter} className="flex items-center gap-3">
            <span
              className={`flex h-8 items-center rounded-field border px-3 font-mono text-xs ${row.width} ${
                row.frozen
                  ? "border-stamp bg-stamp/10 font-medium text-stamp"
                  : "border-line bg-paper-2 text-ink/45"
              }`}
            >
              {row.letter}
            </span>
            {row.frozen ? (
              <span className="font-mono text-[10px] uppercase tracking-widest text-stamp">
                Gelé
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function Passoires() {
  return (
    <section className="border-b border-line bg-paper-2/60">
      <div className="mx-auto grid max-w-container gap-10 px-6 py-16 md:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <DpeFigure />
        <div>
          <SectionKicker index="03" />
          <h2 className="mt-4 max-w-[26ch] font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Logement mal isolé ? Votre loyer est gelé depuis 2022.
          </h2>
          <p className="mt-5 max-w-[60ch] leading-relaxed text-ink/70">
            Si votre logement est classé F ou G, la loi interdit toute augmentation de loyer
            depuis le 24 août 2022. Beaucoup de propriétaires l'ignorent — ou font comme si.
            Chaque augmentation appliquée depuis est remboursable.
          </p>
          <a
            href="#"
            className="mt-6 inline-block text-sm font-semibold text-refund-text underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Vérifier mon DPE →
          </a>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <SectionKicker index="04" />
        <h2 className="mt-4 font-display text-xl font-extrabold tracking-display sm:text-2xl">
          FAQ
        </h2>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="grid gap-3 py-7 md:grid-cols-[0.4fr_0.6fr] md:gap-10">
              <dt className="font-display text-lg font-bold tracking-display">{item.q}</dt>
              <dd className="text-sm leading-relaxed text-ink/70">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-container px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl rounded-card border border-line bg-paper px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
            {brand.baseline}
          </h2>
          <div className="mx-auto mt-8 max-w-xl text-left">
            <AddressField id="cta-adresse" />
          </div>
          <p className="mt-4 font-mono text-xs text-ink/55">
            {brand.hero.reassurance.join(" · ")}
          </p>
        </div>
      </div>
    </section>
  );
}

export function D1Footer() {
  return (
    <footer>
      <div className="mx-auto flex max-w-container flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-ink">
          <LogoA className="h-5 w-auto" />
          <span className="border-l border-line pl-3 text-sm text-ink/60">{brand.baseline}</span>
        </div>
        <a
          href="#"
          className="font-mono text-xs text-ink/50 underline-offset-2 transition-colors hover:text-ink hover:underline"
        >
          Mentions légales (squelette)
        </a>
      </div>
    </footer>
  );
}
