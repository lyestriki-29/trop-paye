import { brand } from "@troppaye/shared";
import { HeroAddress } from "./HeroAddress";
import { Reveal } from "./Reveal";

/** CTA final — fond `accent` (texte `ink` obligatoire), champ adresse re-câblé. */
export function CtaFinal() {
  return (
    <section className="mx-auto max-w-container px-6 pb-24">
      <Reveal>
        <div className="rounded-card bg-accent px-8 py-14 text-ink sm:px-14 sm:py-16">
          <h2 className="max-w-2xl font-display text-2xl font-extrabold leading-tight tracking-display sm:text-[44px]">
            {brand.baseline}
          </h2>
          <div className="mt-9">
            <HeroAddress />
          </div>
          <p className="mt-5 text-sm font-semibold text-ink/70">
            {brand.hero.reassurance.join(" · ")}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
