import type { ReactNode } from "react";
import { RevealInit } from "@/components/home/RevealInit";
import { SiteFooterNb } from "@/components/ui/SiteFooterNb";
import { SiteHeaderNb } from "@/components/ui/SiteHeaderNb";

/**
 * Coque publique néubrutaliste : applique le scope `.nb` (polices + fond
 * travaillé + grammaire dure) à TOUT le site public, avec en-tête sticky et
 * pied de page. /espace, /admin, /diagnostic, /mandat ne l'utilisent pas →
 * leur DA « dossier d'instruction » reste intacte.
 */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="nb min-h-screen">
      <SiteHeaderNb />
      <main>{children}</main>
      <RevealInit />
      <SiteFooterNb />
    </div>
  );
}
