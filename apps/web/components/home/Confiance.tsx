import type { PublicStats } from "@/lib/public-stats";
import { CompteurPublic } from "./CompteurPublic";
import { Reveal } from "./Reveal";

/**
 * Section confiance (copy deck §1, mot pour mot). Compteur public RÉEL :
 * `stats === null` (aucun chiffre ou lecture impossible) → le bloc se rend
 * SANS la ligne compteur — jamais de chiffre inventé ni de placeholder.
 */
export function Confiance({ stats }: { stats: PublicStats | null }) {
  return (
    <section id="resultats" className="mx-auto max-w-container scroll-mt-6 px-6 py-16 sm:py-20">
      <Reveal>
        <div className="rounded-card bg-ink px-8 py-12 text-paper sm:px-14 sm:py-16">
          <p aria-hidden className="font-mono text-xs font-medium tracking-widest text-paper/40">
            02
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Nous faisons appliquer la loi. Rien de plus.
          </h2>
          <p className="mt-6 max-w-3xl leading-relaxed text-paper/75">
            Le gel des loyers des passoires thermiques, l&apos;indice de référence des loyers, les
            délais de restitution du dépôt de garantie : ce sont vos droits, écrits dans la loi.
            TropPayé les fait simplement respecter. Chaque calcul cite sa source. Chaque euro est
            tracé sur un compte dédié. Vos données restent en France.
          </p>
          {stats ? (
            <div className="mt-10 border-t border-paper/15 pt-8">
              <CompteurPublic
                recoveredCents={stats.recoveredCents}
                inProgressCount={stats.inProgressCount}
              />
            </div>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}
