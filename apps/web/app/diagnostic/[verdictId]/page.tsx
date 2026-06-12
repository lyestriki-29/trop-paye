import type { Metadata } from "next";
import { after } from "next/server";
import { brand, formatEUR } from "@troppaye/shared";
import { getVerdictForSession } from "@/lib/diagnostic/verdict-read";
import { getVerdictTeaser } from "@/lib/diagnostic/verdict-teaser";
import { getReferentials } from "@/lib/referentials";
import { evaluateSnapshotRange } from "@troppaye/rules-engine";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { trackEvent } from "@/lib/track";
import { VerdictView } from "./VerdictView";
import { VerdictUnavailable } from "./VerdictUnavailable";
import { TeaserView } from "./TeaserView";

export const dynamic = "force-dynamic";

interface VerdictPageProps {
  params: Promise<{ verdictId: string }>;
}

/**
 * OG/Twitter (plan P2 Task 7 Step 4) — UNIQUEMENT pour un verdict chiffré, à
 * partir du teaser anonymisé : jamais l'adresse, jamais le détail du dossier.
 */
export async function generateMetadata({ params }: VerdictPageProps): Promise<Metadata> {
  const { verdictId } = await params;
  const teaser = await getVerdictTeaser(verdictId);
  if (!teaser || teaser.amountCents === null) return {};

  // TODO_COPY — phrase de partage (gabarit OG validé / étude concurrence).
  const title = `J'ai vérifié mon loyer : ${formatEUR(teaser.amountCents)} à récupérer`;
  const description = brand.hero.subtitle;
  const ogImage = `/api/og/${verdictId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: brand.name,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function VerdictPage({ params }: VerdictPageProps) {
  const { verdictId } = await params;

  // Propriétaire (cookie de session du diagnostic) → verdict complet d'emblée.
  const data = await getVerdictForSession(verdictId);
  if (data) {
    // Inversion 2026-06-12 (décision Lyes) : on NE masque plus le résultat. Le
    // verdict s'affiche, puis on propose le récap par email. `hasLead` cache le
    // module de capture une fois l'email posé (lead unique par dossier).
    const { data: lead } = await getSupabaseAdmin()
      .from("leads")
      .select("id")
      .eq("dossier_id", data.dossierId)
      .maybeSingle();
    const hasLead = Boolean(lead);

    // Jalon funnel PRD §5 — dédupliqué à la lecture par count(distinct dossier_id).
    // after() : la mesure ne retarde jamais l'affichage du verdict.
    after(() => trackEvent("verdict_affiche", { dossierId: data.dossierId }));

    // Boosters (LOT 2) : snapshot + référentiels passés au module client pour
    // l'aperçu live ; le serveur reste autoritaire (booster-actions.ts).
    const referentials = data.snapshot
      ? await getReferentials({ snapshot: data.snapshot, asOf: data.verdict.asOf })
      : null;
    // Fourchette (hypothèse complément) calculée à la lecture depuis le snapshot.
    const range =
      data.snapshot && referentials
        ? evaluateSnapshotRange(data.snapshot, referentials, data.verdict.asOf)
        : null;
    return (
      <VerdictView
        verdict={data.verdict}
        addressLabel={data.addressLabel}
        dossierId={data.dossierId}
        dpeNumber={data.dpeNumber}
        range={range}
        verdictId={verdictId}
        hasLead={hasLead}
        boosters={
          data.snapshot && referentials
            ? { verdictId, snapshot: data.snapshot, referentials }
            : undefined
        }
      />
    );
  }

  // Tiers (session absente ou étrangère) MAIS verdict existant → teaser public
  // anonymisé. Verdict inexistant → écran dédié (pas de notFound() générique).
  const teaser = await getVerdictTeaser(verdictId);
  if (!teaser) return <VerdictUnavailable />;
  return <TeaserView teaser={teaser} />;
}
