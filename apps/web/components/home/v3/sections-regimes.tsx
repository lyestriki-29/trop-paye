import { Reveal } from "@/components/home/Reveal";
import { IconArrowRight } from "@/components/home/icons";
import { Marker } from "@/components/ui/Marker";
import { Stamp } from "@/components/ui/Stamp";

/**
 * Pièce n°03 — les trois régimes DISTINCTS du moteur (séparation juridique
 * non négociable) : gel F/G ≠ bouclier 3,5 % ≠ décence (orientation, JAMAIS
 * chiffrée). Carte gel = copy deck §1 mot pour mot (texte de la prod) ;
 * bouclier + décence = TODO_COPY brouillons factuels, [AVOCAT] avant prod.
 */

export function RegimesV3() {
  return (
    <section className="border-b border-line bg-paper-2 py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="font-mono text-xs font-medium uppercase tracking-widest text-ink/45">
            Pièce n°03 · Les règles
          </p>
          {/* TODO_COPY — intitulé de section (hors copy deck). */}
          <h2 className="mt-2 max-w-2xl font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Trois règles. Trois façons de <Marker>trop payer</Marker>.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Régime 1 — gel F/G : texte prod (copy deck §1), composition densifiée. */}
          <Reveal delay={0.08} className="lg:col-span-2">
            <article className="flex h-full flex-col rounded-card border border-line bg-paper p-8 shadow-lift sm:p-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex gap-3" aria-hidden="true">
                  <span className="flex h-16 w-16 items-center justify-center rounded-card border-2 border-stamp font-display text-2xl font-extrabold text-stamp">
                    F
                  </span>
                  <span className="flex h-16 w-16 items-center justify-center rounded-card bg-stamp font-display text-2xl font-extrabold text-paper">
                    G
                  </span>
                </div>
                <Stamp rotate={4}>Gelé depuis 2022</Stamp>
              </div>
              <h3 className="mt-6 font-display text-xl font-extrabold tracking-display">
                Logement mal isolé ? Votre loyer est gelé depuis 2022.
              </h3>
              <p className="mt-4 max-w-3xl leading-relaxed text-ink/70">
                Si votre logement est classé F ou G, la loi interdit toute augmentation de loyer
                depuis le 24 août 2022. Beaucoup de propriétaires l&apos;ignorent — ou font comme
                si. Chaque augmentation appliquée depuis est remboursable.
              </p>
              <div className="mt-auto pt-7">
                <a
                  href="/diagnostic"
                  className="group inline-flex items-center gap-2 rounded-badge border border-ink/20 bg-paper px-6 py-3 font-display text-base font-bold transition hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                >
                  Vérifier mon DPE
                  <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <p className="mt-6 border-t border-line pt-4 font-mono text-xs leading-relaxed text-ink/55">
                  (Base : loi Climat et résilience, art. 159 —{" "}
                  <a
                    href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957099"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 transition hover:text-ink"
                  >
                    voir le texte
                  </a>
                  )
                </p>
              </div>
            </article>
          </Reveal>

          <div className="grid gap-6">
            {/* Régime 2 — bouclier 3,5 % : TODO_COPY brouillon factuel.
                TODO_VERIFIER : réf. exacte (loi pouvoir d'achat 2022) avant prod. */}
            <Reveal delay={0.16}>
              <article className="flex h-full flex-col rounded-card border border-line bg-paper p-7 shadow-lift">
                <p className="tabular font-display text-2xl font-extrabold tracking-display">
                  +3,5 % max
                </p>
                <h3 className="mt-3 font-display text-lg font-bold">
                  Hausse au-dessus du bouclier ?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  Du 3ᵉ trimestre 2022 au 1ᵉʳ trimestre 2024, aucune révision de loyer ne
                  pouvait dépasser +3,5 % — même hors passoire thermique. L&apos;excédent se
                  réclame.
                </p>
                <p className="mt-auto border-t border-line pt-4 font-mono text-[11px] uppercase tracking-wider text-ink/50">
                  Bouclier d&apos;indexation · T3 2022 → T1 2024
                </p>
              </article>
            </Reveal>

            {/* Régime 3 — décence : orientation judiciaire, JAMAIS chiffrée ici.
                TODO_COPY + TODO_VERIFIER (G : 2025, F : 2028) — [AVOCAT] avant prod. */}
            <Reveal delay={0.24}>
              <article className="flex h-full flex-col rounded-card bg-ink p-7 text-paper">
                <p className="font-mono text-[11px] uppercase tracking-widest text-paper/50">
                  Sans calcul automatique
                </p>
                <h3 className="mt-3 font-display text-lg font-bold">
                  Logement interdit à la location ?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/75">
                  Un G ne peut plus être mis en location depuis 2025, un F dès 2028. Ici, pas
                  de chiffrage : on vous oriente, dossier déjà monté, vers la voie judiciaire.
                </p>
                <p className="mt-auto border-t border-paper/15 pt-4 font-mono text-[11px] uppercase tracking-wider text-paper/50">
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
