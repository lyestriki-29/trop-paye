import Link from "next/link";
import { requireAuthPage } from "@/lib/auth/guards";
import { signOut } from "@/app/login/actions";
import { Logo } from "@/components/brand/Logo";

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAuthPage("/espace");
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
          <Link href="/espace">
            <Logo className="text-lg" />
          </Link>
          <div className="flex items-center gap-4 text-sm text-ink/70">
            <span className="hidden sm:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="underline underline-offset-4 hover:text-ink">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-container px-6 py-10">{children}</main>
    </div>
  );
}
