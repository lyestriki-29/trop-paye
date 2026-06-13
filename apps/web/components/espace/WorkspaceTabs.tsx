"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface TabDef {
  key: string;
  label: string;
  /** segment relatif ; "" = Aperçu (route racine du dossier). */
  segment: string;
  /** affiche une pastille « action requise / non-lu ». */
  flag?: boolean;
}

export function WorkspaceTabs({ dossierId, tabs }: { dossierId: string; tabs: TabDef[] }) {
  const pathname = usePathname();
  const base = `/espace/${dossierId}`;
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line" aria-label="Onglets du dossier">
      {tabs.map((t) => {
        const href = t.segment ? `${base}/${t.segment}` : base;
        const active = t.segment ? pathname.startsWith(href) : pathname === base;
        return (
          <Link
            key={t.key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              active ? "border-b-2 border-ink text-ink" : "text-ink/55 hover:text-ink"
            }`}
          >
            {t.label}
            {t.flag ? (
              <span className="absolute right-1 top-2 h-1.5 w-1.5 rounded-full bg-stamp" aria-label="action requise" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
