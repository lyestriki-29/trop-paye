import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "./login-form";
import { DevLoginButtons } from "./DevLoginButtons";

/**
 * Connexion — DA « quittance » (réf. LP néubrutaliste, variante B arbitrée Lyes
 * 2026-06-20). La carte d'auth EST un reçu d'accès : en-tête + réf mono, champ
 * locataire, CTA encre, code-barres et perforation en pied. Seuil public→espace :
 * c'est la seule surface authentifiée portant le scope `.nb`.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="nb flex min-h-screen items-center justify-center px-6 py-14">
      <div className="nb-card w-full max-w-sm bg-paper px-7 py-7">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Accueil TropPayé">
            <Logo className="text-lg" />
          </Link>
          <span className="nb-mono text-xs text-nb-ink/55">N° ACCÈS</span>
        </div>
        <div className="my-4 border-t-2 border-nb-ink" />
        <p className="nb-mono text-xs uppercase tracking-widest text-nb-ink/55">Reçu d&apos;accès</p>
        <h1 className="mt-1 text-2xl">Votre dossier</h1>
        <p className="mt-2 mb-6 text-sm text-nb-ink/70">Accédez au suivi de votre dossier.</p>

        <LoginForm next={next ?? "/espace"} />

        {/* DEV uniquement : connexion démo 1 clic (caché en production). */}
        {process.env.NODE_ENV !== "production" ? <DevLoginButtons /> : null}

        {/* Perforation + code-barres : le bas « se détache » comme un reçu. */}
        <div className="mt-6 border-t-2 border-dashed border-nb-ink/40 pt-3">
          <div className="v3-barcode h-9 w-full" aria-hidden />
          <p className="nb-mono mt-2 text-center text-[10px] tracking-[0.3em] text-nb-ink/45">
            TROPPAYE · ACCES · 2026
          </p>
        </div>
      </div>
    </main>
  );
}
