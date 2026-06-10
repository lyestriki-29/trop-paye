import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Récupère l'utilisateur courant (ou null) + le client serveur. */
export async function getCurrentUser() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

/** Garde de page : redirige vers /login si non connecté. */
export async function requireAuthPage(next = "/espace") {
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return { user, supabase };
}

/** Garde de page admin : rôle vérifié EN BASE (pas seulement côté UI). */
export async function requireAdminPage() {
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (data as { role: string } | null)?.role;
  if (role !== "admin") redirect("/");
  return { user, supabase };
}
