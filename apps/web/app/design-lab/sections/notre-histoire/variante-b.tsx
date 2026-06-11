import { QuittanceStamped } from "@/components/story/QuittanceStamped";
import { notreHistoireCopy as copy } from "@/lib/content/notre-histoire";

/**
 * Variante B — « salle d'instruction » : split-screen desktop, la quittance
 * reste figée (sticky) à gauche pendant que le récit défile à droite.
 * Lecture longue, immersion : la preuve reste sous les yeux du lecteur.
 * En mobile, retombe naturellement en pile (quittance puis récit).
 */
export function HistoireVarianteB() {
  return (
    <div className="bg-paper">
      <div className="mx-auto grid max-w-container gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/55">
            {copy.hero.kicker}
          </p>
          <QuittanceStamped className="mt-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-display sm:text-[40px]">
            {copy.hero.title}
          </h1>
          <p className="mt-5 max-w-prose leading-relaxed text-ink/70">{copy.hero.intro}</p>
          {[...copy.duo.founder.paragraphs, ...copy.bascule.paragraphs].map((p, i) => (
            <p key={i} className="mt-5 max-w-prose leading-relaxed text-ink/70">
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
