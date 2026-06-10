import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { safeRelativePath } from "@/lib/safe-redirect";

/** Échange le code du magic link contre une session, puis redirige. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRelativePath(searchParams.get("next"));

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // `next` est validé same-origin relatif → pas d'open-redirect.
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
