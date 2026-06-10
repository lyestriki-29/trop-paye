import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brand } from "@troppaye/shared";
import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import {
  FaviconMark,
  LogoA,
  LogoB,
  StampMark,
} from "@/app/design-lab/directions/d1/identite/logos";

export const metadata: Metadata = {
  title: "D1 « Document officiel » — Identité",
};

type Surface = "paper" | "ink";

/** Chaque actif est montré sur fond paper ET sur fond ink (plan P0, écran 3). */
function Swatch({ on, children }: { on: Surface; children: ReactNode }) {
  const surface =
    on === "paper"
      ? "border border-line bg-paper text-ink"
      : "border border-ink bg-ink text-paper";
  return (
    <div className={`flex min-h-48 items-center justify-center rounded-card p-8 ${surface}`}>
      {children}
    </div>
  );
}

function AssetRow({
  kicker,
  note,
  render,
}: {
  kicker: string;
  note: string;
  render: (on: Surface) => ReactNode;
}) {
  return (
    <section className="border-t border-line pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">{kicker}</h2>
        <p className="text-xs text-ink/50">{note}</p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Swatch on="paper">{render("paper")}</Swatch>
        <Swatch on="ink">{render("ink")}</Swatch>
      </div>
    </section>
  );
}

/** Gabarit OG 1200×630 en aperçu HTML/CSS réduit (le vrai next/og arrive en P2). */
function OgPreview({ on }: { on: Surface }) {
  const card =
    on === "paper" ? "border-line bg-paper text-ink" : "border-paper/25 bg-ink text-paper";
  return (
    <div className={`relative aspect-[1200/630] w-full max-w-xl overflow-hidden rounded-card border ${card}`}>
      <div className="flex h-full flex-col justify-between p-7">
        <LogoA className="h-6 w-auto" />
        <p className="max-w-[19ch] font-display text-xl font-extrabold leading-[1.15] tracking-display sm:text-[30px]">
          J'ai vérifié mon loyer :{" "}
          <span className="tabular font-mono font-medium text-refund">1 437 €</span> à récupérer
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">
          {brand.domain}
        </p>
      </div>
      <div className="absolute -right-4 bottom-4 -rotate-6 text-stamp">
        <StampMark className="h-20 w-auto" />
      </div>
    </div>
  );
}

export default function D1IdentitePage() {
  return (
    <DirectionTheme dir="d1">
      <main className="mx-auto max-w-container px-6 py-12 md:py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
          D1 · Document officiel · Identité
        </p>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-display">
          {brand.name}
          <span className="text-ink/40"> — propositions d'identité</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
          Le vocabulaire visuel de l'administration devient l'arme du locataire — quittance,
          filets, tampon. Logotypes en Bricolage Grotesque 800, accent du « é » en refund ;
          tampon réservé au verdict et aux réseaux (jamais sur la home).
        </p>

        <div className="mt-10 space-y-10">
          <AssetRow
            kicker="Logotype — proposition A"
            note="Une ligne, Bricolage 800 — l'accent du « é » en refund (le signal vert : l'argent qui revient)."
            render={() => <LogoA className="h-10 w-auto" />}
          />
          <AssetRow
            kicker="Logotype — proposition B"
            note="Déclinaison empilée + soulignement filet, segment refund en réponse à l'accent — registre courrier."
            render={() => <LogoB className="h-24 w-auto" />}
          />
          <AssetRow
            kicker="Marque secondaire — tampon"
            note="Double filet stamp, incliné −6°, encrage imparfait — réservé au verdict irrégulier et aux contenus sociaux."
            render={() => (
              <span className="-rotate-6 text-stamp">
                <StampMark className="h-24 w-auto" />
              </span>
            )}
          />
          <AssetRow
            kicker="Favicon — 32 px"
            note="Tampon « TP » condensé : rendu réel 32 px + agrandissement ×3 pour contrôle."
            render={() => (
              <span className="flex items-end gap-8 text-stamp">
                <FaviconMark className="h-8 w-8" />
                <FaviconMark className="h-24 w-24" />
              </span>
            )}
          />
          <AssetRow
            kicker="Gabarit OG — 1200 × 630"
            note="Aperçu HTML/CSS réduit — logotype, montant en vedette, tampon ; génération next/og en P2."
            render={(on) => <OgPreview on={on} />}
          />
        </div>

        <p className="mt-12 border-t border-line pt-4 text-xs text-ink/50">
          Surface design-lab — données fictives. Arbitrage : une proposition de logotype sera
          promue, les autres archivées dans /design-lab/archive.
        </p>
      </main>
    </DirectionTheme>
  );
}
