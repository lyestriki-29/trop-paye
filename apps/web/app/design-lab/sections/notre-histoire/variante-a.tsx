import { QuittanceStamped } from "@/components/story/QuittanceStamped";
import { notreHistoireCopy as copy } from "@/lib/content/notre-histoire";

/**
 * Variante A — « pièce à conviction » : la quittance occupe tout l'écran
 * d'ouverture, le tampon claque au scroll, le récit ne commence qu'en dessous.
 * Choc documentaire, mobile-first : on montre la preuve avant de raconter.
 */
export function HistoireVarianteA() {
  return (
    <div className="bg-paper">
      <section className="flex min-h-[88vh] flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/55">
            {copy.hero.kicker}
          </p>
          <QuittanceStamped className="mt-6" />
          <h1 className="mt-10 font-display text-3xl font-extrabold leading-tight tracking-display sm:text-[44px]">
            {copy.hero.title}
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-2xl px-6 pb-20">
        <p className="max-w-prose leading-relaxed text-ink/70">{copy.hero.intro}</p>
        <p className="mt-6 max-w-prose leading-relaxed text-ink/70">
          {copy.bascule.paragraphs[0]}
        </p>
      </section>
    </div>
  );
}
