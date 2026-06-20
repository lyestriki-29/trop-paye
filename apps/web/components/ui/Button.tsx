import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "accent" | "ghost" | "nb" | "nb-ink";

const BASE =
  "inline-flex items-center justify-center gap-2 transition focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
// Grammaire charte (sobre) : coins arrondis, ombre douce, anneau de focus encre.
const CHARTE =
  "rounded-badge font-display font-bold focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2";
// Grammaire « quittance » (nb) : pilule à bord dur + ombre pleine (cf. login B).
// La classe `.nb-pill` porte bord/ombre ; le focus est géré par son `:focus-visible`.
const NB = "nb-pill font-display font-black uppercase tracking-wide";
const VARIANT: Record<ButtonVariant, string> = {
  primary: `${CHARTE} bg-ink text-paper shadow-md hover:-translate-y-0.5 hover:shadow-lg`,
  accent: `${CHARTE} bg-accent text-ink shadow-md hover:-translate-y-0.5 hover:shadow-lg`,
  ghost: `${CHARTE} border border-line bg-paper text-ink hover:border-ink/30 hover:shadow-sm`,
  nb: NB,
  "nb-ink": `${NB} nb-pill--ink`,
};
const SIZE = { md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" } as const;

interface CommonProps {
  variant?: ButtonVariant;
  size?: keyof typeof SIZE;
  children: ReactNode;
  className?: string;
}
type AsButton = CommonProps & ComponentPropsWithoutRef<"button"> & { href?: undefined };
type AsLink = CommonProps & { href: string };

export function Button(props: AsButton | AsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className ?? ""}`;
  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  const { variant: _v, size: _s, className: _c, ...rest } = props;
  return (
    <button type="button" {...rest} className={cls}>
      {children}
    </button>
  );
}
