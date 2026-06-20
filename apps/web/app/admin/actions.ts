"use server";

import { revalidatePath } from "next/cache";
import { assertTransition, type DossierStatus } from "@troppaye/shared";
import { requireAdmin } from "@/lib/auth/with-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { actionScheduleFor } from "@/lib/pipeline/schedule";
import { advanceDossier } from "@/lib/pipeline/run";
import { getPaymentProvider } from "@/lib/providers/payment";
import { queueEmail } from "@/lib/notify";
import { trackEvent } from "@/lib/track";

export type AdminResult = { ok: true } | { error: string };

function refresh(dossierId: string): void {
  revalidatePath(`/admin/dossiers/${dossierId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
}

async function loadStatus(dossierId: string): Promise<DossierStatus | null> {
  const { data } = await getSupabaseAdmin()
    .from("dossiers")
    .select("status")
    .eq("id", dossierId)
    .single();
  return (data?.status as DossierStatus | undefined) ?? null;
}

/**
 * Valide un dossier → RECOVERY + planifie J0/J21/J35/J50. Garde-fous code :
 * LOW bloqué ; bailleur (nom + adresse postale) obligatoire — sans lui, aucun
 * courrier ne peut physiquement partir ; rétractation L221-18 : sans demande
 * d'exécution immédiate, le J0 attend signature du mandat + 14 jours.
 */
export async function validateDossier(dossierId: string): Promise<AdminResult> {
  await requireAdmin();
  const admin = getSupabaseAdmin();
  const { data: dossier } = await admin
    .from("dossiers")
    .select("status, landlord_name, landlord_address, immediate_execution")
    .eq("id", dossierId)
    .single();
  if (dossier?.status !== "IN_REVIEW") return { error: "Dossier non éligible à la validation." };
  if (!dossier.landlord_name?.trim() || !dossier.landlord_address?.trim()) {
    return {
      error:
        "Bailleur manquant (nom + adresse postale) : à compléter avant validation — aucun courrier ne peut partir sans destinataire.",
    };
  }

  const { data: verdict } = await admin
    .from("verdicts")
    .select("confidence")
    .eq("dossier_id", dossierId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!verdict) return { error: "Aucun verdict calculé pour ce dossier." };
  if (verdict.confidence === "LOW") {
    return { error: "Confiance LOW : validation bloquée tant que le dossier n'est pas consolidé." };
  }

  assertTransition("IN_REVIEW", "RECOVERY");
  // Transition atomique : seul le premier appel concurrent passe (évite la double planification).
  const { data: claimed } = await admin
    .from("dossiers")
    .update({ status: "RECOVERY", recovery_state: "SCHEDULED" })
    .eq("id", dossierId)
    .eq("status", "IN_REVIEW")
    .select("id")
    .maybeSingle();
  if (!claimed) return { error: "Dossier déjà traité." };

  // Rétractation L221-18 (corrigé revue 2026-06-11) : le jour de la signature ne
  // compte pas, le délai expire à la FIN du 14e jour, prorogé au 1er jour ouvré
  // s'il tombe un week-end (L221-19 / art. R. computation) → le J0 part au plus
  // tôt le LENDEMAIN de l'expiration. Jour de signature pris en Europe/Paris.
  // Jours fériés non câblés (TODO_VERIFIER [AVOCAT]) : l'opérateur poste à la
  // main et reste le dernier filet humain.
  let j0 = new Date().toISOString().slice(0, 10);
  if (!dossier.immediate_execution) {
    const { data: mandate } = await admin
      .from("mandates")
      .select("signed_at")
      .eq("dossier_id", dossierId)
      .maybeSingle();
    if (mandate?.signed_at) {
      // fr-CA → format YYYY-MM-DD directement.
      const signedParisDay = new Intl.DateTimeFormat("fr-CA", {
        timeZone: "Europe/Paris",
      }).format(new Date(mandate.signed_at));
      const expiry = new Date(`${signedParisDay}T00:00:00Z`);
      expiry.setUTCDate(expiry.getUTCDate() + 14); // fin du 14e jour suivant la signature
      while (expiry.getUTCDay() === 0 || expiry.getUTCDay() === 6) {
        expiry.setUTCDate(expiry.getUTCDate() + 1); // prorogation samedi/dimanche
      }
      expiry.setUTCDate(expiry.getUTCDate() + 1); // J0 = lendemain de l'expiration
      const cooloffISO = expiry.toISOString().slice(0, 10);
      if (cooloffISO > j0) j0 = cooloffISO;
    }
  }
  const { error: actErr } = await admin
    .from("actions")
    .insert(actionScheduleFor(j0).map((s) => ({ dossier_id: dossierId, type: s.type, scheduled_at: s.scheduled_at })));
  if (actErr) return { error: "Impossible de planifier la séquence de relance." };

  refresh(dossierId);
  return { ok: true };
}

/** Refuse un dossier (IN_REVIEW → CLOSED). */
export async function refuseDossier(dossierId: string, reason: string): Promise<AdminResult> {
  await requireAdmin();
  const status = await loadStatus(dossierId);
  if (status !== "IN_REVIEW") return { error: "Dossier non éligible au refus." };
  assertTransition("IN_REVIEW", "CLOSED");
  const admin = getSupabaseAdmin();
  await admin.from("dossiers").update({ status: "CLOSED" }).eq("id", dossierId);
  await admin.from("messages").insert({
    dossier_id: dossierId,
    sender: "operator",
    body: reason.trim() || "Dossier clôturé après étude.",
  });
  refresh(dossierId);
  return { ok: true };
}

/** Demande une pièce complémentaire (message opérateur, statut inchangé). */
export async function requestPiece(dossierId: string, note: string): Promise<AdminResult> {
  await requireAdmin();
  const text = note.trim();
  if (!text) return { error: "Précisez la pièce demandée." };
  const admin = getSupabaseAdmin();
  await admin.from("messages").insert({ dossier_id: dossierId, sender: "operator", body: text });
  refresh(dossierId);
  return { ok: true };
}

/**
 * Réponse LIBRE de l'opérateur au client (visible dans son espace `/espace/.../messages`).
 * Distincte de `requestPiece` (demande typée) et `refuseDossier` (clôture) : ici message
 * conversationnel quel que soit le statut du dossier. N'envoie pas d'email (notification
 * branchée dans une tranche ultérieure).
 */
export async function sendAdminMessage(dossierId: string, body: string): Promise<AdminResult> {
  await requireAdmin();
  const text = body.trim();
  if (!text) return { error: "Message vide." };
  if (text.length > 4000) return { error: "Message trop long (4000 caractères max)." };
  const admin = getSupabaseAdmin();
  await admin.from("messages").insert({ dossier_id: dossierId, sender: "operator", body: text });
  refresh(dossierId);
  return { ok: true };
}

/** Les 4 réponses bailleur typées du PRD D2, chacune avec son effet scripté. */
export type LandlordReplyTag =
  | "PAIEMENT"
  | "CONTESTATION_FORME"
  | "CONTESTATION_FOND"
  | "DEMANDE_DELAI";

/**
 * Tag : réponse du bailleur (PRD D2). PAIEMENT / CONTESTATION_FORME → pause
 * (traitement opérateur) ; CONTESTATION_FOND → escalade verrouillée ;
 * DEMANDE_DELAI → décale les relances restantes de `delayDays` (séquence active).
 */
export async function tagLandlordReply(
  dossierId: string,
  tag: LandlordReplyTag,
  delayDays = 15,
): Promise<AdminResult> {
  await requireAdmin();
  if (tag === "CONTESTATION_FOND") return tagContestation(dossierId);

  const admin = getSupabaseAdmin();
  if (tag === "DEMANDE_DELAI") {
    if (!Number.isInteger(delayDays) || delayDays < 1 || delayDays > 90) {
      return { error: "Délai invalide (1 à 90 jours)." };
    }
    const { data: pending } = await admin
      .from("actions")
      .select("id, scheduled_at")
      .eq("dossier_id", dossierId)
      .is("executed_at", null)
      .not("scheduled_at", "is", null);
    for (const a of pending ?? []) {
      const shifted = new Date(a.scheduled_at as string);
      shifted.setDate(shifted.getDate() + delayDays);
      await admin.from("actions").update({ scheduled_at: shifted.toISOString() }).eq("id", a.id);
    }
  } else {
    // PAIEMENT / CONTESTATION_FORME : pause — l'opérateur encaisse ou répond, puis reprend.
    await admin.from("dossiers").update({ recovery_state: "PAUSED" }).eq("id", dossierId);
  }

  await admin.from("actions").insert({
    dossier_id: dossierId,
    type: "LANDLORD_REPLY",
    executed_at: new Date().toISOString(),
    payload: { tag, ...(tag === "DEMANDE_DELAI" ? { delayDays } : {}) },
  });
  refresh(dossierId);
  return { ok: true };
}

/**
 * Saisie du n° de recommandé par l'opérateur (file /admin/courriers) : marque
 * le courrier POSTED — c'est CE moment qui fait foi (et notifie le client),
 * pas le rendu du PDF. Claim atomique sur post_status.
 */
export async function markPosted(actionId: string, trackingNumber: string): Promise<AdminResult> {
  await requireAdmin();
  const tracking = trackingNumber.trim();
  if (tracking.length < 4 || tracking.length > 40) {
    return { error: "Numéro de suivi invalide." };
  }

  const admin = getSupabaseAdmin();
  const { data: posted } = await admin
    .from("actions")
    .update({
      post_status: "POSTED",
      tracking_number: tracking,
      posted_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .eq("post_status", "TO_POST")
    .select("id, dossier_id, type")
    .maybeSingle();
  if (!posted) return { error: "Courrier introuvable ou déjà pointé." };

  // Notification client (réelle, maintenant que le pli est posté) — best-effort.
  try {
    const { data: dossier } = await admin
      .from("dossiers")
      .select("user_id")
      .eq("id", posted.dossier_id)
      .single();
    if (dossier?.user_id) {
      const { data: u } = await admin.auth.admin.getUserById(dossier.user_id);
      if (u.user?.email) {
        await queueEmail({
          dossierId: posted.dossier_id,
          toEmail: u.user.email,
          // TODO_COPY — notification d'envoi (hors copy deck).
          subject: "Votre dossier TropPayé avance",
          body: `Un courrier recommandé a été envoyé à votre bailleur (suivi n° ${tracking}). Vous n'avez rien à faire : nous suivons la réponse.`,
          template: posted.type,
        });
      }
    }
  } catch {
    /* outbox best-effort */
  }

  if (posted.type === "LETTER_J0") {
    await trackEvent("j0_envoye", { dossierId: posted.dossier_id });
  }
  refresh(posted.dossier_id);
  revalidatePath("/admin/courriers");
  return { ok: true };
}

