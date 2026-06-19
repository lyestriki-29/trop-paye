import { Reveal } from "@/components/home/Reveal";
import { IconArrowRight } from "@/components/home/icons";

/**
 * Pièce n°03 — les trois régimes DISTINCTS (séparation juridique non
 * négociable) : gel F/G ≠ bouclier 3,5 % ≠ décence (orientation, JAMAIS
 * chiffrée). Carte gel = copy deck §1 mot pour mot ; bouclier + décence =
 * TODO_COPY brouillons factuels, [AVOCAT] avant prod. Version néubrutaliste.
 */

export function RegimesNb() {
  return (
    <section className="border-b-3 border-nb-ink py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
            Pièce n°03 · Les règles
          </p>
          <h2 className="mt-3 max-w-3xl text-[clamp(28px,4.5vw,52px)]">
            Trois règles. Trois façons de <span className="nb-mark">trop payer</span>.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Régime 1 — gel F/G : texte prod (copy deck §1). */}
          <Reveal delay={0.08} className="lg:col-span-2">
            <article className="nb-tilt nb-card relative flex h-full flex-col p-8 sm:p-10">
              <span className="nb-sticker nb-sticker--right -right-3 -top-4 bg-acid">
                Gelé depuis 2022
              </span>
              <div className="flex gap-3" aria-hidden="true">
                <span className="flex h-16 w-16 items-center justify-center border-3 border-nb-ink font-nb-display text-2xl text-nb-ink">
                  F
                </span>
                <span className="flex h-16 w-16 items-center justify-center border-3 border-nb-ink bg-nb-ink font-nb-display text-2xl text-cream">
                  G
                </span>
              </div>
              <h3 className="mt-6 text-2xl">
                Logement mal isolé ? Votre loyer est gelé depuis 2022.
              </h3>
              <p className="mt-4 max-w-3xl font-nb-body leading-relaxed text-nb-ink/75">
                Si votre logement est classé F ou G, la loi interdit toute augmentation de loyer
                depuis le 24 août 2022. Beaucoup de propriétaires l&apos;ignorent — ou font comme
                si. Chaque augmentation appliquée depuis est remboursable.
              </p>
              <div className="mt-auto pt-7">
                <a
                  href="/diagnostic"
                  className="nb-card-hover group inline-flex items-center gap-2 border-3 border-nb-ink bg-accent px-6 py-3 font-nb-display text-base uppercase shadow-nb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nb-ink focus-visible:ring-offset-2"
                >
                  Vérifier mon DPE
                  <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <p className="mt-6 border-t-3 border-nb-ink pt-4 nb-mono text-xs leading-relaxed text-nb-ink/60">
                  (Base : loi Climat et résilience, art. 159 —{" "}
                  <a
                    href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957099"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 transition hover:text-nb-ink"
                  >
                    voir le texte
                  </a>
                  )
                </p>
              </div>
            </article>
          </Reveal>

          <div className="grid gap-6">
            {/* Régime 2 — bouclier 3,5 % : TODO_COPY / TODO_VERIFIER avant prod. */}
            <Reveal delay={0.16}>
              <article className="nb-tilt nb-card flex h-full flex-col p-7">
                <p className="tabular font-nb-display text-3xl">+3,5 % max</p>
                <h3 className="mt-3 text-lg">Hausse au-dessus du bouclier ?</h3>
                <p className="mt-3 font-nb-body text-sm leading-relaxed text-nb-ink/75">
                  Du 3ᵉ trimestre 2022 au 1ᵉʳ trimestre 2024, aucune révision de loyer ne pouvait
                  dépasser +3,5 % — même hors passoire thermique. L&apos;excédent se réclame.
                </p>
                <p className="mt-auto border-t-3 border-nb-ink pt-4 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/55">
                  Bouclier d&apos;indexation · T3 2022 → T1 2024
                </p>
              </article>
            </Reveal>

            {/* Régime 3 — décence : orientation judiciaire, JAMAIS chiffrée. */}
            <Reveal delay={0.24}>
              <article className="nb-dark flex h-full flex-col border-3 border-nb-ink p-7 text-cream shadow-nb">
                <p className="nb-mono text-[11px] uppercase tracking-widest text-cream/55">
                  Sans calcul automatique
                </p>
                <h3 className="mt-3 text-lg text-cream">Logement interdit à la location ?</h3>
                <p className="mt-3 font-nb-body text-sm leading-relaxed text-cream/80">
                  Un G ne peut plus être mis en location depuis 2025, un F dès 2028. Ici, pas de
                  chiffrage : on vous oriente, dossier déjà monté, vers la voie judiciaire.
                </p>
                <p className="mt-auto border-t border-cream/20 pt-4 nb-mono text-[11px] uppercase tracking-wider text-cream/55">
                  Orientation · avocat partenaire
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
