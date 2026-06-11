import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { safeEqual } from "@/lib/crypto";
import { runCronDue } from "@/lib/pipeline/run";
import { flushOutbox } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * Exécuteur de la séquence de relance. Protégé par CRON_SECRET (comparaison timing-safe),
 * idempotent (claim par `executed_at`), lit `recovery_state` avant tout envoi (skip si PAUSED/LOCKED).
 * Vide ensuite l'outbox email (no-op tant que Brevo n'est pas branché).
 */
export async function POST(request: Request) {
  if (!safeEqual(request.headers.get("x-cron-secret"), env.CRON_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runCronDue(new Date().toISOString());
  const outbox = await flushOutbox();
  return NextResponse.json({ ...result, outbox });
}
