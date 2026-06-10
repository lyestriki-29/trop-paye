import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { brand } from "@troppaye/shared";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getSupabasePublic } from "@/lib/supabase/public";

/** ISR (spec P3 : gabarit guide quasi zéro JS) — client public sans cookies. */
export const revalidate = 300;

interface SourceRef {
  label: string;
  url: string;
}

async function getArticle(slug: string) {
  const supabase = getSupabasePublic();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return {};
  return {
    title: `${a.title} — TropPayé`,
    description: a.excerpt ?? undefined,
    alternates: { canonical: `/guides/${a.slug}` },
  };
}

/** Gabarit guide v2 (P3) — composition arbitrée via /design-lab/sections/gabarit-guide. */
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();

  const sources = (Array.isArray(a.sources) ? a.sources : []) as unknown as SourceRef[];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt ?? undefined,
    datePublished: a.published_at ?? undefined,
    author: { "@type": "Organization", name: brand.name },
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-14 sm:pt-16">
        <nav aria-label="Fil d'Ariane" className="font-mono text-xs uppercase tracking-widest">
          <Link href="/guides" className="text-ink/50 transition hover:text-ink">
            Guides
          </Link>
        </nav>

        <article className="mt-6">
          <h1 className="font-display text-2xl font-extrabold leading-tight tracking-display sm:text-[40px]">
            {a.title}
          </h1>
          {a.excerpt ? (
            <p className="mt-4 text-lg leading-relaxed text-ink/70">{a.excerpt}</p>
          ) : null}

          <div className="mt-8 border-t border-line pt-8">
            <Markdown>{a.mdx}</Markdown>
          </div>

          {/* CTA guide → diagnostic (pages villes v1 = CTA, pas de simulateur intégré). */}
          <aside className="mt-10 rounded-card bg-accent px-7 py-8 text-ink">
            <p className="font-display text-lg font-extrabold tracking-display">
              {/* Copy deck §1 — baseline et CTA, mot pour mot. */}
              {brand.baseline}
            </p>
            <div className="mt-4">
              <Button href="/diagnostic">{brand.hero.cta}</Button>
            </div>
            <p className="mt-3 text-sm font-medium text-ink/70">
              {brand.hero.reassurance.join(" · ")}
            </p>
          </aside>

          {sources.length > 0 ? (
            <section className="mt-10 border-t border-line pt-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/60">
                Sources
              </h2>
              <ul className="mt-2 space-y-1 text-sm">
                {sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      className="text-refund-text underline underline-offset-4"
                      rel="noreferrer"
                      target="_blank"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-10 rounded-card border border-line bg-paper-2 p-4 text-sm text-ink/60">
            {brand.disclaimer}
          </p>
        </article>

        <script
          type="application/ld+json"
          // Échappe `<` pour empêcher tout breakout </script> depuis un titre/extrait généré.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
