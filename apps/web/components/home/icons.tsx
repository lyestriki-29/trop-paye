import type { ReactNode } from "react";

/**
 * Glyphes Lucide officiels (search, pen-line, hand-coins, arrow-right) inlinés :
 * `lucide-react` n'est pas installé dans le workspace — tracés identiques à la
 * lib, à remplacer par les imports `lucide-react` dès l'ajout de la dépendance.
 */
function LucideIcon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function IconSearch({ className }: { className?: string }) {
  return (
    <LucideIcon className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </LucideIcon>
  );
}

export function IconPenLine({ className }: { className?: string }) {
  return (
    <LucideIcon className={className}>
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </LucideIcon>
  );
}

export function IconHandCoins({ className }: { className?: string }) {
  return (
    <LucideIcon className={className}>
      <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
      <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
      <path d="m2 16 6 6" />
      <circle cx="16" cy="9" r="2.9" />
      <circle cx="6" cy="5" r="3" />
    </LucideIcon>
  );
}

export function IconArrowRight({ className }: { className?: string }) {
  return (
    <LucideIcon className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </LucideIcon>
  );
}
