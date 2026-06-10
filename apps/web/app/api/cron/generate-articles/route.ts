import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { getLLMProvider } from "@/lib/content/llm";
import { env } from "@/lib/env";

/** Cibles SEO par défaut (planifiable : 1 appel/semaine via /schedule). */
const TARGETS = [
  { keyword: "augmentation loyer dpe g interdite", topic: "dpe" },
  { keyword: "calcul augmentation loyer irl", topic: "irl" },
  { keyword: "depot de garantie non rendu delai", topic: "depot" },
];

/**
 * Génère des BROUILLONS d'articles (jamais publiés automatiquement).
 * Protégé par CRON_SECRET. Mode mock tant qu'aucune clé Anthropic n'est fournie.
 */
export async function POST(request: Request) {
  if (request.headers.get("x-cron-secret") !== env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const provider = getLLMProvider();
  const created: string[] = [];

  for (const target of TARGETS) {
    const draft = await provider.generateDraft(target);
    const { data: existing } = await admin
      .from("articles")
      .select("id")
      .eq("slug", draft.slug)
      .maybeSingle();
    if (existing) continue;

    const { error } = await admin.from("articles").insert({
      slug: draft.slug,
      title: draft.title,
      topic: target.topic,
      keyword: target.keyword,
      excerpt: draft.excerpt,
      mdx: draft.markdown,
      sources: draft.sources as unknown as Json,
      status: "DRAFT",
      author: "auto",
    });
    if (!error) created.push(draft.slug);
  }

  return NextResponse.json({ created, mode: provider.mode });
}
