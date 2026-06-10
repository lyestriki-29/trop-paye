import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";

/**
 * FAQ complète (copy deck §1, mot pour mot — 4 entrées, dont 2 [AVOCAT]).
 * Exporte aussi les paires question/réponse en texte brut pour le JSON-LD
 * FAQPage (socle SEO P3).
 */
export interface FaqEntry {
  q: string;
  /** Texte brut pour le JSON-LD FAQPage. */
  plain: string;
  a: ReactNode;
}

export const FAQ_COMPLETE: ReadonlyArray<FaqEntry> = [
  {
    q: "Combien ça coûte ?",
    plain:
      "Rien d'avance, jamais. Si nous récupérons de l'argent, notre commission est de 25 % des sommes récupérées. Si nous ne récupérons rien, vous ne payez rien.",
    a: (
      <>
        Rien d&apos;avance, jamais. Si nous récupérons de l&apos;argent, notre commission est
        de 25 % des sommes récupérées. Si nous ne récupérons rien, vous ne payez rien. Le
        barème détaillé est{" "}
        <Link href="#bareme" className="font-medium text-refund-text underline underline-offset-2">
          ici
        </Link>
        .
      </>
    ),
  },
  {
    // [AVOCAT] — copy deck §1, mot pour mot ; à valider avant mise en ligne.
    q: "Mon propriétaire peut-il me le reprocher ?",
    plain:
      "Demander l'application de la loi est votre droit. Votre bail ne peut pas être résilié pour ce motif, et c'est nous qui menons les échanges.",
    a: (
      <>
        Demander l&apos;application de la loi est votre droit. Votre bail ne peut pas être
        résilié pour ce motif, et c&apos;est nous qui menons les échanges.
      </>
    ),
  },
  {
    // [AVOCAT] — copy deck §1, mot pour mot ; à valider avant mise en ligne.
    q: "Est-ce que vous êtes des avocats ?",
    plain:
      "Non, et nous ne donnons pas de conseil juridique. Nous fournissons une information générale, des calculs à partir de données publiques, et nous recouvrons les sommes avec votre mandat, dans le cadre légal du recouvrement amiable. Si votre dossier exige un avocat, nous vous mettons en relation avec un partenaire.",
    a: (
      <>
        Non, et nous ne donnons pas de conseil juridique. Nous fournissons une information
        générale, des calculs à partir de données publiques, et nous recouvrons les sommes
        avec votre mandat, dans le cadre légal du recouvrement amiable. Si votre dossier
        exige un avocat, nous vous mettons en relation avec un partenaire.
      </>
    ),
  },
  {
    q: "Combien de temps ça prend ?",
    plain:
      "La plupart des dossiers se règlent à l'amiable en 1 à 3 mois. S'il faut aller plus loin, nous vous proposons un avocat partenaire — toujours sans frais d'avance.",
    a: (
      <>
        La plupart des dossiers se règlent à l&apos;amiable en 1 à 3 mois. S&apos;il faut
        aller plus loin, nous vous proposons un avocat partenaire — toujours sans frais
        d&apos;avance.
      </>
    ),
  },
];

export function FaqComplete() {
  return (
    <section className="mx-auto max-w-container px-6 py-16 sm:py-20">
      <Reveal>
        {/* TODO_COPY : intitulé de section non couvert par le copy deck. */}
        <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
          Questions fréquentes
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FAQ_COMPLETE.map(({ q, a }, i) => (
          <Reveal key={q} delay={0.1 + i * 0.08} className="h-full">
            <article className="h-full rounded-card border border-line bg-paper p-8 shadow-sm">
              <h3 className="font-display text-lg font-bold">{q}</h3>
              <p className="mt-3 leading-relaxed text-ink/70">{a}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
