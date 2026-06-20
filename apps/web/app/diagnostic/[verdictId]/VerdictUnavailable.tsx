import Link from "next/link";
import { brand } from "@troppaye/shared";
import { LogoNb } from "@/components/ui/LogoNb";
import { Button } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/home/icons";

/**
 * Verdict introuvable ou session expirée (plan P2 Task 6 Step 4) : écran
 * dédié à la place du `notFound()` générique. Le verdict est lié au cookie
 * de session de l'appareil qui a fait le diagnostic — on n'explique pas
 * plus (pas d'oracle sur l'existence d'un dossier).
 */
export function VerdictUnavailable() {
  return (
    <main className="nb flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <Link href="/" aria-label={`${brand.name} — accueil`}>
        <LogoNb size={64} />
      </Link>

      {/* TODO_COPY — titre et explication de cet écran (hors copy deck). */}
      <h1 className="mt-10 max-w-md font-display text-2xl font-extrabold tracking-display sm:text-[34px] sm:leading-[1.15]">
        Ce verdict n&apos;est plus accessible.
      </h1>
      <p className="mt-4 max-w-md leading-relaxed text-ink/70">
        Le lien a expiré, ou il a été ouvert depuis un autre appareil que celui du diagnostic.
        Refaites la vérification : deux minutes suffisent, et c&apos;est gratuit.
      </p>

      <Button href="/" size="lg" className="group mt-8">
        {brand.hero.cta}
        <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Button>

      <p className="mt-10 max-w-md text-xs leading-relaxed text-ink/45">{brand.disclaimer}</p>
    </main>
  );
}
