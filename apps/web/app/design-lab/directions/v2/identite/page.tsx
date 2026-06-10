import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brand, formatEUR } from "@troppaye/shared";
import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import { LogoA, LogoB, PastilleTP, StampMark } from "./logos";

export const metadata: Metadata = {
  title: "V2 « Synthèse » — Identité",
};

/**
 * V2 « Synthèse » — page identité (arbitrage du 2026-06-10).
 * Logotypes D3 (Outfit 800, surligneur accent) + tampon D1 recoloré au
 * `stamp` du thème d3, présenté comme marque secondaire. Chaque pièce est
 * montrée sur fond `paper` ET sur fond `ink` (encre héritée via `fill-current`).
 */

type Tone = "paper" | "ink";

function Duo({
  label,
  note,
  render,
}: {
  label: string;
  note?: string;
  render: (tone: Tone) => ReactNode;
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

/** Montant du gabarit OG — scénario témoin du plan P0 (données fictives). */
const OG_TOTAL_CENTS = 143700;

/** Gabarit OG 1200×630 — logotype D3, montant surligné, tampon D1 claqué au coin. */
function OgPreview({ tone }: { tone: Tone }) {
  const ink = tone === "ink";
  return (
    <div
      className={`relative flex aspect-[1200/630] w-full flex-col justify-between overflow-hidden rounded-card border p-8 sm:p-10 ${
        ink ? "border-paper/20 bg-ink text-paper" : "border-line bg-paper text-ink"
      }`}
    >
      <LogoA className="h-8 w-auto sm:h-9" />
      <p className="max-w-[18ch] font-display text-xl font-extrabold leading-snug tracking-display sm:text-2xl">
        J&apos;ai vérifié mon loyer :{" "}
        <span className="whitespace-nowrap rounded-field bg-accent px-2 text-ink">
          <span className="font-mono tabular">{formatEUR(OG_TOTAL_CENTS)}</span>
        </span>{" "}
        à récupérer
      </p>
      <span className={`text-sm font-medium ${ink ? "text-paper/60" : "text-ink/55"}`}>
        {brand.domain}
      </span>
      <span className="absolute -right-3 bottom-5 -rotate-6 text-stamp sm:-right-4">
        <StampMark className="h-16 w-auto sm:h-20" />
      </span>
    </div>
  );
}

export default function IdentiteV2Page() {
  return (
    <DirectionTheme dir="d3">
      <main className="mx-auto max-w-container px-6 py-14 sm:py-16">
        <p className="text-sm font-semibold text-refund-text">
          V2 « Synthèse » — arbitrage du 2026-06-10
        </p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-display sm:text-[44px]">
          Identité
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink/70">
          L&apos;allié chaleureux qui montre la preuve comptable — logotypes D3 (Outfit 800,
          surligneur en signature), tampon D1 recoloré au rouge du thème en marque secondaire.
        </p>

        <Duo
          label="Logotype A — surligneur sous « Payé »"
          note="Proposition retenue — header de la home et du verdict."
          render={() => <LogoA className="h-12 w-auto sm:h-14" />}
        />

        <Duo
          label="Logotype B — empilé, « Payé » en pastille pleine"
          note="Affiches, posts carrés, fins de vidéo."
          render={() => <LogoB className="h-28 w-auto sm:h-32" />}
        />

        <Duo
          label="Pastille « TP »"
          note="Avatars, signatures d'email, tampons d'app."
          render={() => <PastilleTP className="h-16 w-16 sm:h-20 sm:w-20" />}
        />

        <Duo
          label="Tampon « TROP PAYÉ » — marque secondaire"
          note="Réservée au verdict gagné + réseaux sociaux — jamais sur la home ni dans la séquence verdict."
          render={() => (
            <span className="inline-block -rotate-6 text-stamp">
              <StampMark className="h-24 w-auto sm:h-28" />
            </span>
          )}
        />

        <Duo
          label="Favicon 32 px"
          note="La pastille rendue à taille réelle."
          render={() => <PastilleTP className="h-8 w-8" />}
        />

        <Duo
          label="Gabarit OG 1200 × 630"
          note="Logotype D3 + montant surligné + tampon D1 — le vrai gabarit next/og arrive en P2."
          render={(tone) => <OgPreview tone={tone} />}
        />
      </main>
    </DirectionTheme>
  );
}
