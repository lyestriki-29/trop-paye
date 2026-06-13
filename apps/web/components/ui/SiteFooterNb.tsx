import Link from "next/link";
import { brand } from "@troppaye/shared";

/**
 * Pied de page public néubrutaliste — bande sombre `nb-dark`, colonnes de liens,
 * squelette légal R124 (copy deck §5, [AVOCAT] : mot pour mot, {placeholders} à
 * figer avant prod) et signature centrée. À utiliser SOUS le scope `.nb`.
 */

const COLS = [
  {
    title: "Produit",
    links: [
      { label: "Comment ça marche", href: "/comment-ca-marche" },
      { label: "Résultats", href: "/#resultats" },
      { label: "Guides", href: "/guides" },
    ],
  },
  {
    title: "Société",
    links: [
      { label: "Notre histoire", href: "/notre-histoire" },
      { label: "Méthode & sources", href: "/methode" },
      { label: "Partenaires", href: "/partenaires" },
      { label: "Presse", href: "/presse" },
    ],
  },
  {
    title: "Compte & légal",
    links: [
      { label: "Se connecter", href: "/login" },
      { label: "Vérifier mon loyer", href: "/diagnostic" },
      { label: "Mentions légales", href: "/legal" },
    ],
  },
] as const;

export function SiteFooterNb() {
  return (
    <footer className="nb-dark border-t-3 border-nb-ink text-cream">
      <div className="mx-auto max-w-container px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_2fr]">
          <div>
            <p className="font-nb-display text-2xl uppercase tracking-tight">{brand.name}</p>
            <p className="mt-3 max-w-xs font-nb-body text-sm leading-relaxed text-cream/70">
              {brand.baseline}
            </p>
            <Link
              href="/diagnostic"
              className="nb-card-hover mt-6 inline-flex border-3 border-cream bg-accent px-5 py-2.5 font-nb-display text-sm uppercase text-nb-ink"
            >
              {brand.hero.cta}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="nb-mono text-[11px] font-semibold uppercase tracking-widest text-cream/45">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {col.links.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="font-nb-body text-sm text-cream/80 transition hover:text-cream"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* [AVOCAT] — squelette R124 du copy deck §5, mot pour mot ; ne pas reformuler. */}
        <p className="mt-12 border-t border-cream/15 pt-6 nb-mono text-[11px] leading-relaxed text-cream/50">
          TropPayé est une marque de {"{RAISON SOCIALE}"}, société par actions simplifiée,
          activité de recouvrement amiable de créances pour le compte d&apos;autrui déclarée
          auprès du procureur de la République de {"{ville}"} (art. R124-1 et s. CPCE),
          assurance RC professionnelle {"{assureur}"}, médiateur de la consommation :{" "}
          {"{organisme}"}.
        </p>

        {/* Signature centrée, tout en bas (demande Lyes). */}
        <p className="mt-10 text-center font-nb-body text-sm text-cream/60">
          Fait avec passion par{" "}
          <span className="font-semibold text-cream">Propu&apos;SEO</span>
        </p>
      </div>
    </footer>
  );
}
