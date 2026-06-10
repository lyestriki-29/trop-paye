import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { Markdown } from "@/components/Markdown";
import { Logo } from "@/components/brand/Logo";
import { brand } from "@troppaye/shared";

export const dynamic = "force-dynamic";

interface SourceRef {
  label: string;
  url: string;
}

async function getArticle(slug: string) {
  const supabase = await getSupabaseServer();
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
  return { title: `${a.title} — TropPayé`, description: a.excerpt ?? undefined };
}

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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/guides">
        <Logo className="text-lg" />
      </Link>

      <article className="mt-10">
        <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-display">
          {a.title}
        </h1>
        {a.excerpt ? <p className="mt-3 text-lg text-ink/70">{a.excerpt}</p> : null}
        <div className="mt-6">
          <Markdown>{a.mdx}</Markdown>
        </div>

        {sources.length > 0 ? (
          <section className="mt-10 border-t border-line pt-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/60">
              Sources
            </h2>
            <ul className="mt-2 space-y-1 text-sm">
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} className="text-refund-text underline underline-offset-4" rel="noreferrer" target="_blank">
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
  );
}
