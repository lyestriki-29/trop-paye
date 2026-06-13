import { notFound } from "next/navigation";
import { getDossierDetail, type DossierDetail } from "@/lib/dossier/read";

/** Charge le détail d'un dossier possédé, sinon 404. À appeler en tête des onglets. */
export async function loadOwnedDossier(dossierId: string): Promise<DossierDetail> {
  const detail = await getDossierDetail(dossierId);
  if (!detail) notFound();
  return detail;
}
