import Link from "next/link";
import { brand } from "@troppaye/shared";
import { AddressBar } from "@/app/design-lab/directions/d2/home/sections-hero";
import { LogoA } from "@/app/design-lab/directions/d2/identite/logos";

/**
 * D2 home — passoires, FAQ (2 extraits sûrs), CTA final sur fond ink, footer.
 * Copy mot pour mot depuis docs/copy-deck-troppaye.md §1.
 */

export function SectionDpe() {
  return (
    <section className="bg-paper-2 py-20">
      <div className="mx-auto grid max-w-container items-center gap-12 px-6 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="max-w-xl font-display text-xl font-extrabold tracking-display md:text-2xl">
            Logement mal isolé ? Votre loyer est gelé depuis 2022.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-ink/70">
            Si votre logement est classé F ou G, la loi interdit toute
            augmentation de loyer depuis le 24 août 2022. Beaucoup de
            propriétaires l'ignorent — ou font comme si. Chaque augmentation
            appliquée depuis est remboursable.
          </p>
          <a
            href="#"
            className="mt-6 inline-block font-semibold text-refund-text underline-offset-4 transition-colors hover:text-refund hover:underline"
          >
            Vérifier mon DPE →
          </a>
        </div>
        {/* Élément graphique : les deux classes gelées, en mono. */}
        <div className="flex gap-3 justify-self-center md:justify-self-end" aria-hidden>
          {["F", "G"].map((classe) => (
            <span
              key={classe}
              className="flex h-20 w-20 items-center justify-center rounded-field border border-stamp/30 bg-stamp/10 font-mono text-2xl font-medium text-stamp"
            >
              {classe}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionFaq() {
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-container px-6">
        {/* TODO_COPY : intitulé de section FAQ à valider (libellé court). */}
        <h2 className="font-display text-xl font-extrabold tracking-display md:text-2xl">
          FAQ
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-14">
          <article className="border-t border-line pt-6">
            <h3 className="font-display text-lg font-bold">Combien ça coûte ?</h3>
            <p className="mt-3 leading-relaxed text-ink/70">
              Rien d'avance, jamais. Si nous récupérons de l'argent, notre
              commission est de 25 % des sommes récupérées. Si nous ne
              récupérons rien, vous ne payez rien.{" "}
              <a
                href="#"
                className="text-refund-text underline underline-offset-2 transition-colors hover:text-refund"
              >
                Le barème détaillé est ici
              </a>
              .
            </p>
          </article>
          <article className="border-t border-line pt-6">
            <h3 className="font-display text-lg font-bold">
              Combien de temps ça prend ?
            </h3>
            <p className="mt-3 leading-relaxed text-ink/70">
              La plupart des dossiers se règlent à l'amiable en 1 à 3 mois.
              S'il faut aller plus loin, nous vous proposons un avocat
              partenaire — toujours sans frais d'avance.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function SectionFinalCta() {
  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto flex max-w-container flex-col items-center px-6 py-20 text-center">
        <h2 className="font-display text-xl font-extrabold tracking-display md:text-2xl">
          {brand.hero.title}
        </h2>
        <div className="mt-8 flex w-full justify-center">
          <AddressBar onInk />
        </div>
        <p className="mt-4 font-mono text-xs text-paper/60">
          {brand.hero.reassurance.join(" · ")}
        </p>
      </div>

      <footer className="border-t border-paper/10">
        <div className="mx-auto flex max-w-container flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-baseline gap-4">
            <LogoA className="h-5 w-auto" />
            <span className="text-sm text-paper/60">{brand.baseline}</span>
          </div>
          <Link
            href="#"
            className="text-sm text-paper/50 transition-colors hover:text-paper"
          >
            Mentions légales (squelette)
          </Link>
        </div>
      </footer>
    </section>
  );
}
