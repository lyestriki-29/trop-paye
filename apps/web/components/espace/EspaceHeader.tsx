"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

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
    <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3">
      <Link href="/espace" className="font-display text-lg font-extrabold tracking-display">
        TropPayé
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(open === "notif" ? null : "notif")}
          className="relative rounded-field px-3 py-2 text-sm text-ink/70 hover:bg-paper-2"
          aria-label="Notifications"
        >
          🔔
          {activityCount > 0 ? (
            <span className="absolute -right-0 -top-0 min-w-4 rounded-full bg-stamp px-1 text-[10px] text-paper">
              {activityCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setOpen(open === "contact" ? null : "contact")}
          className="rounded-field px-3 py-2 text-sm text-ink/70 hover:bg-paper-2"
        >
          Contact
        </button>
        <Link href="/espace/compte" className="rounded-field px-3 py-2 text-sm text-ink/70 hover:bg-paper-2">
          {email ?? "Mon compte"}
        </Link>
      </div>
      {open === "notif" && notifications ? <div className="absolute right-4 top-16 z-50">{notifications}</div> : null}
      {open === "contact" && contact ? <div className="absolute right-4 top-16 z-50">{contact}</div> : null}
    </header>
  );
}
