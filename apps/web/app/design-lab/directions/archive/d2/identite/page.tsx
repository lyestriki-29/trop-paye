import type { ReactNode } from "react";
import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import {
  FaviconTile,
  LogoA,
  LogoB,
  MarkTP,
  OgCard,
} from "@/app/design-lab/directions/archive/d2/identite/logos";

/**
 * D2 « Relevé de compte » — page identité.
 * Tout le système est montré sur fond paper ET sur fond ink.
 */

function Cell({
  caption,
  muted,
  children,
}: {
  caption: string;
  muted: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className={`font-mono text-xs ${muted}`}>{caption}</p>
      <div className="flex min-h-16 items-center">{children}</div>
    </div>
  );
}

function Board({ onInk }: { onInk: boolean }) {
  const frame = onInk
    ? "border-ink bg-ink text-paper"
    : "border-line bg-paper text-ink";
  const muted = onInk ? "text-paper/50" : "text-ink/50";
  return (
    <section className={`rounded-card border p-8 md:p-12 ${frame}`}>
      <p className={`font-mono text-xs ${muted}`}>
        {onInk ? "Sur fond ink" : "Sur fond paper"}
      </p>
      <div className="mt-10 grid gap-x-12 gap-y-12 md:grid-cols-2">
        <Cell caption="Logotype A — deux encres" muted={muted}>
          <LogoA className="h-10 w-auto" />
        </Cell>
        <Cell caption="Logotype B — chiffre intégré (« 0 » compteur mono)" muted={muted}>
          <LogoB className="h-10 w-auto" />
        </Cell>
        <Cell caption="Marque secondaire — écriture comptable" muted={muted}>
          <MarkTP onInk={onInk} />
        </Cell>
        <Cell caption="Favicon 32 px" muted={muted}>
          <FaviconTile onInk={onInk} />
        </Cell>
        <div className="md:col-span-2">
          <Cell caption="Gabarit OG 1200 × 630 — aperçu réduit (next/og en P2)" muted={muted}>
            <OgCard onInk={onInk} />
          </Cell>
        </div>
      </div>
    </section>
  );
}

export default function D2IdentitePage() {
  return (
    <DirectionTheme dir="d2">
      <main className="mx-auto max-w-container px-6 py-14">
        <p className="font-mono text-xs text-refund-text">D2 · Relevé de compte</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-display">
          Identité
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
          Logotypes Inter Tight 800, marque secondaire « +TP » en écriture comptable
          (le crédit en vert refund). Zéro métaphore papier : la preuve par les
          chiffres, en mono tabulaire.
        </p>
        <div className="mt-10 grid gap-8">
          <Board onInk={false} />
          <Board onInk />
        </div>
      </main>
    </DirectionTheme>
  );
}
