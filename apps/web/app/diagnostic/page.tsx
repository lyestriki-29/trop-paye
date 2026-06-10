import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Questionnaire } from "./questionnaire/Questionnaire";

export default function DiagnosticPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <Link href="/" className="inline-block">
        <Logo className="text-xl" />
      </Link>
      <Questionnaire />
    </main>
  );
}
