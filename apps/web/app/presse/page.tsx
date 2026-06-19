import type { Metadata } from "next";
import { Reveal } from "@/components/home/Reveal";
import { PageHeroNb } from "@/components/public/PageHeroNb";
import { PublicShell } from "@/components/ui/PublicShell";

export const metadata: Metadata = {
  title: "Espace presse — TropPayé",
  description:
    "Contact presse, chiffres clés et kit média de TropPayé, la plateforme qui aide les locataires à récupérer le loyer payé en trop.",
  alternates: { canonical: "/presse" },
};

/* Faits sourcés sur le problème (SDES, Légifrance, observatoires).
   TODO_VERIFIER : millésimes et formulation, relecture [AVOCAT] du bloc chiffré. */
const FAITS = [
  {
    value: "24/08/2022",
    body: "Depuis cette date, le loyer d'un logement classé F ou G au DPE ne peut plus augmenter (relocation, renouvellement, indexation). Toute hausse appliquée est un trop-perçu récupérable.",
  },
  {
    value: "≈ 1,1 M",
    body: "de passoires thermiques (F ou G) dans le parc locatif privé au 1er janvier 2025, soit environ 13,8 % du parc (source : SDES).",
  },
  {
    value: "3 ans",
    body: "le locataire dispose de 3 ans pour réclamer le remboursement des loyers payés en trop (prescription, art. 7-1 de la loi du 6 juillet 1989).",
  },
] as const;

export default function PressePage() {
  return (
    <PublicShell>
      <PageHeroNb
        kicker="TropPayé · Médias"
        title="Espace presse"
        lede="Vous travaillez sur le logement, les loyers ou le pouvoir d'achat des locataires ? Vous trouverez ici nos contacts, nos chiffres clés et notre kit média. Pour une interview ou une vérification, écrivez-nous, nous répondons vite."
      />

      {/* Contact presse — TODO_VERIFIER : alias e-mail, nom et fonction du contact. */}
      <section className="border-b-3 border-nb-ink py-14">
        <div className="mx-auto max-w-container px-6">
          <h2 className="text-[clamp(24px,3.5vw,40px)]">Contact presse</h2>
          <p className="mt-4 max-w-2xl font-nb-body leading-relaxed text-nb-ink/80">
            Un seul interlocuteur pour toute sollicitation média (interview, donnée, vérification
            d&apos;un chiffre).
          </p>
          <a
            href="mailto:presse@troppaye.fr"
            className="nb-card-hover mt-6 inline-flex border-3 border-nb-ink bg-accent px-6 py-3 font-nb-display text-base uppercase shadow-nb"
          >
            presse@troppaye.fr
          </a>
        </div>
      </section>

      <section className="border-b-3 border-nb-ink py-16 sm:py-20">
        <div className="mx-auto max-w-container px-6">
          <h2 className="text-[clamp(26px,4vw,44px)]">
            Pourquoi TropPayé <span className="nb-mark">existe</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FAITS.map((f, i) => (
              <Reveal key={f.value} delay={0.08 + i * 0.08} className="h-full">
                <article className="nb-tilt nb-card flex h-full flex-col p-7">
                  <p className="tabular font-nb-display text-3xl">{f.value}</p>
                  <p className="mt-4 font-nb-body text-sm leading-relaxed text-nb-ink/75">
                    {f.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/45">
            Sources : SDES (ministère de la Transition écologique), Légifrance. Chiffres
            réglementaires à confirmer avant citation.
          </p>
        </div>
      </section>

      <section className="border-b-3 border-nb-ink py-16">
        <div className="mx-auto grid max-w-container gap-10 px-6 md:grid-cols-2">
          <div>
            <h2 className="text-[clamp(22px,3vw,36px)]">Kit média</h2>
            <p className="mt-4 font-nb-body leading-relaxed text-nb-ink/75">
              Logos, charte graphique et visuels sont disponibles sur demande. Écrivez à
              presse@troppaye.fr, nous vous envoyons le nécessaire en haute définition (logos SVG
              et PNG, couleurs de marque, visuels produit).
            </p>
          </div>
          <div>
            <h2 className="text-[clamp(22px,3vw,36px)]">À propos de TropPayé</h2>
            <p className="mt-4 font-nb-body leading-relaxed text-nb-ink/75">
              TropPayé est une plateforme française qui aide les locataires à détecter les loyers
              irréguliers et à récupérer le trop-perçu. En analysant le bail, le diagnostic
              énergétique et la localisation, elle identifie les cas de loyer gelé (passoires F ou
              G), de plafonnement non respecté ou d&apos;encadrement dépassé, puis accompagne le
              locataire. Sans avance de frais : la commission n&apos;est due qu&apos;en cas de
              succès. Les données sont hébergées en France.
            </p>
          </div>
        </div>
      </section>

      {/* Pas de presse réelle : état « à venir » honnête (rien d'inventé). */}
      <section className="py-16">
        <div className="mx-auto max-w-container px-6">
          <h2 className="text-[clamp(22px,3vw,36px)]">Communiqués</h2>
          <p className="mt-4 max-w-2xl font-nb-body leading-relaxed text-nb-ink/70">
            Nos premiers communiqués seront publiés ici. Pour être informé de nos annonces,
            écrivez-nous à presse@troppaye.fr.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
