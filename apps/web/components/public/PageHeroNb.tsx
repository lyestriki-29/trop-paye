import type { ReactNode } from "react";

/**
 * En-tête de page publique néubrutaliste (kicker mono + grand titre + lede).
 * À utiliser SOUS le scope `.nb` (via PublicShell). Pendant nb de PageHero.
 */
export function PageHeroNb({
  kicker,
  title,
  lede,
  band,
}: {
  kicker: string;
  title: ReactNode;
  lede: string;
  /** Classe de fond optionnelle (bande de couleur), ex. "bg-violet". Défaut : crème. */
  band?: string;
}) {
  return (
    <section className={`border-b-3 border-nb-ink py-14 sm:py-20 ${band ?? ""}`}>
      <div className="mx-auto max-w-container px-6">
        <p className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
          {kicker}
        </p>
        <h1 className="mt-4 max-w-4xl text-[clamp(36px,6vw,72px)]">{title}</h1>
        <p className="mt-6 max-w-2xl font-nb-body text-lg leading-relaxed text-nb-ink/80">
          {lede}
        </p>
      </div>
    </section>
  );
}
