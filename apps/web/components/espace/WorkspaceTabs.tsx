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
    <nav className="flex gap-1.5 overflow-x-auto py-4" aria-label="Onglets du dossier">
      {tabs.map((t) => {
        const href = t.segment ? `${base}/${t.segment}` : base;
        const active = t.segment ? pathname.startsWith(href) : pathname === base;
        return (
          <Link
            key={t.key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`nb-pill relative whitespace-nowrap px-4 py-2 text-xs font-bold uppercase tracking-wide ${
              active ? "nb-pill--ink" : "nb-pill--dashed"
            }`}
          >
            {t.label}
            {t.flag ? (
              <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full border border-nb-ink bg-stamp" aria-label="action requise" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
