"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/with-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { getLLMProvider } from "@/lib/content/llm";

export interface GenerateState {
  ok?: boolean;
  slug?: string;
  mode?: "mock" | "anthropic";
  error?: string;
}

const genSchema = z.object({
  keyword: z.string().min(3, "Mot-clé trop court (3 caractères min.)"),
  topic: z.enum(["dpe", "irl", "depot", "encadrement", "default"]),
});

export async function generateArticleDraft(
  _prev: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  await requireAdmin();
  const parsed = genSchema.safeParse({
    keyword: String(formData.get("keyword") ?? "").trim(),
    topic: String(formData.get("topic") ?? "dpe"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Entrée invalide" };

  const provider = getLLMProvider();
  const draft = await provider.generateDraft(parsed.data);
  const admin = getSupabaseAdmin();

  for (let i = 0; i < 3; i += 1) {
    const slug = i === 0 ? draft.slug : `${draft.slug}-${i + 1}`;
    const { error } = await admin.from("articles").insert({
      slug,
      title: draft.title,
      topic: parsed.data.topic,
      keyword: parsed.data.keyword,
      excerpt: draft.excerpt,
      mdx: draft.markdown,
      sources: draft.sources as unknown as Json,
      status: "DRAFT",
      author: "auto",
    });
    if (!error) {
      revalidatePath("/admin/articles");
      return { ok: true, slug, mode: provider.mode };
    }
    if (error.code !== "23505") return { error: error.message };
  }
  return { error: "Conflit de slug — réessayez avec un autre mot-clé." };
}

export async function publishArticle(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id"));
  await getSupabaseAdmin()
    .from("articles")
    .update({ status: "PUBLISHED", published_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/articles");
  revalidatePath("/guides");
}

export async function unpublishArticle(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id"));
  await getSupabaseAdmin()
    .from("articles")
    .update({ status: "DRAFT", published_at: null })
    .eq("id", id);
  revalidatePath("/admin/articles");
  revalidatePath("/guides");
}
