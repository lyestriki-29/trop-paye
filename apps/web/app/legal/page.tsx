import type { Metadata } from "next";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";

export const metadata: Metadata = {
  /* TODO_COPY — title/description SEO à valider (socle P3). */
  title: "Mentions légales — TropPayé",
  description: "Mentions légales, CGU, confidentialité et politique cookies de TropPayé.",
  alternates: { canonical: "/legal" },
  robots: { index: false },
};

/**
 * Pages légales (spec P3) — SQUELETTES [AVOCAT] : structure définitive, contenus
 * à rédiger/valider par l'avocat conseil AVANT toute mise en ligne. Les seuls
 * textes repris ici viennent du copy deck §5, mot pour mot ({placeholders} à
 * figer). Interdiction absolue d'improviser du contenu juridique.
 */
export default function LegalPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-display sm:text-hero">
          Mentions légales
        </h1>

        {/* Copy deck §5 — bandeau information ≠ conseil, mot pour mot. [AVOCAT] */}
        <p className="mt-8 rounded-card border-l-4 border-accent bg-paper-2 p-4 text-sm font-medium text-ink/80">
          Notre équipe vous informe sur la procédure mais ne peut pas vous donner de
          conseil juridique personnalisé.
        </p>

        <section id="mentions" className="mt-12 scroll-mt-6">
          <h2 className="font-display text-xl font-extrabold tracking-display">Éditeur</h2>
          {/* Copy deck §5 — squelette R124, mot pour mot ; {placeholders} à figer. [AVOCAT] */}
          <p className="mt-4 leading-relaxed text-ink/70">
            TropPayé est une marque de {"{RAISON SOCIALE}"}, société par actions simplifiée —
            activité de recouvrement amiable de créances pour le compte d&apos;autrui
            déclarée auprès du procureur de la République de {"{ville}"} (art. R124-1 et s.
            CPCE) — assurance RC professionnelle {"{assureur}"} — médiateur de la
            consommation : {"{organisme}"}.
          </p>
        </section>

        {/* [AVOCAT] — sections à rédiger par l'avocat conseil (structure-site §5 :
            CGU/CGV, rétractation, médiation ; RGPD : registre, durées, droits). */}
        {(
          [
            ["cgu", "Conditions générales d'utilisation"],
            ["confidentialite", "Politique de confidentialité"],
            ["cookies", "Politique cookies"],
          ] as const
        ).map(([id, title]) => (
          <section key={id} id={id} className="mt-12 scroll-mt-6">
            <h2 className="font-display text-xl font-extrabold tracking-display">{title}</h2>
            <div className="mt-4 rounded-card border border-dashed border-line bg-paper-2 p-6">
              <p className="text-sm text-ink/60">
                Contenu en cours de rédaction par notre avocat conseil ([AVOCAT]) — publié
                avant l&apos;ouverture du service.
              </p>
            </div>
          </section>
        ))}

        <section id="mesure-audience" className="mt-12 scroll-mt-6">
          <h2 className="font-display text-xl font-extrabold tracking-display">
            Mesure d&apos;audience
          </h2>
          {/* Spec P3 : analytics sans cookie, exempté CNIL → pas de bannière. [AVOCAT] */}
          <p className="mt-4 leading-relaxed text-ink/70">
            Ce site utilise une mesure d&apos;audience sans cookie, exemptée de
            consentement (CNIL). Aucun traceur publicitaire n&apos;est déposé.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
