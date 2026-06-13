"use client";

import { useState } from "react";
import Link from "next/link";
import { brand } from "@troppaye/shared";

/**
 * En-tête public néubrutaliste — sticky, bord dur 3px, vraies pages en nav,
 * CTA jaune. À utiliser SOUS le scope `.nb` (via PublicShell) : les classes
 * nb-* et polices néubrutalistes n'ont d'effet que là.
 */

const NAV = [
  { label: "Comment ça marche", href: "/comment-ca-marche" },
  { label: "Guides", href: "/guides" },
  { label: "Résultats", href: "/#resultats" },
  { label: "Notre histoire", href: "/notre-histoire" },
  { label: "Méthode", href: "/methode" },
] as const;

function IconBurger({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden="true"
      className="h-6 w-6"
    >
      {open ? (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function SiteHeaderNb() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b-3 border-nb-ink bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between gap-6 px-6 py-3.5">
        <Link
          href="/"
          aria-label={`${brand.name} — accueil`}
          className="font-nb-display text-xl uppercase tracking-tight"
        >
          {brand.name}
        </Link>
        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-6 lg:flex"
        >
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="nb-mono text-xs font-semibold uppercase tracking-wider text-nb-ink/70 transition hover:text-nb-ink"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/login"
            className="nb-mono text-xs font-semibold uppercase tracking-wider text-nb-ink/70 transition hover:text-nb-ink"
          >
            Se connecter
          </Link>
          <Link
            href="/diagnostic"
            className="nb-card-hover border-3 border-nb-ink bg-accent px-4 py-2 font-nb-display text-sm uppercase shadow-nb-sm"
          >
            {brand.hero.cta}
          </Link>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-mobile-nb"
          onClick={() => setOpen((o) => !o)}
          className="border-3 border-nb-ink bg-paper p-1.5 text-nb-ink shadow-nb-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nb-ink lg:hidden"
        >
          <IconBurger open={open} />
          <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
        </button>
      </div>
      <nav
        id="menu-mobile-nb"
        aria-label="Navigation principale"
        className={open ? "border-t-3 border-nb-ink bg-cream px-6 py-5 lg:hidden" : "hidden"}
      >
        <ul className="flex flex-col gap-4">
          {NAV.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className="font-nb-display text-lg uppercase"
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="nb-mono text-sm font-semibold uppercase tracking-wider text-nb-ink/70"
            >
              Se connecter
            </Link>
          </li>
          <li className="pt-1">
            <Link
              href="/diagnostic"
              onClick={() => setOpen(false)}
              className="block border-3 border-nb-ink bg-accent px-4 py-3 text-center font-nb-display text-base uppercase shadow-nb-sm"
            >
              {brand.hero.cta}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
