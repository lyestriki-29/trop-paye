import { notFound } from "next/navigation";
import { getVerdictForSession } from "@/lib/diagnostic/verdict-read";
import { VerdictView } from "./VerdictView";

export const dynamic = "force-dynamic";

export default async function VerdictPage({
  params,
}: {
  params: Promise<{ verdictId: string }>;
}) {
  const { verdictId } = await params;
  const data = await getVerdictForSession(verdictId);
  if (!data) notFound();

  return <VerdictView verdict={data.verdict} addressLabel={data.addressLabel} />;
}
