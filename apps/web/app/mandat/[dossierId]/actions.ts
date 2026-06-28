"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertTransition, type DossierStatus } from "@troppaye/shared";
import { formatEur } from "@troppaye/rules-engine";
import { renderTemplate } from "@troppaye/templates";
import { withAuth, requireUser } from "@/lib/auth/with-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { renderLegalPdf } from "@/lib/pdf/document-pdf";
import { getSignatureProvider } from "@/lib/providers/signature";
import { encryptBytes } from "@/lib/crypto";
import { queueEmail } from "@/lib/notify";
import { env } from "@/lib/env";
import { trackEvent } from "@/lib/track";

const MAX_PIECE_BYTES = 10 * 1024 * 1024;
const PIECE_KINDS = ["bail", "quittance", "dpe", "edl", "rib", "autre"] as const;
const FEE_RATE_BPS = 2500; // 25 % — source unique du barème (figé dans le PDF à la signature)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ActionResult = { ok: true } | { error: string };

const signSchema = z.object({
  dossierId: z.string().uuid(),
  signerName: z.string().trim().min(2).max(120),
  consent: z.literal(true),
  // Bailleur = destinataire des courriers : exigé À la signature (l'info est
  // sur le bail/quittances que le locataire a sous les yeux à cette étape).
  landlordName: z.string().trim().min(2).max(160),
  landlordAddress: z.string().trim().min(10).max(300),
  landlordKind: z.enum(["PARTICULIER", "SCI", "AGENCE"]),
  // L221-18 : cochée = exécution immédiate demandée (J0 sans attendre 14 j).
  immediateExecution: z.boolean(),
});

