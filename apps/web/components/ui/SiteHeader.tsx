"use client";

import { useState } from "react";
import Link from "next/link";
import { brand } from "@troppaye/shared";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

const NAV = [
  { label: "Comment ça marche", href: "/comment-ca-marche" },
  { label: "Guides", href: "/guides" },
  { label: "Résultats", href: "/resultats" },
] as const;

/** Glyphes Lucide inlinés (menu / x) — `lucide-react` absent du workspace. */
function IconBurger({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
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
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}

/** Chrome public charte v2 — logotype, nav, CTA pilule `accent`, menu mobile accessible. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-line/70 bg-paper">
      <div className="mx-auto flex max-w-container items-center justify-between gap-6 px-6 py-4">
        <Link href="/" aria-label={`${brand.name} — accueil`}>
          <Logo className="text-xl" />
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-7 lg:flex">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-ink/70 transition hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-5 lg:flex">
          {/* TODO_COPY — « Se connecter » hors copy deck (libellé acté en P0). */}
          <Link
            href="/login"
            className="text-sm font-semibold text-ink/70 transition hover:text-ink"
          >
            Se connecter
          </Link>
          <Button href="/diagnostic" variant="accent">
            {brand.hero.cta}
          </Button>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((o) => !o)}
          className="rounded-field p-2 text-ink transition hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink lg:hidden"
        >
          <IconBurger open={open} />
          <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
        </button>
      </div>
      <nav
        id="menu-mobile"
        aria-label="Navigation principale"
        className={open ? "border-t border-line bg-paper px-6 py-5 lg:hidden" : "hidden"}
      >
        <ul className="flex flex-col gap-4">
          {NAV.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-ink/80 transition hover:text-ink"
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            {/* TODO_COPY — « Se connecter » hors copy deck (libellé acté en P0). */}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-base font-semibold text-ink/80 transition hover:text-ink"
            >
              Se connecter
            </Link>
          </li>
          <li className="pt-1">
            <Button href="/diagnostic" variant="accent" className="w-full">
              {brand.hero.cta}
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
