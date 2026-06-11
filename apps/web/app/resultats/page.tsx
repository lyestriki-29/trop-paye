import type { Metadata } from "next";
import { Confiance } from "@/components/home/Confiance";
import { CtaFinal } from "@/components/home/CtaFinal";
import { Reveal } from "@/components/home/Reveal";
import { RevealInit } from "@/components/home/RevealInit";
import { Temoignages } from "@/components/home/Temoignages";
import { PageHero } from "@/components/public/PageHero";
import { Marker } from "@/components/ui/Marker";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getPublicStats } from "@/lib/public-stats";

export const metadata: Metadata = {
  /* TODO_COPY — title/description SEO à valider (socle P3). */
  title: "Résultats — TropPayé",
  description: "Les sommes récupérées pour les locataires, en toute transparence.",
  alternates: { canonical: "/resultats" },
};

/** ISR : mêmes chiffres réels que la home (compteur public, jamais inventés). */
export const revalidate = 300;

/**
 * Page résultats (spec P3) : compteur public réel + emplacement des études de
 * cas anonymisées. AUCUNE étude de cas tant que le pilote n'a pas produit de
 * dossiers gagnés réels — règle « chiffres réels ou rien ».
 */
export default async function ResultatsPage() {
  const stats = await getPublicStats();
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          kicker="TropPayé · Les preuves"
          /* TODO_COPY — intitulé et chapeau de page (hors copy deck). */
          title={
            <>
              Des <Marker>résultats</Marker>, pas des promesses
            </>
          }
          lede="Chaque euro récupéré est tracé sur un compte dédié. Voici où nous en sommes."
        />

        <Confiance stats={stats} />

        <Temoignages numero="03" />

        <section className="mx-auto max-w-container px-6 py-8 sm:py-12">
          <Reveal>
            {/* TODO_COPY — section études de cas (contenu réel après le pilote,
                données anonymisées uniquement — jamais d'exemple inventé). */}
            <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
              Études de cas
            </h2>
            <div className="mt-6 rounded-card border border-dashed border-line bg-paper-2 p-8">
              <p className="font-medium text-ink">
                Les premières études de cas anonymisées seront publiées ici, avec
                l&apos;accord des locataires concernés.
              </p>
              <p className="mt-2 text-sm text-ink/60">
                Nous ne publions que des dossiers réels, jamais d&apos;exemples inventés.
              </p>
            </div>
          </Reveal>
        </section>

        <CtaFinal />
      </main>
      <RevealInit />
      <SiteFooter />
    </>
  );
}
