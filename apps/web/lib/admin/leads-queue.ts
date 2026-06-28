import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface LeadQueueRow {
  id: string;
  email: string;
  phone: string | null;
  address: string;
  status: string | null;
  since: string | null;
}

/**
 * File de recontact COMPLÈTE : les emails sont capturés ANONYMEMENT sur la page
 * verdict (table `leads`), pas sur /mandat (login-gated). On lit donc directement
 * `leads` (jointe aux dossiers), sinon des prospects réels n'apparaîtraient nulle
 * part. Triée par capture la plus ancienne d'abord (`consent_at` croissant).
 */
export async function getLeadsQueue(): Promise<LeadQueueRow[]> {
  const admin = getSupabaseAdmin();
  const { data: leadRows } = await admin
    .from("leads")
    .select("dossier_id, email, phone, consent_at")
    .order("consent_at", { ascending: true });
  const ids = [
    ...new Set((leadRows ?? []).map((l) => l.dossier_id).filter(Boolean)),
  ] as string[];
  const { data: dossiers } = ids.length
    ? await admin.from("dossiers").select("id, status, address_label").in("id", ids)
    : { data: [] };
  const byId = new Map((dossiers ?? []).map((d) => [d.id, d]));
  return (leadRows ?? []).map((l) => ({
    id: l.dossier_id,
    email: l.email,
    phone: l.phone ?? null,
    address: byId.get(l.dossier_id)?.address_label ?? "Adresse inconnue",
    status: byId.get(l.dossier_id)?.status ?? null,
    since: l.consent_at ?? null,
  }));
}
