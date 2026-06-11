import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { safeRelativePath } from "@/lib/safe-redirect";
import { claimDossiersByEmail } from "@/lib/dossier/claim";

/** Échange le code du magic link contre une session, puis redirige. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRelativePath(searchParams.get("next"));

  if (code) {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Le magic link vient d'être ouvert (souvent dans un AUTRE navigateur que
      // la webview du diagnostic) : rattache les dossiers orphelins de cet email.
      const user = data.session?.user;
      if (user?.email) {
        try {
          await claimDossiersByEmail(user.id, user.email);
        } catch {
          /* best-effort : le login ne casse jamais pour un rattachement raté */
        }
      }
      // `next` est validé same-origin relatif → pas d'open-redirect.
      return NextResponse.redirect(new URL(next, origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
