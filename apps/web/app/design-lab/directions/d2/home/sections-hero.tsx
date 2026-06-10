import Link from "next/link";
import { brand } from "@troppaye/shared";
import { LogoA } from "@/app/design-lab/directions/d2/identite/logos";

/**
 * D2 home — header + hero centré + stat d'appui « 1 sur 6 » en très gros mono.
 * Témoin statique : le champ adresse est visuel, non câblé.
 */

/** Barre adresse pleine largeur (max-w-xl) — réutilisée par le CTA final. */
export function AddressBar({ onInk = false }: { onInk?: boolean }) {
  return (
    <div
      className={`flex w-full max-w-xl items-stretch gap-2 rounded-field border bg-paper p-1.5 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-accent/40 ${
        onInk ? "border-paper/20" : "border-line"
      }`}
    >
      <input
        type="text"
        aria-label="Où habitez-vous ?"
        placeholder="12 rue de la République, Lyon"
        className="min-w-0 flex-1 bg-transparent px-4 text-base text-ink outline-none placeholder:text-ink/40"
      />
      <button
        type="button"
        className="shrink-0 rounded-field bg-refund-text px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-refund-text/90"
      >
        {brand.hero.cta}
      </button>
    </div>
  );
}

export function SectionHeader() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-container items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-baseline gap-4">
          <LogoA className="h-6 w-auto" />
          <span className="hidden text-sm text-ink/60 lg:inline">{brand.baseline}</span>
        </div>
        <Link
          href="#"
          className="rounded-field border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-ink/30 hover:bg-paper-2"
        >
          Se connecter
        </Link>
      </div>
    </header>
  );
}

export function SectionHero() {
  return (
    <section className="bg-paper">
      <div className="mx-auto flex max-w-container flex-col items-center px-6 pb-20 pt-20 text-center md:pt-28">
        <h1 className="max-w-3xl font-display text-2xl font-extrabold tracking-display md:text-hero">
          {brand.hero.title}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink/70">{brand.hero.subtitle}</p>
        <div className="mt-10 flex w-full justify-center">
          <AddressBar />
        </div>
        <p className="mt-4 font-mono text-xs text-ink/60">
          {brand.hero.reassurance.join(" · ")}
        </p>
      </div>

      {/* Stat d'appui — « 1 sur 6 » traité en très gros mono (copy deck, verbatim). */}
      <div className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-container flex-col items-center gap-8 px-6 py-14 md:flex-row md:justify-center md:gap-14">
          <p className="flex items-baseline gap-3 font-mono" aria-hidden>
            <span className="text-hero font-medium tracking-display tabular">1</span>
            <span className="text-lg text-ink/50">sur</span>
            <span className="text-hero font-medium tracking-display tabular">6</span>
          </p>
          <p className="max-w-md text-center text-lg leading-relaxed text-ink/80 md:text-left">
            1 logement loué sur 6 en France a un loyer illégal. Le vôtre ?{" "}
            <a
              href="#"
              className="whitespace-nowrap text-sm text-ink/50 underline underline-offset-2 transition-colors hover:text-ink"
            >
              (lien source)
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
