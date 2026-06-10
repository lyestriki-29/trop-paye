import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { GenerateForm } from "./generate-form";
import { publishArticle, unpublishArticle } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const admin = getSupabaseAdmin();
  const { data: articles } = await admin
    .from("articles")
    .select("id, slug, title, topic, status, author, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-display">Guides &amp; articles</h1>
        <p className="mt-2 text-ink/70">
          Génère un brouillon (recherche web + sources), relis, puis publie. Aucun texte juridique
          n&apos;est publié sans relecture.
        </p>
      </div>

      <GenerateForm />

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink/60">
            <th className="py-2 pr-4 font-medium">Titre</th>
            <th className="py-2 pr-4 font-medium">Thème</th>
            <th className="py-2 pr-4 font-medium">Statut</th>
            <th className="py-2 pr-4 font-medium">Auteur</th>
            <th className="py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(articles ?? []).map((a) => (
            <tr key={a.id} className="border-b border-line/60 align-top">
              <td className="py-3 pr-4">
                <span className="font-medium">{a.title}</span>
                <span className="block font-mono text-xs text-ink/50">/{a.slug}</span>
              </td>
              <td className="py-3 pr-4 text-ink/70">{a.topic}</td>
              <td className="py-3 pr-4">
                <span
                  className={`rounded-badge px-2 py-0.5 text-xs ${
                    a.status === "PUBLISHED"
                      ? "bg-refund/10 text-refund-text"
                      : "bg-paper-2 text-ink/70"
                  }`}
                >
                  {a.status}
                </span>
              </td>
              <td className="py-3 pr-4 text-ink/70">{a.author}</td>
              <td className="py-3">
                <div className="flex flex-wrap gap-3">
                  {a.status === "PUBLISHED" ? (
                    <>
                      <Link href={`/guides/${a.slug}`} className="underline underline-offset-4">
                        Voir
                      </Link>
                      <form action={unpublishArticle}>
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="text-stamp underline underline-offset-4">
                          Dépublier
                        </button>
                      </form>
                    </>
                  ) : (
                    <form action={publishArticle}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="text-refund-text underline underline-offset-4">
                        Publier
                      </button>
                    </form>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {(articles ?? []).length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-ink/50">
                Aucun article pour le moment. Générez un premier brouillon ci-dessus.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
