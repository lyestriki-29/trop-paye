import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/** Placeholder — le parcours de diagnostic est construit en tranche T2. */
export default function DiagnosticPage() {
  return (
    <main className="mx-auto max-w-container px-6 py-16">
      <Link href="/">
        <Logo className="text-xl" />
      </Link>
      <h1 className="mt-10 font-display text-2xl font-extrabold tracking-display">
        Où habitez-vous ?
      </h1>
      <p className="mt-3 text-ink/70">
        Le parcours de diagnostic arrive ici (tranche T2). {/* TODO_COPY */}
      </p>
    </main>
  );
}
