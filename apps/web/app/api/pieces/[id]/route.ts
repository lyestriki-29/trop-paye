import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/with-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { decryptBytes } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/** Sert une pièce déchiffrée au propriétaire du dossier (ou à un admin). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string;
  try {
    userId = (await requireUser()).user.id;
  } catch {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const { id } = await params;
  const admin = getSupabaseAdmin();
  const { data: piece } = await admin
    .from("pieces")
    .select("storage_path, kind, dossier_id, encrypted")
    .eq("id", id)
    .single();
  if (!piece || !piece.storage_path) return new NextResponse("Introuvable", { status: 404 });

  const { data: dossier } = await admin
    .from("dossiers")
    .select("user_id")
    .eq("id", piece.dossier_id)
    .single();

  if (!dossier || dossier.user_id !== userId) {
    const { data: prof } = await admin.from("profiles").select("role").eq("id", userId).single();
    if (prof?.role !== "admin") return new NextResponse("Introuvable", { status: 404 });
  }

  const { data: blob, error } = await admin.storage.from("pieces").download(piece.storage_path);
  if (error || !blob) return new NextResponse("Introuvable", { status: 404 });

  const cipher = Buffer.from(await blob.arrayBuffer());
  const plain = piece.encrypted ? decryptBytes(cipher) : cipher;
  return new NextResponse(new Uint8Array(plain), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `inline; filename="${piece.kind}"`,
    },
  });
}
