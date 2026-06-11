import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Stamp } from "@/components/ui/Stamp";

/** 404 globale (spec P3) — registre charte : calme, oriente sans culpabiliser. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-container flex-col items-start px-6 py-24 sm:py-32">
        <Stamp rotate={-4}>Erreur 404</Stamp>
        {/* TODO_COPY — page 404 (hors copy deck). */}
        <h1 className="mt-6 font-display text-mega font-extrabold tracking-display">
          Cette page n&apos;existe pas.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/70">
          L&apos;adresse a peut-être changé. Votre diagnostic et votre dossier, eux, sont
          toujours là.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/">Retour à l&apos;accueil</Button>
          <Link
            href="/diagnostic"
            className="inline-flex items-center px-2 py-2.5 text-sm font-semibold text-ink/70 underline-offset-2 transition hover:text-ink hover:underline"
          >
            Vérifier mon loyer
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
