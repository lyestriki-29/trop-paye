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
    .maybeSingle();
  if (!piece || !piece.storage_path) return new NextResponse("Introuvable", { status: 404 });

  const { data: dossier } = await admin
    .from("dossiers")
    .select("user_id")
    .eq("id", piece.dossier_id)
    .maybeSingle();

  const isOwner = dossier?.user_id === userId;
  if (!isOwner) {
    const { data: prof } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
    if (prof?.role !== "admin") return new NextResponse("Introuvable", { status: 404 });
    // Traçabilité RGPD : un admin consulte la pièce d'un dossier qui n'est pas le sien.
    await admin.from("access_logs").insert({
      dossier_id: piece.dossier_id,
      actor_id: userId,
      action: "admin_view_piece",
    });
  }

  const { data: blob, error } = await admin.storage.from("pieces").download(piece.storage_path);
  if (error || !blob) return new NextResponse("Introuvable", { status: 404 });

  let plain: Buffer;
  try {
    const cipher = Buffer.from(await blob.arrayBuffer());
    plain = piece.encrypted ? decryptBytes(cipher) : cipher;
  } catch {
    return new NextResponse("Document illisible", { status: 422 });
  }
  // Contenu UPLOADÉ par l'utilisateur : on force le téléchargement (jamais de rendu inline)
  // + anti-sniffing + sandbox, pour neutraliser tout XSS stocké (ex. HTML déguisé en pièce).
  const safeName = (piece.kind || "piece").replace(/[^a-z0-9_-]/gi, "");
  return new NextResponse(new Uint8Array(plain), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
    },
  });
}
