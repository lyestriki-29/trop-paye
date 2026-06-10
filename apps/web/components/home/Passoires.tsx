import { Marker } from "@/components/ui/Marker";
import { IconArrowRight } from "./icons";
import { Reveal } from "./Reveal";

/**
 * Section passoires (territoire de marque) — copy deck §1 mot pour mot,
 * blocs F/G + citation de la base légale du moteur (gel F/G).
 */
export function Passoires() {
  return (
    <section className="mx-auto max-w-container px-6">
      <Reveal>
        <div className="grid gap-10 rounded-card border border-line bg-paper-2 p-8 sm:p-12 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-14">
          <div className="flex gap-3" aria-hidden="true">
            <span className="flex h-16 w-16 items-center justify-center rounded-card border-2 border-stamp font-display text-2xl font-extrabold text-stamp">
              F
            </span>
            <span className="flex h-16 w-16 items-center justify-center rounded-card bg-stamp font-display text-2xl font-extrabold text-paper">
              G
            </span>
          </div>
          <div>
            <p aria-hidden className="font-mono text-xs font-medium tracking-widest text-ink/45">
              03
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold tracking-display sm:text-2xl">
              Logement mal isolé ? Votre loyer est <Marker>gelé</Marker> depuis 2022.
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-ink/70">
              Si votre logement est classé F ou G, la loi interdit toute augmentation de loyer
              depuis le 24 août 2022. Beaucoup de propriétaires l&apos;ignorent — ou font comme
              si. Chaque augmentation appliquée depuis est remboursable.
            </p>
            {/* Deck §1 : [lien : Vérifier mon DPE] → le diagnostic (étape DPE incluse). */}
            <a
              href="/diagnostic"
              className="group mt-7 inline-flex items-center gap-2 rounded-badge border border-ink/20 bg-paper px-6 py-3 font-display text-base font-bold transition hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            >
              Vérifier mon DPE
              <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            {/* Base légale du moteur (rules-engine DPE_FREEZE) — citation copy deck §2,
                mot pour mot ; lien Légifrance vérifié le 2026-06-10 (art. 159, loi 2021-1104). */}
            <p className="mt-7 border-t border-line pt-4 font-mono text-xs leading-relaxed text-ink/55">
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
        </div>
      </Reveal>
    </section>
  );
}
