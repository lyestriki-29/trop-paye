import Link from "next/link";
import { brand } from "@troppaye/shared";
import { QuittanceCard } from "@/components/ui/QuittanceCard";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-container px-6">
        <section className="grid items-center gap-12 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div>
            <h1 className="reveal-1 font-display text-[40px] font-extrabold leading-[1.04] tracking-display md:text-hero">
              {brand.hero.title}
            </h1>
            <div className="reveal-2">
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
          </div>
          <div className="reveal-3 mx-auto w-full max-w-md md:mx-0 md:justify-self-end">
            {/* TODO_COPY — libellés spécimen hérités du témoin v2 (hors copy deck). */}
            <QuittanceCard
              reference="Réf. dossier TP-2026-0117"
              kind="Quittance de loyer"
              meta="12 rue des Lilas, 75011 Paris"
              rows={[
                { label: "Loyer hors charges", cents: 102_185 },
                { label: "Plafond légal (gel DPE F/G)", cents: 95_000 },
                { label: "Différence mensuelle", cents: 7_185, highlight: true },
              ]}
              total={{ label: "Trop-perçu sur la période", cents: 143_700 }}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
