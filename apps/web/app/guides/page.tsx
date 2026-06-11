import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/home/Reveal";
import { RevealInit } from "@/components/home/RevealInit";
import { PageHero } from "@/components/public/PageHero";
import { Marker } from "@/components/ui/Marker";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getSupabasePublic } from "@/lib/supabase/public";

export const metadata: Metadata = {
  /* TODO_COPY — title/description SEO à valider (socle P3). */
  title: "Guides — TropPayé",
  description: "Vos droits de locataire expliqués simplement : gel DPE, IRL, dépôt de garantie.",
  alternates: { canonical: "/guides" },
};

/** ISR (spec P3 : guides quasi zéro JS, rendu statique) — client public sans cookies. */
export const revalidate = 300;

const TOPIC_LABEL: Record<string, string> = {
  dpe: "Gel DPE",
  irl: "Révision IRL",
  depot: "Dépôt de garantie",
  encadrement: "Encadrement",
};

export default async function GuidesIndex() {
  const supabase = getSupabasePublic();
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, title, excerpt, topic, published_at")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <PageHero
        kicker="TropPayé · Guides"
        title={
          <>
            Vos droits, <Marker>expliqués</Marker>
          </>
        }
        lede="Vos droits, expliqués simplement. Chaque guide cite ses sources."
      />
      <main className="mx-auto max-w-container px-6 pb-24">
        <ul className="grid gap-6 md:grid-cols-2">
          {(articles ?? []).map((a, i) => (
            <Reveal key={a.slug} delay={0.05 + (i % 4) * 0.06} className="h-full">
              <li className="h-full">
                <Link
                  href={`/guides/${a.slug}`}
                  className="group flex h-full flex-col rounded-card border border-line bg-paper p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {a.topic ? (
                    <p className="font-mono text-xs font-medium uppercase tracking-widest text-ink/45">
                      {TOPIC_LABEL[a.topic] ?? a.topic}
                    </p>
                  ) : null}
                  <h2 className="mt-2 font-display text-lg font-bold leading-snug tracking-display group-hover:text-refund-text">
                    {a.title}
                  </h2>
                  {a.excerpt ? (
                    <p className="mt-2 leading-relaxed text-ink/70">{a.excerpt}</p>
                  ) : null}
                </Link>
              </li>
            </Reveal>
          ))}
          {(articles ?? []).length === 0 ? (
            <li className="rounded-card border border-dashed border-line bg-paper-2 p-8 text-ink/50 md:col-span-2">
              Les premiers guides arrivent bientôt.
            </li>
          ) : null}
        </ul>
      </main>
      <RevealInit />
      <SiteFooter />
    </>
  );
}
