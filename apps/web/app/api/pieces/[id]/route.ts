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
  // Aperçu sûr : on rend INLINE uniquement les types sans script exécutable (PDF +
  // images raster), reconnus par leur SIGNATURE binaire — jamais par l'extension
  // (falsifiable). Tout le reste (HTML, SVG, inconnu) reste en téléchargement forcé.
  // Défense en profondeur du rendu inline :
  //  - `nosniff` : le navigateur respecte le Content-Type déclaré et ne re-sniffe pas
  //    un PDF/image en text/html → un polyglotte HTML déguisé n'est jamais exécuté.
  //  - `sandbox` SANS allow-same-origin : origine opaque. Même si un PDF embarque du JS
  //    (/OpenAction), il ne peut pas toucher cookies/session du site (le viewer en
  //    désactive l'essentiel par ailleurs). La CSP ne « neutralise » pas le JS PDF
  //    lui-même — c'est l'isolation d'origine qui protège la session.
  //  - `no-store` : la pièce est déchiffrée à la volée ; on ne la laisse JAMAIS en
  //    cache disque/proxy (RGPD, poste partagé) — d'autant plus en aperçu inline.
  const safeName = (piece.kind || "piece").replace(/[^a-z0-9_-]/gi, "");
  const previewType = sniffPreviewableType(plain);
  return new NextResponse(new Uint8Array(plain), {
    headers: {
      "Content-Type": previewType ?? "application/octet-stream",
      "Content-Disposition": `${previewType ? "inline" : "attachment"}; filename="${safeName}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Type MIME d'aperçu SÛR si le contenu est un PDF ou une image raster (aucun script
 * exécutable), reconnu par sa signature binaire (magic bytes). null = type non
 * prévisualisable en sécurité (HTML, SVG, inconnu) → téléchargement forcé.
 */
function sniffPreviewableType(buf: Buffer): string | null {
  if (buf.length >= 5 && buf.toString("latin1", 0, 5) === "%PDF-") return "application/pdf";
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return "image/png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf.length >= 12 &&
    buf.toString("latin1", 0, 4) === "RIFF" &&
    buf.toString("latin1", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}
