import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/guards";
import { signOut } from "@/app/login/actions";
import { LogoNb } from "@/components/ui/LogoNb";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdminPage();
  // Scope `.nb` (DA « quittance ») sur le back-office — même grammaire « dossier »
  // que l'espace client (décision Lyes 2026-06-20).
  return (
    <div className="nb min-h-screen">
      <header className="border-b-2 border-nb-ink bg-paper">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <LogoNb size={36} />
            <span className="nb-mono text-xs uppercase tracking-widest text-nb-ink/70">
              Back-office
            </span>
          </Link>
          <nav className="flex items-center gap-1.5 text-sm">
            <Link href="/admin" className="nb-pill nb-pill--dashed px-3 py-1.5 text-xs">Dossiers</Link>
            <Link href="/admin/courriers" className="nb-pill nb-pill--dashed px-3 py-1.5 text-xs">Courriers</Link>
            <Link href="/admin/funnel" className="nb-pill nb-pill--dashed px-3 py-1.5 text-xs">Funnel</Link>
            <Link href="/admin/articles" className="nb-pill nb-pill--dashed px-3 py-1.5 text-xs">Articles</Link>
            <span className="nb-mono ml-2 hidden text-xs text-nb-ink/55 sm:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="nb-mono text-xs uppercase tracking-wide text-nb-ink/60 underline underline-offset-4 transition hover:text-nb-ink">
                Quitter
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-container px-6 py-10">{children}</main>
    </div>
  );
}
