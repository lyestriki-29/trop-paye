import Link from "next/link";
import { brand } from "@troppaye/shared";
import { Logo } from "@/components/brand/Logo";
import { Stamp } from "@/components/brand/Stamp";

export default function Home() {
  return (
    <main className="mx-auto max-w-container px-6">
      <header className="flex items-center justify-between border-b border-line py-6">
        <Logo className="text-xl" />
        <span className="hidden text-sm text-ink/60 sm:inline">
          {brand.baseline}
        </span>
      </header>

      <section className="grid items-center gap-12 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
        <div>
          <h1 className="font-display text-[40px] font-extrabold leading-[1.04] tracking-display md:text-hero">
            {brand.hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/80">
            {brand.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href="/diagnostic"
              className="rounded-field bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-ink/90"
            >
              {brand.hero.cta}
            </Link>
            <span className="text-sm text-ink/60">
              {brand.hero.reassurance.join(" · ")}
            </span>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <Stamp size={200} />
        </div>
      </section>
    </main>
  );
}
