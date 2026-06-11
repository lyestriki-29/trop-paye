import Link from "next/link";
import { RevealInit } from "@/components/home/RevealInit";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getPublicStats } from "@/lib/public-stats";
import { ClosingV3 } from "./sections-closing";
import { EtapesV3 } from "./sections-etapes";
import { HeroV3, TickerLegal } from "./sections-hero";
import { MoteurV3 } from "./sections-moteur";
import { ConfianceV3, TemoignageV3 } from "./sections-preuves";
import { RegimesV3 } from "./sections-regimes";
import "./lab.css";

/**
 * Design-lab « home v3 — dossier d'instruction » (demande Lyes 2026-06-11 :
 * preview dense et premium, moins de blanc, vitrine du savoir-faire Propulseo).
 * Parti pris : la page entière est un dossier monté à charge — pièces
 * numérotées, papier ligné/millimétré, bandeau de bases légales, strip de
 * chiffres, onglets de classeur. RIEN n'est en prod : la home réelle est
 * intacte tant que l'arbitrage n'est pas rendu.
 */

/** Même régime que la home prod : compteur public réel, rafraîchi par ISR. */
export const revalidate = 300;

export default async function HomeV3Lab() {
  const stats = await getPublicStats();
  return (
    <>
      <nav className="border-b border-line bg-paper-2 px-6 py-2 text-xs text-ink/60">
        <span className="font-medium">Design-lab · home v3 « dossier d&apos;instruction »</span>
        <span className="ml-3">
          Preview NON arbitrée — brouillon, données spécimen signalées, copy nouvelle = TODO_COPY.
        </span>
        <Link
          href="/"
          className="ml-3 font-medium underline-offset-2 hover:underline"
        >
          Comparer à la home actuelle →
        </Link>
      </nav>

      <SiteHeader />
      <main>
        <HeroV3 />
        <TickerLegal />
        <MoteurV3 />
        <RegimesV3 />
        <EtapesV3 />
        <ConfianceV3 stats={stats} />
        <TemoignageV3 />
        <ClosingV3 />
      </main>
      <RevealInit />
      <SiteFooter />

      {/* Note d'arbitrage — ce qui change vs la home prod (pour trancher). */}
      <aside className="border-t-2 border-ink bg-paper-2 px-6 py-10">
        <div className="mx-auto max-w-container">
          <h2 className="font-display text-lg font-bold tracking-display">
            Note d&apos;arbitrage — deltas vs home actuelle
          </h2>
          <ul className="mt-4 grid max-w-4xl gap-2 text-sm leading-relaxed text-ink/70 sm:grid-cols-2">
            <li>· Hero : papier ligné + cartouche dossier + typo giga + strip de 4 chiffres.</li>
            <li>· Nouveau : bandeau défilant des bases légales (pause au survol).</li>
            <li>· Nouveau : pipeline « instruction » — IGN / ADEME / INSEE / verdict.</li>
            <li>· Nouveau : bento des 3 régimes (gel, bouclier, décence-orientation).</li>
            <li>· Étapes : rangées éditoriales, numéros géants au trait.</li>
            <li>· Confiance : bande ink pleine largeur (plus de carte flottante).</li>
            <li>· Témoignage : reçu penché à onglet « pièce à conviction ».</li>
            <li>· CTA final : bande accent pleine largeur + tampon.</li>
          </ul>
          <p className="mt-5 font-mono text-xs text-ink/50">
            Bouclier + décence : copy brouillon (TODO_COPY / TODO_VERIFIER), [AVOCAT] avant prod.
          </p>
        </div>
      </aside>
    </>
  );
}
