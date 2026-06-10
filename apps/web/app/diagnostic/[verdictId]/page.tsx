import { getVerdictForSession } from "@/lib/diagnostic/verdict-read";
import { VerdictView } from "./VerdictView";
import { VerdictUnavailable } from "./VerdictUnavailable";

export const dynamic = "force-dynamic";

export default async function VerdictPage({
  params,
}: {
  params: Promise<{ verdictId: string }>;
}) {
  const { verdictId } = await params;
  const data = await getVerdictForSession(verdictId);
  // Introuvable ou session absente/étrangère → écran dédié (pas de notFound()
  // générique). Le teaser public pour les tiers arrive avec la Task 7.
  if (!data) return <VerdictUnavailable />;

  return (
    <VerdictView
      verdict={data.verdict}
      addressLabel={data.addressLabel}
      dossierId={data.dossierId}
      dpeNumber={data.dpeNumber}
    />
  );
}
