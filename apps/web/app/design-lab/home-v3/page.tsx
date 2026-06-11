import Link from "next/link";

/**
 * Design-lab « home v3 — dossier d'instruction » : ARBITRÉE (Lyes, 2026-06-11,
 * « je valide la home v3 ») et promue en production. Les sections vivent dans
 * components/home/v3/ ; cette page reste comme trace d'arbitrage.
 */
export default function HomeV3Lab() {
  return (
    <main className="mx-auto max-w-container px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-refund-text">
        ✓ Arbitrée : EN PROD depuis le 2026-06-11
      </p>
      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-display">
        Home v3 « dossier d&apos;instruction »
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
        Cette direction a été validée par Lyes et promue sur la home réelle. Les
        sections sont désormais dans <code className="font-mono">components/home/v3/</code>.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block font-medium text-refund-text underline-offset-2 hover:underline"
      >
        Voir la home en production →
      </Link>
    </main>
  );
}
