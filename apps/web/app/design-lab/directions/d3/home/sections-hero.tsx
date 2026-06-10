import type { ReactNode } from "react";
import Link from "next/link";
import { brand, formatEUR } from "@troppaye/shared";
import { LogoA, PastilleTP } from "@/app/design-lab/directions/d3/identite/logos";

/** Scénario témoin (mêmes chiffres que l'écran verdict — données fictives). */
const DEMO_TOTAL_CENTS = 143700;
const DEMO_MONTHLY_CENTS = 7200;

/** Surligneur signature D3 : trait `accent` sous le mot (hauteur en em → suit le corps). */
export function Marker({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-[0.02em] h-[0.42em] rounded-badge bg-accent"
      />
      <span className="relative">{children}</span>
    </span>
  );
}

/** Champ adresse témoin (non câblé) — pilule XL, libellé d'aide du copy deck. */
export function AddressField({ id }: { id: string }) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-2 sm:rounded-badge sm:border sm:border-line sm:bg-paper sm:p-2 sm:shadow-sm">
      <label htmlFor={id} className="sr-only">
        Où habitez-vous ?
      </label>
      <input
        id={id}
        type="text"
        placeholder="12 rue de la République, Lyon"
        className="w-full rounded-badge border border-line bg-paper px-6 py-4 text-base placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent sm:border-0 sm:bg-transparent sm:py-3"
      />
      <button
        type="button"
        className="shrink-0 rounded-badge bg-ink px-7 py-4 font-display text-base font-bold text-paper shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:py-3"
      >
        {brand.hero.cta}
      </button>
    </div>
  );
}

export function HeaderD3() {
  return (
    <header className="border-b border-line/70 bg-paper">
      <div className="mx-auto flex max-w-container items-center justify-between gap-6 px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/design-lab/directions/d3/home" aria-label={`${brand.name} — accueil`}>
            <LogoA className="h-7 w-auto" />
          </Link>
          <span className="hidden border-l border-line pl-4 text-sm text-ink/55 md:inline">
            {brand.baseline}
          </span>
        </div>
        <button
          type="button"
          className="rounded-badge border border-line bg-paper px-5 py-2.5 text-sm font-semibold transition hover:border-ink/30 hover:shadow-sm"
        >
          Se connecter
        </button>
      </div>
    </header>
  );
}

export function HeroD3() {
  return (
    <section className="mx-auto grid max-w-container items-center gap-14 px-6 pb-24 pt-14 sm:pt-20 lg:grid-cols-[7fr_5fr]">
      <div>
        <h1 className="font-display text-2xl font-extrabold leading-[1.05] tracking-display sm:text-hero">
          {/* brand.hero.title, mot pour mot — surligneur sur « trop payer ». */}
          Marre de{" "}
          <span className="whitespace-nowrap">
            <Marker>trop payer</Marker> ?
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
          {brand.hero.subtitle}
        </p>
        <div className="mt-9">
          <AddressField id="adresse-hero" />
        </div>
        <p className="mt-4 text-sm font-medium text-ink/55">
          {brand.hero.reassurance.join(" · ")}
        </p>
        <p className="mt-10 max-w-xl border-l-4 border-accent pl-4 text-sm font-medium leading-relaxed text-ink/80">
          1 logement loué sur 6 en France a un loyer illégal. Le vôtre ?{" "}
          <span className="text-ink/45 underline underline-offset-2">(lien source)</span>
        </p>
      </div>

      <aside className="mx-auto w-full max-w-sm lg:mx-0">
        <div className="rotate-1 rounded-card border border-line bg-paper p-7 shadow-xl transition duration-300 hover:rotate-0">
          <div className="flex items-center gap-3">
            <PastilleTP className="h-9 w-9" />
            <p className="text-sm font-semibold text-ink/60">Votre estimation est prête</p>
          </div>
          <p className="mt-6 font-display text-xl font-extrabold tracking-display">
            Vous avez trop payé.
          </p>
          <p className="mt-4 font-mono text-2xl font-medium text-refund-text tabular">
            <Marker>{formatEUR(DEMO_TOTAL_CENTS, { decimals: true })}</Marker>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">
            récupérables ·{" "}
            <span className="font-mono tabular">+ {formatEUR(DEMO_MONTHLY_CENTS)}</span>/mois
            d&apos;économie à venir
          </p>
          <button
            type="button"
            className="mt-7 w-full rounded-badge bg-ink px-6 py-3.5 font-display text-base font-bold text-paper transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Récupérer mes <span className="font-mono tabular">{formatEUR(DEMO_TOTAL_CENTS)}</span>
          </button>
        </div>
        {/* TODO_COPY : légende interne du témoin, hors copy deck. */}
        <p className="mt-3 text-center text-xs text-ink/45">
          Exemple de verdict — données fictives
        </p>
      </aside>
    </section>
  );
}