/** Reprend une séquence en pause (PAUSED → SCHEDULED). */
export async function resumeRecovery(dossierId: string): Promise<AdminResult> {
  await requireAdmin();
  await getSupabaseAdmin().from("dossiers").update({ recovery_state: "SCHEDULED" }).eq("id", dossierId);
  refresh(dossierId);
  return { ok: true };
}

/** Tag : contestation de fond → VERROUILLE la séquence + escalade. */
export async function tagContestation(dossierId: string): Promise<AdminResult> {
  await requireAdmin();
  const status = await loadStatus(dossierId);
  if (status !== "RECOVERY") return { error: "Escalade possible seulement en recouvrement." };
  assertTransition("RECOVERY", "ESCALATED");
  const admin = getSupabaseAdmin();
  await admin
    .from("dossiers")
    .update({ status: "ESCALATED", recovery_state: "LOCKED" })
    .eq("id", dossierId);
  await admin.from("actions").insert({
    dossier_id: dossierId,
    type: "ESCALATION",
    executed_at: new Date().toISOString(),
  });
  refresh(dossierId);
  return { ok: true };
}

/**
 * Encaissement — gère le paiement TOTAL comme l'ÉCHELONNÉ (PRD D2, courrier
 * J+35 « échéancier possible ») : chaque versement crée IN + OUT_FEE +
 * OUT_TENANT (commission par encaissement, sur le cash réellement reçu —
 * jamais sur l'économie future). `agreedTotalCents` (optionnel, 1ʳᵉ saisie)
 * fige le montant convenu : WON quand Σ IN l'atteint ; sans accord → un
 * versement = solde de tout compte (comportement historique).
 * Pilote mono-opérateur : pas de verrou inter-versements (commenté, assumé).
 */
