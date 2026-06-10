import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-10">
        <Logo className="text-xl" />
      </Link>
      <h1 className="font-display text-2xl font-extrabold tracking-display">Connexion</h1>
      <p className="mt-2 mb-8 text-ink/70">Accédez au suivi de votre dossier.</p>
      <LoginForm next={next ?? "/espace"} />
    </main>
  );
}
