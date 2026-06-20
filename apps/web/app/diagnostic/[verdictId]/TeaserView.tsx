import Link from "next/link";
import { brand, formatEUR } from "@troppaye/shared";
import { LogoNb } from "@/components/ui/LogoNb";
import { Button } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/home/icons";
import type { VerdictTeaser } from "@/lib/diagnostic/verdict-teaser";

/**
 * Page teaser PUBLIQUE (plan P2 Task 7 Step 4) — ce que voit un TIERS qui ouvre
 * un lien de verdict sans le cookie de session du diagnostic. Anonymisé strict
 * (RGPD) : montant + type d'irrégularité + ville si verdict chiffré, AUCUNE autre
 * donnée du dossier (jamais l'adresse, jamais le détail). Le verdict complet
 * reste lié au cookie du locataire.
 */
export function TeaserView({ teaser }: { teaser: VerdictTeaser }) {
  const amountCents = teaser.amountCents;
  const meta = [teaser.kindLabel, teaser.city].filter(Boolean).join(" · ");

  return (
    <main className="nb flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <Link href="/" aria-label={`${brand.name} — accueil`}>
        <LogoNb size={64} />
      </Link>

      {/* TODO_COPY — accroche teaser (hors copy deck), brouillon non juridique. */}
      <h1 className="mt-10 max-w-xl font-display text-2xl font-extrabold tracking-display sm:text-[34px] sm:leading-[1.25]">
        {amountCents !== null ? (
          <>
            Ce diagnostic a trouvé{" "}
            <span className="whitespace-nowrap rounded-field bg-accent px-2 text-ink">
              <span className="font-mono font-medium tabular">{formatEUR(amountCents)}</span>
            </span>{" "}
            à récupérer.
          </>
        ) : (
          <>Ce locataire a vérifié son loyer.</>
        )}
      </h1>

      {amountCents !== null && meta ? (
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink/55">{meta}</p>
      ) : null}

      {/* Copy deck §1 verbatim — l'invitation à faire son propre test. */}
      <p className="mt-5 max-w-md leading-relaxed text-ink/70">{brand.hero.subtitle}</p>

      <Button href="/" size="lg" className="group mt-8">
        {brand.hero.cta}
        <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Button>

      {/* TODO_COPY — note pour le locataire qui retombe ici depuis un autre appareil. */}
      <p className="mt-6 max-w-md text-xs leading-relaxed text-ink/45">
        C&apos;est votre diagnostic ? Ouvrez le lien sur l&apos;appareil utilisé pour le test :
        le détail complet y reste accessible.
      </p>

      <p className="mt-10 max-w-md text-xs leading-relaxed text-ink/45">{brand.disclaimer}</p>
    </main>
  );
}
