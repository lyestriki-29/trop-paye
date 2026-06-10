import type { ReactNode } from "react";
import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import { LogoA, LogoB, OgPreview, PastilleTP } from "./logos";

/**
 * D3 « De votre côté » — page identité.
 * Chaque pièce est montrée sur fond `paper` ET sur fond `ink`
 * (les logotypes héritent l'encre du panneau via `fill-current`).
 */

function Duo({
  label,
  note,
  render,
}: {
  label: string;
  note?: string;
  render: (tone: "paper" | "ink") => ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-lg font-bold tracking-display">{label}</h2>
        {note ? <p className="text-sm text-ink/55">{note}</p> : null}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="flex items-center justify-center rounded-card border border-line bg-paper p-10 text-ink sm:p-12">
          {render("paper")}
        </div>
        <div className="flex items-center justify-center rounded-card bg-ink p-10 text-paper sm:p-12">
          {render("ink")}
        </div>
      </div>
    </section>
  );
}

export default function IdentiteD3Page() {
  return (
    <DirectionTheme dir="d3">
      <main className="mx-auto max-w-container px-6 py-14 sm:py-16">
        <p className="text-sm font-semibold text-refund-text">D3 « De votre côté »</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-display sm:text-[44px]">
          Identité
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink/70">
          L&apos;allié chaleureux — gros boutons, langage humain, le surligneur jaune comme
          signature.
        </p>

        <Duo
          label="Logotype A — surligneur sous « Payé »"
          note="Proposition n°1 — utilisée en header de la home témoin."
          render={() => <LogoA className="h-12 w-auto sm:h-14" />}
        />

        <Duo
          label="Logotype B — empilé, « Payé » en pastille pleine"
          note="Proposition n°2 — affiches, posts carrés, fins de vidéo."
          render={() => <LogoB className="h-28 w-auto sm:h-32" />}
        />

        <Duo
          label="Marque secondaire — pastille « TP »"
          note="Fond accent, texte ink — avatars, tampons d'app, signatures d'email."
          render={() => <PastilleTP className="h-16 w-16 sm:h-20 sm:w-20" />}
        />

        <Duo
          label="Favicon 32 px"
          note="La pastille rendue à taille réelle."
          render={() => <PastilleTP className="h-8 w-8" />}
        />

        <Duo
          label="Gabarit OG 1200 × 630"
          note="Aperçu HTML/CSS réduit — le vrai gabarit next/og arrive en P2."
          render={(tone) => <OgPreview tone={tone} />}
        />
      </main>
    </DirectionTheme>
  );
}
