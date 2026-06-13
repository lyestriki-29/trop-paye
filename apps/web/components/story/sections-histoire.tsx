import Image from "next/image";
import { Reveal } from "@/components/home/Reveal";
import { CaseProofList } from "@/components/story/CaseProofList";
import { QuittanceStamped } from "@/components/story/QuittanceStamped";
import { siteFlags } from "@/lib/config";
import { notreHistoireCopy as copy } from "@/lib/content/notre-histoire";

/** §1 — HERO « cas zéro » : la quittance tamponnée, seule animation forte. */
export function HeroCasZero() {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-14 sm:pt-20">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink/55">
        {copy.hero.kicker}
      </p>
      <h1 className="mt-3 text-[clamp(32px,5vw,56px)]">{copy.hero.title}</h1>
      <p className="mt-5 max-w-prose font-nb-body text-lg leading-relaxed text-nb-ink/75">
        {copy.hero.intro}
      </p>
      <QuittanceStamped className="mt-10" />
    </section>
  );
}

function Voice({
  name,
  role,
  photo,
  photoAlt,
  paragraphs,
  flip,
}: {
  name: string;
  role: string;
  photo: string;
  photoAlt: string;
  paragraphs: readonly string[];
  flip?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-6 sm:items-start ${flip ? "sm:flex-row-reverse" : "sm:flex-row"}`}>
      <Image
        src={photo}
        alt={photoAlt}
        width={160}
        height={160}
        className="h-32 w-32 shrink-0 border-3 border-nb-ink object-cover shadow-nb-sm sm:h-40 sm:w-40"
      />
      <div>
        <p className="font-nb-body text-lg font-bold">
          {name} <span className="font-normal text-nb-ink/55">· {role}</span>
        </p>
        {paragraphs.map((p, i) => (
          <p key={i} className="mt-3 max-w-prose leading-relaxed text-ink/75">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

/** §2 — Récit du duo : alternance des deux voix. */
export function DuoSection() {
  const { duo } = copy;
  return (
    <section className="mx-auto max-w-2xl px-6 pt-20">
      <Reveal>
        <h2 className="text-[clamp(24px,3.5vw,40px)]">
          {duo.title}
        </h2>
        <div className="mt-8 space-y-10">
          <Voice
            name={duo.founder.name}
            role={duo.founder.role}
            photo="/story/founder.jpg"
            photoAlt={duo.founder.photoAlt}
            paragraphs={duo.founder.paragraphs}
          />
          <Voice
            name={duo.nicolas.name}
            role={duo.nicolas.role}
            photo="/story/nicolas.jpg"
            photoAlt={duo.nicolas.photoAlt}
            paragraphs={duo.nicolas.paragraphs}
            flip
          />
        </div>
      </Reveal>
    </section>
  );
}

/** §3 — La bascule. */
export function BasculeSection() {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-20">
      <Reveal>
        <h2 className="text-[clamp(24px,3.5vw,40px)]">
          {copy.bascule.title}
        </h2>
        {copy.bascule.paragraphs.map((p, i) => (
          <p key={i} className="mt-4 max-w-prose leading-relaxed text-ink/75">
            {p}
          </p>
        ))}
      </Reveal>
    </section>
  );
}

/** §4 — La méthode : mentions type document officiel, sobres. */
export function MethodeSection() {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-20">
      <Reveal>
        <h2 className="text-[clamp(24px,3.5vw,40px)]">
          {copy.methode.title}
        </h2>
        <p className="mt-4 max-w-prose font-nb-body leading-relaxed text-nb-ink/75">
          {copy.methode.intro}
        </p>
        <dl className="mt-8 border-3 border-nb-ink bg-paper shadow-nb">
          {copy.methode.mentions.map((m, i) => (
            <div
              key={i}
              className="flex flex-wrap items-baseline justify-between gap-3 border-b border-dashed border-nb-ink/20 px-5 py-3.5 last:border-b-0"
            >
              <dt className="nb-mono text-[11px] uppercase tracking-widest text-nb-ink/55">
                {m.label}
              </dt>
              <dd className="font-nb-body text-sm text-nb-ink/80">{m.value}</dd>
            </div>
          ))}
        </dl>
        {/* Phrase avocat : JAMAIS rendue tant que la relecture n'est pas actée. */}
        {siteFlags.legalReviewDone ? (
          <p className="mt-4 font-nb-body text-sm text-nb-ink/60">{copy.legalReviewLine}</p>
        ) : null}
      </Reveal>
    </section>
  );
}

/** §5 — Preuve sociale. */
export function PreuveSection() {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-20">
      <Reveal>
        <h2 className="text-[clamp(24px,3.5vw,40px)]">
          {copy.preuve.title}
        </h2>
        <div className="mt-6">
          <CaseProofList />
        </div>
      </Reveal>
    </section>
  );
}

/** §6 — CTA sobre vers /diagnostic (bouton = CTA du deck §1). */
export function CtaSection({ ctaLabel }: { ctaLabel: string }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <Reveal>
        <div className="border-3 border-nb-ink bg-accent px-7 py-10 text-center shadow-nb">
          <p className="text-2xl">{copy.cta.title}</p>
          <a
            href="/diagnostic"
            className="nb-card-hover mt-6 inline-flex border-3 border-nb-ink bg-paper px-6 py-3 font-nb-display text-base uppercase text-nb-ink shadow-nb-sm"
          >
            {ctaLabel}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
