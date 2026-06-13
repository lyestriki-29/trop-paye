import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/home/Reveal";
import { PageHeroNb } from "@/components/public/PageHeroNb";
import { PublicShell } from "@/components/ui/PublicShell";
import { getSupabasePublic } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Guides — TropPayé",
  description:
    "Vos droits de locataire expliqués simplement : gel DPE, IRL, dépôt de garantie.",
  alternates: { canonical: "/guides" },
};

/** ISR : guides quasi zéro JS, rendu statique. */
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
    <PublicShell>
      <PageHeroNb
        kicker="TropPayé · Guides"
        title={
          <>
            Vos droits, <span className="nb-mark">expliqués</span>
          </>
        }
        lede="Vos droits, expliqués simplement. Chaque guide cite ses sources."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-container px-6">
          <ul className="grid gap-6 md:grid-cols-2">
            {(articles ?? []).map((a, i) => (
              <Reveal key={a.slug} delay={0.05 + (i % 4) * 0.06} className="h-full">
                <li className="h-full">
                  <Link
                    href={`/guides/${a.slug}`}
                    className="nb-tilt nb-card flex h-full flex-col p-7"
                  >
                    {a.topic ? (
                      <p className="nb-mono text-[11px] font-semibold uppercase tracking-widest text-nb-ink/45">
                        {TOPIC_LABEL[a.topic] ?? a.topic}
                      </p>
                    ) : null}
                    <h2 className="mt-3 text-xl">{a.title}</h2>
                    {a.excerpt ? (
                      <p className="mt-3 font-nb-body leading-relaxed text-nb-ink/75">
                        {a.excerpt}
                      </p>
                    ) : null}
                  </Link>
                </li>
              </Reveal>
            ))}
            {(articles ?? []).length === 0 ? (
              <li className="border-3 border-dashed border-nb-ink bg-paper p-8 font-nb-body text-nb-ink/60 md:col-span-2">
                Les premiers guides arrivent bientôt.
              </li>
            ) : null}
          </ul>
        </div>
      </section>
    </PublicShell>
  );
}