/** Signature MAISON du mandat : fige le PDF, scelle la preuve, passe le dossier en MANDATE_PENDING. */
export const signMandate = withAuth(signSchema, async (input, { user }): Promise<ActionResult> => {
  // Palier 2 fermé (décision 2026-06-11) : pas de signature tant que société +
  // formalités R124 absentes — l'UI affiche la liste d'attente, ceci est la
  // ceinture côté serveur si quelqu'un appelle l'action directement.
  if (!env.MANDATE_ENABLED) {
    return { error: "Le pilote est complet pour le moment — vous êtes sur la liste d'attente." };
  }

  const admin = getSupabaseAdmin();
  const { data: dossier } = await admin
    .from("dossiers")
    .select("id, user_id, status, address_label")
    .eq("id", input.dossierId)
    .single();
  if (!dossier || dossier.user_id !== user.id) return { error: "Dossier introuvable." };
  if (dossier.status !== "DIAGNOSED") return { error: "Le mandat ne peut pas être signé à cette étape." };

  // Garde anti double-signature (back-button / rejeu) : un mandat déjà signé n'est pas réécrit.
  const { data: existing } = await admin
    .from("mandates")
    .select("status")
    .eq("dossier_id", input.dossierId)
    .maybeSingle();
  if (existing?.status === "SIGNED") return { error: "Ce mandat est déjà signé." };

  const { data: verdict } = await admin
    .from("verdicts")
    .select("total_recoverable_cents")
    .eq("dossier_id", input.dossierId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const consentedAt = new Date().toISOString();
  const markdown = renderTemplate("mandate", {
    dossierRef: input.dossierId.slice(0, 8),
    date: consentedAt.slice(0, 10),
    tenantName: input.signerName,
    tenantAddress: dossier.address_label ?? "—",
    recoverableAmount: formatEur(verdict?.total_recoverable_cents ?? 0),
    feeRatePct: String(FEE_RATE_BPS / 100),
  });
  const pdf = await renderLegalPdf(markdown);

  const h = await headers();
  const proof = getSignatureProvider().sign(pdf, {
    signerName: input.signerName,
    ip: h.get("x-forwarded-for") ?? undefined,
    userAgent: h.get("user-agent") ?? undefined,
    consentedAt,
  });

  const path = `${user.id}/dossiers/${input.dossierId}/mandat.pdf`;
  const { error: upErr } = await admin.storage
    .from("pieces")
    .upload(path, encryptBytes(pdf), { contentType: "application/octet-stream", upsert: true });
  if (upErr) return { error: "Échec de l'enregistrement du document." };

  const { data: mandate, error: mErr } = await admin
    .from("mandates")
    .upsert(
      { dossier_id: input.dossierId, status: "SIGNED", fee_rate_bps: FEE_RATE_BPS, signed_at: consentedAt, pdf_url: path },
      { onConflict: "dossier_id" },
    )
    .select("id")
    .single();
  if (mErr || !mandate) return { error: "Échec de l'enregistrement du mandat." };

  // La preuve est indispensable (valeur juridique) : si elle échoue, on ne transitionne pas.
  const { error: proofErr } = await admin.from("signature_proofs").insert({
    dossier_id: input.dossierId,
    mandate_id: mandate.id,
    signer_name: proof.signerName,
    document_hash: proof.documentHash,
    proof_hmac: proof.proofHmac,
    ip: proof.ip ?? null,
    user_agent: proof.userAgent ?? null,
    consented_at: proof.consentedAt,
  });
  if (proofErr) return { error: "Impossible d'enregistrer la preuve de signature." };

  assertTransition(dossier.status as DossierStatus, "MANDATE_PENDING");
  await admin
    .from("dossiers")
    .update({
      status: "MANDATE_PENDING",
      landlord_name: input.landlordName,
      landlord_address: input.landlordAddress,
      landlord_kind: input.landlordKind,
      immediate_execution: input.immediateExecution,
    })
    .eq("id", input.dossierId);

  await trackEvent("mandat_signe", { dossierId: input.dossierId });

  if (user.email) {
    await queueEmail({
      dossierId: input.dossierId,
      toEmail: user.email,
      subject: "Votre mandat TropPayé est signé",
      body: "Votre mandat a bien été enregistré. Ajoutez vos pièces pour lancer l'étude du dossier.",
      template: "mandate_signed",
    });
  }

  revalidatePath(`/mandat/${input.dossierId}`);
  return { ok: true };
});

/** Upload d'une pièce : chiffrement AES-256-GCM puis stockage privé + ligne `pieces`. */
export async function uploadPiece(formData: FormData): Promise<ActionResult> {
  const { user } = await requireUser();
  const dossierId = String(formData.get("dossierId") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const file = formData.get("file");
  if (!UUID_RE.test(dossierId)) return { error: "Dossier invalide." };
  if (!PIECE_KINDS.includes(kind as (typeof PIECE_KINDS)[number])) return { error: "Type de pièce invalide." };
  if (!(file instanceof File)) return { error: "Fichier manquant." };

  const admin = getSupabaseAdmin();
  const { data: dossier } = await admin
    .from("dossiers")
    .select("id, user_id, status")
    .eq("id", dossierId)
    .single();
  if (!dossier || dossier.user_id !== user.id) return { error: "Dossier introuvable." };

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0) return { error: "Fichier vide." };
  if (bytes.length > MAX_PIECE_BYTES) return { error: "Fichier trop volumineux (max 10 Mo)." };

  const path = `${user.id}/dossiers/${dossierId}/${kind}-${Date.now()}`;
  const { error: upErr } = await admin.storage
    .from("pieces")
    .upload(path, encryptBytes(bytes), { contentType: "application/octet-stream" });
  if (upErr) return { error: "Échec de l'upload." };

  const { error: pieceErr } = await admin.from("pieces").insert({
    dossier_id: dossierId,
    kind,
    storage_path: path,
    status: "RECEIVED",
    encrypted: true,
  });
  // L'objet est déjà en storage : si la ligne échoue, on nettoie pour éviter un orphelin.
  if (pieceErr) {
    await admin.storage.from("pieces").remove([path]);
    return { error: "Impossible d'enregistrer la pièce." };
  }

  await maybeAdvanceToReview(dossierId, dossier.status as DossierStatus, user.email ?? null);
  revalidatePath(`/mandat/${dossierId}`);
  revalidatePath(`/espace/${dossierId}`, "layout");
  return { ok: true };
}

/** Socle minimal de pièces fourni (bail + au moins une quittance) → passage en IN_REVIEW. */
async function maybeAdvanceToReview(
  dossierId: string,
  status: DossierStatus,
  userEmail: string | null,
): Promise<void> {
  if (status !== "MANDATE_PENDING") return;
  const admin = getSupabaseAdmin();
  const { data: pieces } = await admin.from("pieces").select("kind").eq("dossier_id", dossierId);
  const kinds = new Set((pieces ?? []).map((p) => p.kind));
  if (kinds.has("bail") && kinds.has("quittance")) {
    assertTransition("MANDATE_PENDING", "IN_REVIEW");
    await admin.from("dossiers").update({ status: "IN_REVIEW" }).eq("id", dossierId);
    if (userEmail) {
      await queueEmail({
        dossierId,
        toEmail: userEmail,
        subject: "Votre dossier TropPayé est en étude",
        body: "Nous avons bien reçu vos pièces. Votre dossier passe en étude.",
        template: "review_started",
      });
    }
  }
}
