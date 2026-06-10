import type { ComponentType, ReactNode } from "react";
import { Marker } from "./sections-hero";

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

/** Copy deck §1 « Comment ça marche », mot pour mot. */
const STEPS: ReadonlyArray<{
  Icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}> = [
  {
    Icon: IconSearch,
    title: "Vérifiez",
    text: "Tapez votre adresse. On croise votre loyer avec les données publiques : DPE, indice des loyers, règles de votre ville.",
  },
  {
    Icon: IconPenLine,
    title: "Mandatez-nous",
    text: "Une signature en ligne, vos quittances, et c'est tout. Vous ne parlerez jamais loyer avec votre propriétaire — nous, si.",
  },
  {
    Icon: IconHandCoins,
    title: "Récupérez",
    text: "On réclame, on relance, on encaisse, on vous reverse. Notre commission : 25 % de ce qu'on récupère. Rien récupéré ? Rien payé.",
  },
];

export function StepsD3() {
  return (
    <section className="bg-paper-2 py-20 sm:py-24">
      <div className="mx-auto max-w-container px-6">
        <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
          Comment <Marker>ça marche</Marker>
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ Icon, title, text }) => (
            <article
              key={title}
              className="rounded-card border border-line bg-paper p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-badge bg-accent text-ink">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 font-display text-lg font-bold">{title}</h3>
              <p className="mt-3 leading-relaxed text-ink/70">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ConfianceD3() {
  return (
    <section className="mx-auto max-w-container px-6 py-20 sm:py-24">
      <div className="rounded-card bg-ink px-8 py-12 text-paper sm:px-14 sm:py-16">
        <h2 className="max-w-2xl font-display text-xl font-extrabold tracking-display sm:text-2xl">
          Nous faisons appliquer la loi. Rien de plus.
        </h2>
        <p className="mt-6 max-w-3xl leading-relaxed text-paper/75">
          Le gel des loyers des passoires thermiques, l&apos;indice de référence des loyers, les
          délais de restitution du dépôt de garantie : ce sont vos droits, écrits dans la loi.
          TropPayé les fait simplement respecter. Chaque calcul cite sa source. Chaque euro est
          tracé sur un compte dédié. Vos données restent en France.
        </p>
        <div className="mt-10 border-t border-paper/15 pt-8">
          <p className="font-mono text-lg font-medium tabular sm:text-xl">
            — € récupérés pour les locataires · — dossiers en cours
          </p>
          <p className="mt-2 text-xs text-paper/50">(compteur réel branché en P2)</p>
        </div>
      </div>
    </section>
  );
}
