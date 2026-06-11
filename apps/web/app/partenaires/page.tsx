import type { Metadata } from "next";
import { Reveal } from "@/components/home/Reveal";
import { RevealInit } from "@/components/home/RevealInit";
import { PageHero } from "@/components/public/PageHero";
import { Marker } from "@/components/ui/Marker";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";

export const metadata: Metadata = {
  /* TODO_COPY — title/description SEO à valider (socle P3). */
  title: "Partenaires — TropPayé",
  description: "Avocats et associations : travaillons ensemble pour les locataires.",
  alternates: { canonical: "/partenaires" },
};

/**
 * Page partenaires (spec P3) — squelette : avocats & associations.
 * Structure finale, contenus TODO_COPY (convention type [AVOCAT] en cours).
 */
export default function PartenairesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          kicker="TropPayé · Le réseau"
          /* TODO_COPY — intitulé et chapeau de page (hors copy deck). */
          title={
            <>
              Plus forts <Marker>ensemble</Marker>
            </>
          }
          lede="Avocats en droit immobilier, associations de locataires : certains dossiers méritent plus que le recouvrement amiable."
        />

        <section className="mx-auto max-w-container grid gap-6 px-6 pb-20 md:grid-cols-2">
          <Reveal>
            {/* TODO_COPY — bloc avocats (conditions de transmission [AVOCAT]). */}
            <article className="h-full rounded-card border border-line bg-paper p-8 shadow-sm">
              <h2 className="font-display text-lg font-bold">Avocats</h2>
              <p className="mt-3 leading-relaxed text-ink/70">
                Nous transmettons les dossiers qui exigent une procédure, avec un dossier
                complet et des pièces vérifiées. Convention de partenariat en préparation
                (TODO_COPY [AVOCAT]).
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.1}>
            {/* TODO_COPY — bloc associations. */}
            <article className="h-full rounded-card border border-line bg-paper p-8 shadow-sm">
              <h2 className="font-display text-lg font-bold">Associations</h2>
              <p className="mt-3 leading-relaxed text-ink/70">
                Vous accompagnez des locataires ? Notre diagnostic gratuit peut outiller vos
                permanences. Contact en préparation (TODO_COPY).
              </p>
            </article>
          </Reveal>
        </section>
      </main>
      <RevealInit />
      <SiteFooter />
    </>
  );
}