export async function recordPayment(
  dossierId: string,
  amountCents: number,
  agreedTotalCents?: number,
): Promise<AdminResult> {
  await requireAdmin();
  if (!Number.isInteger(amountCents) || amountCents <= 0) return { error: "Montant invalide." };
  if (
    agreedTotalCents !== undefined &&
    (!Number.isInteger(agreedTotalCents) || agreedTotalCents < amountCents)
  ) {
    return { error: "Montant convenu invalide (inférieur au versement ?)." };
  }

  const admin = getSupabaseAdmin();
  // Claim ATOMIQUE anti double-submit (revue 2026-06-11) : seul le premier appel
  // concurrent pose payment_claimed_at — le second sort AVANT tout mouvement
  // d'argent. Libéré en fin d'action (succès comme erreur).
  const { data: claimedDossier } = await admin
    .from("dossiers")
    .update({ payment_claimed_at: new Date().toISOString() })
    .eq("id", dossierId)
    .is("payment_claimed_at", null)
    .select("status, agreed_total_cents")
    .maybeSingle();
  if (!claimedDossier) {
    return {
      error:
        "Un encaissement est déjà en cours sur ce dossier (double-clic ?). Vérifier les mouvements avant de réessayer.",
    };
  }
  const releaseClaim = async () => {
    await admin.from("dossiers").update({ payment_claimed_at: null }).eq("id", dossierId);
  };

  const dossier = claimedDossier;
  const status = (dossier?.status ?? null) as DossierStatus | null;
  if (status !== "RECOVERY" && status !== "ESCALATED") {
    await releaseClaim();
    return { error: "Encaissement possible seulement en recouvrement/escalade." };
  }

  // Reversement = virement manuel V1 : exiger les coordonnées AVANT d'enregistrer
  // quoi que ce soit (sinon le dossier gagne sans pouvoir payer le locataire).
  const { data: payout } = await admin
    .from("payout_details")
    .select("id")
    .eq("dossier_id", dossierId)
    .maybeSingle();
  if (!payout) {
    await releaseClaim();
    return { error: "Coordonnées de reversement absentes (IBAN client) : à recueillir d'abord." };
  }

  // Montant convenu : posé à la première saisie, jamais réécrit ensuite.
  let agreed = dossier?.agreed_total_cents ?? null;
  if (agreed === null && agreedTotalCents !== undefined) {
    agreed = agreedTotalCents;
    await admin.from("dossiers").update({ agreed_total_cents: agreed }).eq("id", dossierId);
  }

  const { data: mandate } = await admin
    .from("mandates")
    .select("fee_rate_bps")
    .eq("dossier_id", dossierId)
    .maybeSingle();
  const feeBps = mandate?.fee_rate_bps ?? 2500;
  const fee = Math.round((amountCents * feeBps) / 10000);
  const tenant = amountCents - fee;

  const payment = getPaymentProvider();
  const incoming = await payment.recordIncoming(dossierId, amountCents);
  const out = await payment.payout(dossierId, tenant);

  const { error: fErr } = await admin.from("fund_movements").insert([
    { dossier_id: dossierId, direction: "IN", amount_cents: amountCents, reference: incoming.reference },
    { dossier_id: dossierId, direction: "OUT_FEE", amount_cents: fee, reference: incoming.reference },
    { dossier_id: dossierId, direction: "OUT_TENANT", amount_cents: tenant, reference: out.reference },
  ]);
  const { error: aErr } = await admin.from("actions").insert([
    { dossier_id: dossierId, type: "PAYMENT_RECEIVED", executed_at: new Date().toISOString() },
    { dossier_id: dossierId, type: "PAYOUT_SENT", executed_at: new Date().toISOString() },
  ]);
  if (fErr || aErr) {
    // On NE libère PAS le claim : état incohérent possible, intervention humaine
    // requise avant tout nouvel encaissement (le message UI explique).
    return {
      error:
        "Encaissement enregistré partiellement : vérifier les mouvements puis libérer le verrou (re-saisie bloquée volontairement).",
    };
  }

  await trackEvent("encaisse", { dossierId, metadata: { amountCents } });
  await trackEvent("reverse", { dossierId, metadata: { amountCents: tenant } });

  // Solde atteint (Σ IN ≥ convenu) ou paiement unique sans échéancier → WON.
  const { data: movements } = await admin
    .from("fund_movements")
    .select("amount_cents, direction")
    .eq("dossier_id", dossierId)
    .eq("direction", "IN");
  const totalIn = (movements ?? []).reduce((sum, m) => sum + m.amount_cents, 0);
  if (agreed === null || totalIn >= agreed) {
    assertTransition(status, "WON");
    await admin
      .from("dossiers")
      .update({ status: "WON", recovery_state: "LOCKED" })
      .eq("id", dossierId)
      .in("status", ["RECOVERY", "ESCALATED"]);
  } else {
    // Versement intermédiaire : la séquence reste en pause (réponse bailleur taguée).
    await admin.from("dossiers").update({ recovery_state: "PAUSED" }).eq("id", dossierId);
  }

  await releaseClaim();
  refresh(dossierId);
  return { ok: true };
}

/** « Avancer le temps » (dev) : exécute la prochaine Action en attente du dossier. */
export async function advanceTime(dossierId: string): Promise<AdminResult> {
  await requireAdmin();
  const res = await advanceDossier(dossierId, new Date().toISOString());
  refresh(dossierId);
  if (res.processed === 0) return { error: "Aucune action exécutable (séquence en pause/verrou ou terminée)." };
  return { ok: true };
}

/** Marque un rappel comme traité (PENDING → DONE). Claim atomique anti double-clic. */
export async function markCallbackDone(id: string): Promise<AdminResult> {
  await requireAdmin();
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("callback_requests")
    .update({ status: "DONE", handled_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "PENDING")
    .select("id")
    .maybeSingle();
  if (!data) return { error: "Rappel introuvable ou déjà traité." };
  revalidatePath("/admin/rappels");
  return { ok: true };
}
