import Link from "next/link";
import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Guides — TropPayé",
  description: "Vos droits de locataire expliqués simplement : gel DPE, IRL, dépôt de garantie.",
};

export const dynamic = "force-dynamic";

export default async function GuidesIndex() {
  const supabase = await getSupabaseServer();
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, title, excerpt, topic, published_at")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/">
        <Logo className="text-lg" />
      </Link>
      <h1 className="mt-10 font-display text-[32px] font-extrabold tracking-display">Guides</h1>
      <p className="mt-3 text-lg text-ink/70">
        Vos droits, expliqués simplement. Chaque guide cite ses sources.
      </p>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {(articles ?? []).map((a) => (
          <li key={a.slug} className="py-5">
            <Link href={`/guides/${a.slug}`} className="group block">
              <h2 className="font-display text-lg font-bold tracking-display group-hover:text-refund-text">
                {a.title}
              </h2>
              {a.excerpt ? <p className="mt-1 text-ink/70">{a.excerpt}</p> : null}
            </Link>
          </li>
        ))}
        {(articles ?? []).length === 0 ? (
          <li className="py-8 text-center text-ink/50">Les premiers guides arrivent bientôt.</li>
        ) : null}
      </ul>
    </main>
  );
}
