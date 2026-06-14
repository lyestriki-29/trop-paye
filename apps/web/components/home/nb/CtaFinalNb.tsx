import { brand } from "@troppaye/shared";
import { HeroAddress } from "@/components/home/HeroAddress";

/**
 * CTA final néubrutaliste réutilisable (bandeau thématisé `nb-band-final` :
 * jaune accent en Vivante, ink en Tempérée/Maximal). À utiliser SOUS `.nb`.
 */
export function CtaFinalNb() {
  return (
    <section className="nb-band-final bg-orange border-t-3 border-nb-ink py-20 sm:py-28">
      <div className="mx-auto max-w-container px-6">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <h2 className="max-w-2xl text-[clamp(32px,5vw,60px)]">{brand.baseline}</h2>
          <span className="nb-tag bg-paper text-nb-ink">0 € d&apos;avance</span>
        </div>
        <div className="mt-10">
          <HeroAddress />
        </div>
        <p className="mt-5 nb-mono text-xs uppercase tracking-wider opacity-70">
          {brand.hero.reassurance.join(" · ")}
        </p>
      </div>
    </section>
  );
}
