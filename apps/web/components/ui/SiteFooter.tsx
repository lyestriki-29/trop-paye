import Link from "next/link";
import { brand } from "@troppaye/shared";

const NAV = [
  { label: "Comment ça marche", href: "/comment-ca-marche" },
  { label: "Guides", href: "/guides" },
  { label: "Résultats", href: "/resultats" },
  { label: "Notre histoire", href: "/notre-histoire" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Presse", href: "/presse" },
  { label: "Mentions légales", href: "/legal" },
] as const;

/** Pastille « TP » (charte v2 §3) — fond `accent`, texte `ink`. */
function PastilleTP({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${brand.name} — pastille`}
      className={className}
    >
      <rect width="64" height="64" rx="18" className="fill-accent" />
      <text
        x="32"
        y="43"
        fontSize="30"
        fontWeight="800"
        textAnchor="middle"
        className="fill-ink font-display"
      >
        TP
      </text>
    </svg>
  );
}

/**
 * Pied de page public : nav complète + squelette légal R124 (copy deck §5,
 * [AVOCAT] — mot pour mot, {placeholders} à figer avant mise en ligne).
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-container px-6 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <PastilleTP className="h-8 w-8" />
            <p className="text-sm text-ink/60">{brand.baseline}</p>
          </div>
          <nav aria-label="Navigation pied de page">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {NAV.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-ink/60 transition hover:text-ink"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* [AVOCAT] — squelette R124 du copy deck §5, mot pour mot ; ne pas reformuler. */}
        <p className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-ink/50">
          TropPayé est une marque de {"{RAISON SOCIALE}"}, société par actions
          simplifiée — activité de recouvrement amiable de créances pour le
          compte d&apos;autrui déclarée auprès du procureur de la République de{" "}
          {"{ville}"} (art. R124-1 et s. CPCE) — assurance RC professionnelle{" "}
          {"{assureur}"} — médiateur de la consommation : {"{organisme}"}.
        </p>
      </div>
    </footer>
  );
}
