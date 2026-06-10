import Link from "next/link";
import { brand } from "@troppaye/shared";
import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import { LogoA } from "@/app/design-lab/directions/archive/d3/identite/logos";
import { VerdictSequence } from "./VerdictSequence";

/**
 * D3 « De votre côté » — verdict témoin animé.
 * Carte chaleureuse → « Bonne nouvelle » → surligneur qui balaie le
 * montant → count-up → gros CTA pilule. Données fictives.
 */
export default function VerdictD3Page() {
  return (
    <DirectionTheme dir="d3">
      <header className="border-b border-line/70 bg-paper">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-4">
          <Link href="/design-lab/directions/archive/d3/home" aria-label={`${brand.name} — accueil`}>
            <LogoA className="h-6 w-auto" />
          </Link>
          <span className="rounded-badge bg-paper-2 px-3 py-1 text-xs font-medium text-ink/55">
            Verdict témoin — données fictives
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <VerdictSequence />
        <p className="mt-10 text-center text-xs leading-relaxed text-ink/45">
          {brand.disclaimer}
        </p>
      </main>
    </DirectionTheme>
  );
}
