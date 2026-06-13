/**
 * SECURITE — module serveur uniquement.
 *
 * Ce module utilise le client admin (service_role) qui CONTOURNE la RLS.
 * Il DOIT toujours être appelé APRES `loadOwnedDossier(dossierId)` dans la
 * même requête, ce qui garantit la propriété via RLS.
 * Ne jamais exposer `getPayoutView` via un endpoint sans ce garde de propriété.
 * Ne jamais retourner l'IBAN déchiffré complet — uniquement la forme masquée.
 */

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { decryptBytes } from "@/lib/crypto";
import { maskIban } from "@/lib/espace/payout";

export interface PayoutView {
  holderName: string | null;
  ibanMasked: string | null;
  movements: {
    direction: string;
    amount_cents: number;
    occurred_at: string;
  }[];
}

/**
 * Charge le RIB masqué + mouvements de fonds pour un dossier.
 * Ownership : appelé après loadOwnedDossier (RLS déjà passée).
 */
export async function getPayoutView(dossierId: string): Promise<PayoutView> {
  const admin = getSupabaseAdmin();

  const [{ data: pd }, { data: mv }] = await Promise.all([
    admin
      .from("payout_details")
      .select("holder_name, iban_encrypted")
      .eq("dossier_id", dossierId)
      .maybeSingle(),
    admin
      .from("fund_movements")
      .select("direction, amount_cents, occurred_at")
      .eq("dossier_id", dossierId)
      .order("occurred_at", { ascending: true }),
  ]);

  let ibanMasked: string | null = null;
  if (pd?.iban_encrypted) {
    const iban = decryptBytes(
      Buffer.from(pd.iban_encrypted, "base64"),
    ).toString("utf8");
    ibanMasked = maskIban(iban);
  }

  return {
    holderName: pd?.holder_name ?? null,
    ibanMasked,
    movements: mv ?? [],
  };
}
