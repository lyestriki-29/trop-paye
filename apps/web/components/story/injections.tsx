import Image from "next/image";
import Link from "next/link";
import { formatEUR } from "@troppaye/shared";
import { Stamp } from "@/components/ui/Stamp";
import { casZero, notreHistoireCopy as copy } from "@/lib/content/notre-histoire";

/**
 * Injections du récit fondateur (phase 3 du plan notre-histoire) — composants
 * volontairement statiques (zéro animation : la seule animation forte du récit
 * vit sur /notre-histoire). Copy depuis le deck §7 exclusivement.
 */

/** Homepage : quittance miniature + 3 lignes + lien vers /notre-histoire. */
export function StoryTeaser() {
  const t = copy.injections.storyTeaser;
  return (
    <section className="mx-auto max-w-container px-6 py-16">
      <div className="flex flex-col items-start gap-8 rounded-card border border-line bg-paper p-7 sm:flex-row sm:items-center sm:p-10">
        {/* Quittance miniature statique (tampon affiché, pas d'animation). */}
        <div className="relative w-full max-w-[260px] shrink-0" aria-hidden>
          <div className="rounded-card border border-line bg-paper-2 p-4 font-mono text-[11px] text-ink/70">
            <p className="flex justify-between border-b border-dashed border-line pb-1.5">
              <span>{casZero.rentLabel}</span>
              <span className="tabular">{formatEUR(casZero.rentHcCents, { decimals: true })}</span>
            </p>
            <p className="-mx-1 mt-1.5 flex justify-between rounded-field bg-accent px-1 py-1 font-medium text-ink">
              <span>{casZero.supplementLabel}</span>
              <span className="tabular">
                {formatEUR(casZero.supplementCents, { decimals: true })}
              </span>
            </p>
          </div>
          <div className="pointer-events-none absolute -right-2 -top-3 scale-75">
            <Stamp rotate={-10}>{casZero.stamp}</Stamp>
          </div>
        </div>
        <div>
          {t.lines.map((line, i) => (
            <p key={i} className={i === 0 ? "font-display font-bold" : "mt-2 text-sm leading-relaxed text-ink/70"}>
              {line}
            </p>
          ))}
          <Link
            href="/notre-histoire"
            className="mt-4 inline-block text-sm font-medium text-refund-text underline-offset-4 hover:underline"
          >
            {t.linkLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Tunnel mandat (étape signature) : visage + une phrase de réassurance.
 * `reviewerName` paramétrable pour le jour où l'équipe de revue grandit.
 */
export function ReviewerReassurance({ reviewerName = "Nicolas" }: { reviewerName?: string }) {
  const r = copy.injections.reviewer;
  return (
    <aside className="mt-8 flex items-center gap-4 rounded-card border border-line bg-paper-2 p-4">
      <Image
        src="/story/nicolas.jpg"
        alt={r.photoAlt}
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-full border border-line object-cover"
      />
      <p className="text-sm leading-relaxed text-ink/75">
        <span className="font-medium text-ink">{reviewerName}</span> — {r.phrase}
      </p>
    </aside>
  );
}

/** Verdict positif UNIQUEMENT : une ligne discrète, pas un bloc. */
export function VerdictStoryLine() {
  return (
    <p className="mt-6 text-center text-sm text-ink/60">
      {copy.injections.verdictStoryLine}{" "}
      <Link
        href="/notre-histoire"
        className="font-medium text-ink/70 underline underline-offset-4 hover:text-ink"
      >
        Notre histoire
      </Link>
    </p>
  );
}

/** Signature courte du pied de page. */
export function FooterSignature() {
  return <p className="mt-6 text-sm italic text-ink/55">{copy.injections.footerSignature}</p>;
}
