import { formatEUR } from "@troppaye/shared";
import { CompteurPublic } from "@/components/home/CompteurPublic";
import { Reveal } from "@/components/home/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { TEMOIGNAGES } from "@/lib/content/temoignages";
import type { PublicStats } from "@/lib/public-stats";

/**
 * Pièces n°05 et n°06 — confiance (copy deck §1 mot pour mot, compteur public
 * RÉEL ou rien) et témoignage Kilian (réel, [AVOCAT] accord écrit avant
 * diffusion). Version néubrutaliste : bande sombre + reçu en carte dure.
 */

export function ConfianceNb({ stats }: { stats: PublicStats | null }) {
  return (
    <section className="border-b-3 border-nb-ink bg-acid py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
            Pièce n°05 · La confiance
          </p>
          <h2 className="mt-3 max-w-3xl text-[clamp(28px,4.5vw,52px)] text-nb-ink">
            Nous faisons appliquer la loi. Rien de plus.
          </h2>
          <p className="mt-6 max-w-3xl font-nb-body leading-relaxed text-nb-ink/80">
            Le gel des loyers des passoires thermiques, l&apos;indice de référence des loyers, les
            délais de restitution du dépôt de garantie : ce sont vos droits, écrits dans la loi.
            TropPayé les fait simplement respecter. Chaque calcul cite sa source. Chaque euro est
            tracé sur un compte dédié. Vos données restent en France.
          </p>
        </Reveal>
        {stats ? (
          <Reveal delay={0.16}>
            <div className="mt-10 border-t border-nb-ink/20 pt-8">
              <CompteurPublic
                recoveredCents={stats.recoveredCents}
                inProgressCount={stats.inProgressCount}
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export function TemoignageNb() {
  const t = TEMOIGNAGES[0];
  if (!t) return null;

  return (
    <section id="preuve" className="scroll-mt-24 border-b-3 border-nb-ink py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
            Pièce n°06 · La preuve
          </p>
          <h2 className="mt-3 text-[clamp(28px,4.5vw,52px)]">
            Ils ont <span className="nb-mark nb-mark--refund">récupéré</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <Reveal delay={0.08}>
            <figure className="relative">
              <span
                aria-hidden
                className="absolute -left-2 -top-12 select-none font-nb-display text-[120px] leading-none text-acid"
              >
                “
              </span>
              <blockquote className="relative font-nb-display text-2xl uppercase leading-tight sm:text-3xl">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex flex-wrap items-center gap-4">
                <span className="nb-mono text-sm uppercase tracking-widest text-nb-ink/60">
                  {t.prenom} · {t.contexte}
                </span>
                <span className="nb-tag bg-refund text-paper">Dossier clos</span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="nb-tilt nb-card relative p-6 sm:p-7">
              <span className="nb-sticker -left-3 -top-4 z-10">Reçu</span>
              <div className="nb-mono text-[11px] uppercase tracking-widest text-nb-ink/55">
                Reçu de reversement — {t.prenom}
              </div>
              <dl className="mt-5 space-y-2.5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-nb-body text-sm text-nb-ink/75">Loyer payé</dt>
                  <dd className="tabular nb-mono text-sm">{formatEUR(t.loyerCents)} / mois</dd>
                </div>
                {t.lignes.map((l) => (
                  <div key={l.label} className="flex items-baseline justify-between gap-4">
                    <dt className="font-nb-body text-sm text-nb-ink/75">{l.label}</dt>
                    <dd className="tabular nb-mono text-sm">{l.text}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex items-end justify-between border-t-3 border-nb-ink pt-4">
                <span className="font-nb-display text-sm uppercase">Reversé au locataire</span>
                <span className="tabular nb-mono text-2xl font-semibold text-refund">
                  <CountUp cents={t.recupereCents} />
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
