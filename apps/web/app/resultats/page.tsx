import type { Metadata } from "next";
import { Reveal } from "@/components/home/Reveal";
import { CtaFinalNb } from "@/components/home/nb/CtaFinalNb";
import { ConfianceNb, TemoignageNb } from "@/components/home/nb/sections-preuves-nb";
import { ResultatsNb } from "@/components/home/nb/sections-resultats-nb";
import { PageHeroNb } from "@/components/public/PageHeroNb";
import { PublicShell } from "@/components/ui/PublicShell";

export const metadata: Metadata = {
  title: "Résultats — TropPayé",
  description: "Les sommes récupérées pour les locataires, en toute transparence.",
  alternates: { canonical: "/resultats" },
};

export const revalidate = 300;

/**
 * Page résultats — DA néubrutaliste. Chiffres réels (ResultatsNb), preuve et
 * témoignage. AUCUNE étude de cas inventée : emplacement réservé aux dossiers
 * réels anonymisés (règle « chiffres réels ou rien »).
 */
export default function ResultatsPage() {
  return (
    <PublicShell>
      <PageHeroNb
        kicker="TropPayé · Les preuves"
        title={
          <>
            Des <span className="nb-mark">résultats</span>, pas des promesses
          </>
        }
        lede="Chaque euro récupéré est tracé sur un compte dédié. Voici où nous en sommes."
      />

      <ResultatsNb />
      <ConfianceNb stats={null} />
      <TemoignageNb />

      <section className="border-b-3 border-nb-ink py-16 sm:py-20">
        <div className="mx-auto max-w-container px-6">
          <Reveal>
            <h2 className="text-[clamp(26px,4vw,44px)]">Études de cas</h2>
            <div className="mt-6 border-3 border-dashed border-nb-ink bg-paper p-8">
              <p className="font-nb-display text-lg uppercase">
                Les premières études de cas anonymisées seront publiées ici.
              </p>
              <p className="mt-3 font-nb-body leading-relaxed text-nb-ink/70">
                Avec l&apos;accord des locataires concernés. Nous ne publions que des dossiers
                réels, jamais d&apos;exemples inventés.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaFinalNb />
    </PublicShell>
  );
}
