"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { LogoNb } from "@/components/ui/LogoNb";

export function EspaceHeader({
  email,
  activityCount,
  notifications,
  contact,
}: {
  email: string | null;
  activityCount: number;
  notifications?: ReactNode; // NotificationsPanel (Phase 3)
  contact?: ReactNode; // ContactDialog (Phase 5)
}) {
  const [open, setOpen] = useState<null | "notif" | "contact">(null);
  return (
    <header className="flex items-center justify-between gap-4 border-b-2 border-nb-ink bg-paper px-4 py-3">
      <Link href="/espace" className="flex items-center gap-3" aria-label="Mes dossiers">
        <LogoNb size={34} />
        <span className="nb-mono hidden text-xs uppercase tracking-widest text-nb-ink/70 sm:inline">
          Mon dossier
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(open === "notif" ? null : "notif")}
          className="nb-pill nb-pill--dashed relative px-3 py-1.5 text-xs"
          aria-label="Notifications"
        >
          🔔
          {activityCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full border border-nb-ink bg-stamp px-1 text-[10px] text-paper">
              {activityCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setOpen(open === "contact" ? null : "contact")}
          className="nb-pill nb-pill--dashed px-3 py-1.5 text-xs"
        >
          Contact
        </button>
        <Link href="/espace/compte" className="nb-pill nb-pill--dashed nb-mono px-3 py-1.5 text-[11px] normal-case">
          {email ?? "Mon compte"}
        </Link>
      </div>
      {open === "notif" && notifications ? <div className="absolute right-4 top-16 z-50">{notifications}</div> : null}
      {open === "contact" && contact ? <div className="absolute right-4 top-16 z-50">{contact}</div> : null}
    </header>
  );
}
