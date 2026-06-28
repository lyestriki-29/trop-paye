import type { Metadata } from "next";
import { PublicShell } from "@/components/ui/PublicShell";

export const metadata: Metadata = {
  title: "Confidentialité — TropPayé",
  description:
    "Comment TropPayé collecte et protège vos données quand vous laissez vos coordonnées pour être recontacté.",
  alternates: { canonical: "/confidentialite" },
  robots: { index: false },
};

/**
 * Politique de confidentialité — version WAITLIST (lancement léger 2026-06-28).
 * Couvre UNIQUEMENT la collecte d'email/téléphone pour recontact (table `leads`),
 * la seule donnée personnelle traitée tant que le mandat est désactivé. La page
 * `/legal` (squelette SAS, activité de recouvrement) reste séparée et attend la
 * société. Copy bordée maison (relecture juriste) — pas de tag interne ici.
 */

const CONTACT_EMAIL = "contact@troppaye.fr";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24 border-t-3 border-nb-ink pt-10">
      <h2 className="text-[clamp(22px,3vw,34px)]">{title}</h2>
      <div className="mt-5 font-nb-body leading-relaxed text-nb-ink/80">{children}</div>
    </section>
  );
}

export default function ConfidentialitePage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <p className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
          TropPayé · Vos données
        </p>
        <h1 className="mt-4 text-[clamp(36px,6vw,72px)]">Confidentialité</h1>

        <p className="mt-8 border-3 border-nb-ink bg-accent p-4 font-nb-body text-sm font-medium shadow-nb-sm">
          Aujourd&apos;hui, TropPayé ne vous demande qu&apos;une chose : votre email (et, si vous le
          voulez, votre téléphone) pour vous recontacter au sujet de votre diagnostic. Cette page
          explique ce qu&apos;on en fait, et comment garder la main dessus.
        </p>

        <Section id="responsable" title="Qui s'occupe de vos données">
          <p>
            Le service TropPayé est, à ce stade, porté par un entrepreneur indépendant (pas encore en
            société). Pour toute question sur vos données ou pour exercer vos droits, une seule
            adresse :{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline underline-offset-4 hover:text-nb-ink"
            >
              {CONTACT_EMAIL}
            </a>
            . L&apos;identité complète du responsable vous est communiquée sur simple demande à cette
            adresse.
          </p>
        </Section>

        <Section id="quoi" title="Ce qu'on collecte, et pourquoi">
          <ul className="space-y-2">
            <li className="flex gap-3 text-sm">
              <span aria-hidden className="text-refund">▪</span>
              <span>
                <strong>Votre email</strong> — pour revenir vers vous avec la marche à suivre sur
                votre dossier.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <span aria-hidden className="text-refund">▪</span>
              <span>
                <strong>Votre téléphone</strong> (facultatif) — seulement si vous le donnez et cochez
                la case d&apos;accord, pour qu&apos;on puisse vous rappeler.
              </span>
            </li>
          </ul>
          <p className="mt-4">
            C&apos;est tout. Pas de démarchage pour autre chose, et vos coordonnées ne sont
            <strong> jamais revendues ni cédées</strong> à des tiers.
          </p>
        </Section>

        <Section id="base-legale" title="Sur quelle base">
          <p>
            On traite ces données sur la base de <strong>votre consentement</strong> : vous choisissez
            de laisser vos coordonnées. Vous pouvez le retirer à tout moment (voir « Vos droits »).
          </p>
        </Section>

        <Section id="hebergement" title="Où c'est stocké">
          <p>
            Vos données sont hébergées chez notre prestataire technique <strong>Supabase</strong>, sur
            des serveurs situés en <strong>région parisienne (France)</strong>. Elles restent donc en
            France.
          </p>
        </Section>

        <Section id="duree" title="Combien de temps">
          <p>
            On conserve vos coordonnées <strong>12 mois</strong> après notre dernier échange. Passé ce
            délai sans contact de votre part, elles sont supprimées. Vous pouvez aussi demander leur
            suppression avant, à tout moment.
          </p>
        </Section>

        <Section id="droits" title="Vos droits">
          <p>
            Vous pouvez à tout moment demander à <strong>consulter</strong>, <strong>corriger</strong>
            {" "}ou <strong>supprimer</strong> vos données, et <strong>retirer votre consentement</strong>.
            Il suffit d&apos;écrire à{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline underline-offset-4 hover:text-nb-ink"
            >
              {CONTACT_EMAIL}
            </a>
            . On traite votre demande dans les meilleurs délais.
          </p>
          <p className="mt-4">
            Si une réponse ne vous satisfait pas, vous pouvez saisir la CNIL (l&apos;autorité française
            de protection des données),{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-nb-ink"
            >
              cnil.fr
            </a>
            .
          </p>
        </Section>

        <p className="mt-12 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/45">
          Dernière mise à jour : 28 juin 2026
        </p>
      </div>
    </PublicShell>
  );
}
