import type { ReactNode } from "react";
import { brand } from "@troppaye/shared";
import { PastilleTP } from "@/app/design-lab/directions/d3/identite/logos";
import { AddressField, Marker } from "./sections-hero";
import { IconArrowRight } from "./sections-steps";

export function PassoiresD3() {
  return (
    <section className="mx-auto max-w-container px-6">
      <div className="grid gap-10 rounded-card border border-line bg-paper-2 p-8 sm:p-12 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-14">
        <div className="flex gap-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-card border-2 border-stamp font-display text-2xl font-extrabold text-stamp">
            F
          </span>
          <span className="flex h-16 w-16 items-center justify-center rounded-card bg-stamp font-display text-2xl font-extrabold text-paper">
            G
          </span>
        </div>
        <div>
          <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Logement mal isolé ? Votre loyer est <Marker>gelé</Marker> depuis 2022.
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-ink/70">
            Si votre logement est classé F ou G, la loi interdit toute augmentation de loyer
            depuis le 24 août 2022. Beaucoup de propriétaires l&apos;ignorent — ou font comme
            si. Chaque augmentation appliquée depuis est remboursable.
          </p>
          <button
            type="button"
            className="group mt-7 inline-flex items-center gap-2 rounded-badge border border-ink/20 bg-paper px-6 py-3 font-display text-base font-bold transition hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-md"
          >
            Vérifier mon DPE
            <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}

/** FAQ home — 2 extraits sûrs du copy deck, verbatim (« ici » = lien du deck). */
const FAQ: ReadonlyArray<{ q: string; a: ReactNode }> = [
  {
    q: "Combien ça coûte ?",
    a: (
      <>
        Rien d&apos;avance, jamais. Si nous récupérons de l&apos;argent, notre commission est
        de 25 % des sommes récupérées. Si nous ne récupérons rien, vous ne payez rien. Le
        barème détaillé est{" "}
        <span className="font-medium text-refund-text underline underline-offset-2">ici</span>.
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

export function FaqD3() {
  return (
    <section className="mx-auto max-w-container px-6 py-20 sm:py-24">
      {/* TODO_COPY : intitulé de section non couvert par le copy deck. */}
      <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
        Questions fréquentes
      </h2>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FAQ.map(({ q, a }) => (
          <article key={q} className="rounded-card border border-line bg-paper p-8 shadow-sm">
            <h3 className="font-display text-lg font-bold">{q}</h3>
            <p className="mt-3 leading-relaxed text-ink/70">{a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CtaFinalD3() {
  return (
    <section className="mx-auto max-w-container px-6 pb-24">
      <div className="rounded-card bg-accent px-8 py-14 text-ink sm:px-14 sm:py-16">
        <h2 className="max-w-2xl font-display text-2xl font-extrabold leading-tight tracking-display sm:text-[44px]">
          {brand.baseline}
        </h2>
        <div className="mt-9">
          <AddressField id="adresse-cta" />
        </div>
        <p className="mt-5 text-sm font-semibold text-ink/70">
          {brand.hero.reassurance.join(" · ")}
        </p>
      </div>
    </section>
  );
}

export function FooterD3() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-container flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PastilleTP className="h-7 w-7" />
          <p className="text-sm text-ink/60">{brand.baseline}</p>
        </div>
        <button
          type="button"
          className="text-left text-sm text-ink/50 underline underline-offset-2 transition hover:text-ink"
        >
          Mentions légales (squelette)
        </button>
      </div>
    </footer>
  );
}
