import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { brand } from "@troppaye/shared";
import { Markdown } from "@/components/Markdown";
import { PublicShell } from "@/components/ui/PublicShell";
import { getSupabasePublic } from "@/lib/supabase/public";

/** ISR : gabarit guide quasi zéro JS. */
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

/** Gabarit guide — DA néubrutaliste (prose réinitialisée pour la lisibilité). */
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
    <PublicShell>
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-14 sm:pt-16">
        <nav aria-label="Fil d'Ariane" className="nb-mono text-xs uppercase tracking-widest">
          <Link href="/guides" className="text-nb-ink/50 transition hover:text-nb-ink">
            Guides
          </Link>
        </nav>

        <h1 className="mt-6 text-[clamp(32px,5vw,56px)]">{a.title}</h1>
        {a.excerpt ? (
          <p className="mt-5 font-nb-body text-lg leading-relaxed text-nb-ink/75">{a.excerpt}</p>
        ) : null}

        <div className="nb-prose mt-8 border-t-3 border-nb-ink pt-8 font-nb-body">
          <Markdown>{a.mdx}</Markdown>
        </div>

        {/* CTA guide → diagnostic. */}
        <aside className="nb-band-final mt-12 border-3 border-nb-ink p-8 shadow-nb">
          <p className="text-2xl">{brand.baseline}</p>
          <a
            href="/diagnostic"
            className="nb-card-hover mt-5 inline-flex border-3 border-nb-ink bg-paper px-6 py-3 font-nb-display text-base uppercase text-nb-ink shadow-nb-sm"
          >
            {brand.hero.cta}
          </a>
          <p className="mt-4 nb-mono text-xs uppercase tracking-wider opacity-70">
            {brand.hero.reassurance.join(" · ")}
          </p>
        </aside>

        {sources.length > 0 ? (
          <section className="mt-10 border-t-3 border-nb-ink pt-6">
            <h2 className="nb-mono text-sm font-semibold uppercase tracking-wide text-nb-ink/60">
              Sources
            </h2>
            <ul className="mt-3 space-y-1 font-nb-body text-sm">
              {sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    className="text-refund underline underline-offset-4"
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

        <p className="mt-10 border-3 border-nb-ink bg-paper p-5 nb-mono text-xs leading-relaxed text-nb-ink/60 shadow-nb-sm">
          {brand.disclaimer}
        </p>

        <script
          type="application/ld+json"
          // Échappe `<` pour empêcher tout breakout </script> depuis un titre/extrait généré.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </article>
    </PublicShell>
  );
}
