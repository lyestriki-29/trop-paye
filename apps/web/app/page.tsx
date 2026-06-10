import { Confiance } from "@/components/home/Confiance";
import { CtaFinal } from "@/components/home/CtaFinal";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Passoires } from "@/components/home/Passoires";
import { Steps } from "@/components/home/Steps";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getPublicStats } from "@/lib/public-stats";

/** ISR : home statique, rafraîchie toutes les 5 min (compteur public inclus). */
export const revalidate = 300;

/** Home réelle v2 — ordre spec P2 : hero → comment ça marche → confiance → passoires → FAQ → CTA. */
export default async function Home() {
  const stats = await getPublicStats();
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Steps />
        <Confiance stats={stats} />
        <Passoires />
        <Faq />
        <CtaFinal />
      </main>
      <SiteFooter />
    </>
  );
}
