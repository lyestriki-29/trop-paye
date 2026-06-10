import Script from "next/script";
import { env } from "@/lib/env";

/**
 * Mesure d'audience SANS cookie, exemptée de consentement CNIL (spec P3) —
 * pas de bannière au lancement. Inactive tant que le domaine n'est pas
 * configuré (NEXT_PUBLIC_PLAUSIBLE_DOMAIN). Tout tracker non exempté
 * ultérieur exigera une CMP (décision actée dans la spec refonte).
 */
export function Analytics() {
  if (!env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) return null;
  return (
    <Script
      defer
      data-domain={env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
      src={env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL}
      strategy="afterInteractive"
    />
  );
}
