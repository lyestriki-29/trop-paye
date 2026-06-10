import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/with-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { decryptBytes } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/** Sert le PDF du mandat déchiffré au propriétaire (ou à un admin). */
export async function GET(_req: Request, { params }: { params: Promise<{ dossierId: string }> }) {
  let userId: string;
  try {
    userId = (await requireUser()).user.id;
  } catch {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const { dossierId } = await params;
  const admin = getSupabaseAdmin();

  const { data: dossier } = await admin
    .from("dossiers")
    .select("user_id")
    .eq("id", dossierId)
    .single();
  if (!dossier || dossier.user_id !== userId) {
    const { data: prof } = await admin.from("profiles").select("role").eq("id", userId).single();
    if (prof?.role !== "admin") return new NextResponse("Introuvable", { status: 404 });
  }

  const { data: mandate } = await admin
    .from("mandates")
    .select("pdf_url")
    .eq("dossier_id", dossierId)
    .maybeSingle();
  if (!mandate?.pdf_url) return new NextResponse("Introuvable", { status: 404 });

  const { data: blob, error } = await admin.storage.from("pieces").download(mandate.pdf_url);
  if (error || !blob) return new NextResponse("Introuvable", { status: 404 });

  const plain = decryptBytes(Buffer.from(await blob.arrayBuffer()));
  return new NextResponse(new Uint8Array(plain), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="mandat.pdf"' },
  });
}
