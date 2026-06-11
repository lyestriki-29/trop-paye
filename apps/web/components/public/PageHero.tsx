import type { ReactNode } from "react";
import { Reveal } from "@/components/home/Reveal";

/**
 * En-tête de page vitrine (premium v2.1) : kicker mono, titre éditorial géant
 * (text-mega), chapeau. Unifie le niveau typographique de toutes les pages
 * publiques — le « waouh » vient de l'échelle, pas d'effets gratuits.
 */
export function PageHero({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  /** Titre — passer un <Marker> sur le mot clé si pertinent. */
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mx-auto max-w-container px-6 pb-10 pt-14 sm:pt-20">
      <Reveal>
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-ink/45">
          {kicker}
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-mega font-extrabold tracking-display">
          {title}
        </h1>
        {lede ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70">{lede}</p>
        ) : null}
        {children}
      </Reveal>
    </header>
  );
}
