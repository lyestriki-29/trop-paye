/**
 * Seed des guides SEO (brouillons) : upsert de lib/content/guides-dpe.json dans
 * `articles` en statut DRAFT. Lyes relit (TODO_VERIFIER à trancher) puis publie
 * via le back-office — RIEN n'est publié par ce script.
 * `pnpm --filter @troppaye/web db:seed-guides` (Supabase démarré).
 * Idempotent : upsert par slug, ne touche jamais un article déjà PUBLISHED.
 */
import path from "node:path";
import { readFileSync } from "node:fs";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(path.resolve(process.cwd(), "../.."));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.");
}
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

interface GuideDraft {
  slug: string;
  title: string;
  excerpt: string;
  mdx: string;
  sources: { label: string; url: string }[];
}

async function main() {
  const guides = JSON.parse(
    readFileSync(path.resolve(process.cwd(), "lib/content/guides-dpe.json"), "utf8"),
  ) as GuideDraft[];

  for (const g of guides) {
    const { data: existing } = await admin
      .from("articles")
      .select("status")
      .eq("slug", g.slug)
      .maybeSingle();
    if (existing?.status === "PUBLISHED") {
      console.log(`= ${g.slug} déjà PUBLISHED — non touché.`);
      continue;
    }
    const { error } = await admin.from("articles").upsert(
      {
        slug: g.slug,
        title: g.title,
        excerpt: g.excerpt,
        mdx: g.mdx,
        sources: g.sources,
        topic: "dpe",
        status: "DRAFT",
        author: "claude-brouillon",
      },
      { onConflict: "slug" },
    );
    if (error) throw new Error(`${g.slug}: ${error.message}`);
    console.log(`+ ${g.slug} (DRAFT, ${g.mdx.length} caractères)`);
  }
  console.log("Seed guides terminé — relecture + publication via back-office.");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
