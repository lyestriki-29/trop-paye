import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * proxy.ts (ex-middleware en Next 16) — rafraîchit la session Supabase à chaque
 * requête. NE PORTE AUCUNE AUTORISATION (les gardes réelles sont dans les pages
 * et Server Actions). Runtime Node.
 */
export async function proxy(request: NextRequest) {
  // Une seule réponse, construite une fois : setAll y dépose les cookies de refresh
  // sans la reconstruire (évite de perdre d'éventuels en-têtes posés en amont).
  const response = NextResponse.next({ request });

  // Attribution acquisition first-party : `?src=tiktok-hook1` → cookie 30 j.
  // Premier contact conservé (pas d'écrasement) ; slug strict, jamais de PII.
  const src = request.nextUrl.searchParams.get("src");
  if (src && /^[\w-]{1,64}$/.test(src) && !request.cookies.get("tp_src")) {
    response.cookies.set("tp_src", src, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
