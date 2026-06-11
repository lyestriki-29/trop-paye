import Image from "next/image";
import { Reveal } from "@/components/home/Reveal";
import { Button } from "@/components/ui/Button";
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
      <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-display sm:text-[44px]">
        {copy.hero.title}
      </h1>
      <p className="mt-4 max-w-prose leading-relaxed text-ink/70">{copy.hero.intro}</p>
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
        className="h-32 w-32 shrink-0 rounded-card border border-line object-cover sm:h-40 sm:w-40"
      />
      <div>
        <p className="font-display font-bold">
          {name} <span className="font-normal text-ink/55">· {role}</span>
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
        <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
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
        <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
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
        <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
          {copy.methode.title}
        </h2>
        <p className="mt-4 max-w-prose leading-relaxed text-ink/75">{copy.methode.intro}</p>
        <dl className="mt-8 rounded-card border border-line bg-paper">
          {copy.methode.mentions.map((m, i) => (
            <div
              key={i}
              className="flex flex-wrap items-baseline justify-between gap-3 border-b border-dashed border-line px-5 py-3.5 last:border-b-0"
            >
              <dt className="font-mono text-[11px] uppercase tracking-widest text-ink/55">
                {m.label}
              </dt>
              <dd className="text-sm text-ink/80">{m.value}</dd>
            </div>
          ))}
        </dl>
        {/* Phrase avocat : JAMAIS rendue tant que la relecture n'est pas actée. */}
        {siteFlags.legalReviewDone ? (
          <p className="mt-4 text-sm text-ink/60">{copy.legalReviewLine}</p>
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
        <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
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
        <div className="rounded-card border border-line bg-paper-2 px-7 py-9 text-center">
          <p className="font-display text-lg font-extrabold tracking-display">{copy.cta.title}</p>
          <Button href="/diagnostic" className="mt-5">
            {ctaLabel}
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
