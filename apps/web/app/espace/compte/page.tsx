import { requireAuthPage } from "@/lib/auth/guards";
import { getSupabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const { user } = await requireAuthPage("/espace/compte");
  const sb = await getSupabaseServer();
  const { data: p } = await sb
    .from("profiles")
    .select("first_name, last_name, phone, email_notifications")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Mon compte</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-ink/60 underline underline-offset-4 hover:text-ink"
          >
            Déconnexion
          </button>
        </form>
      </div>

      <ProfileForm
        initial={{
          firstName: p?.first_name ?? null,
          lastName: p?.last_name ?? null,
          phone: p?.phone ?? null,
          emailNotifications: p?.email_notifications ?? true,
        }}
      />

      <section className="rounded-card border border-line bg-paper-2 p-5">
        <h2 className="font-display text-lg font-bold">Vos données (RGPD)</h2>
        <p className="mt-2 text-sm text-ink/60">
          Vous pouvez demander l'export ou la suppression de votre compte. La suppression efface
          l'ensemble de vos données en cascade.
        </p>
        <p className="mt-3 text-sm text-ink/60">
          Pour exercer vos droits, écrivez-nous à{" "}
          <a
            href="mailto:contact@troppaye.fr"
            className="underline underline-offset-4 hover:text-ink"
          >
            contact@troppaye.fr
          </a>
          . Nous traitons votre demande dans les meilleurs délais.
        </p>
      </section>
    </div>
  );
}
