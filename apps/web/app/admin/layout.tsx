import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/guards";
import { signOut } from "@/app/login/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdminPage();
  return (
    <div className="min-h-screen bg-paper-2">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-display font-extrabold tracking-display">
            TropPayé · back-office
          </Link>
          <nav className="flex items-center gap-5 text-sm text-ink/70">
            <Link href="/admin" className="hover:text-ink">Dossiers</Link>
            <Link href="/admin/articles" className="hover:text-ink">Articles</Link>
            <span className="hidden sm:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="underline underline-offset-4 hover:text-ink">
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
