import type { Metadata } from "next";
import { Reveal } from "@/components/home/Reveal";
import { RevealInit } from "@/components/home/RevealInit";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";

export const metadata: Metadata = {
  /* TODO_COPY — title/description SEO à valider (socle P3). */
  title: "Presse — TropPayé",
  description: "Kit presse, chiffres clés et contact média de TropPayé.",
  alternates: { canonical: "/presse" },
};

/**
 * Page presse (spec P3) — squelette : kit presse + témoignages après le pilote
 * (structure-site §5 : « kit presse + 3 témoignages documentés issus du pilote »).
 */
export default function PressePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <header className="mx-auto max-w-container px-6 pb-10 pt-14 sm:pt-20">
          <Reveal>
            {/* TODO_COPY — intitulé et chapeau de page (hors copy deck). */}
            <h1 className="font-display text-2xl font-extrabold leading-tight tracking-display sm:text-hero">
              Presse
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">
              Journalistes : le kit presse et nos chiffres clés arrivent avec le lancement.
            </p>
          </Reveal>
        </header>

        <section className="mx-auto max-w-container px-6 pb-20">
          <Reveal>
            {/* TODO_COPY — kit presse (logos, visuels, dossier) + contact média. */}
            <div className="rounded-card border border-dashed border-line bg-paper-2 p-8">
              <h2 className="font-display text-lg font-bold tracking-display">Kit presse</h2>
              <p className="mt-2 text-sm text-ink/60">
                En préparation (TODO_COPY) : logos, visuels, dossier de presse, chiffres
                vérifiés issus du pilote et contact média.
              </p>
            </div>
          </Reveal>
        </section>
      </main>
      <RevealInit />
      <SiteFooter />
    </>
  );
}
