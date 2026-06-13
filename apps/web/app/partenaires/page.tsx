import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import { PageHeroNb } from "@/components/public/PageHeroNb";
import { PublicShell } from "@/components/ui/PublicShell";

export const metadata: Metadata = {
  title: "Partenaires — TropPayé",
  description:
    "Avocats, associations de locataires, comités d'entreprise : les collaborations que nous recherchons pour un logement plus juste.",
  alternates: { canonical: "/partenaires" },
};

/* Catégories de partenaires RECHERCHÉS (jamais présentés comme existants —
   garde-fou L121-2 conso). [AVOCAT] : valider les verbes d'action. */
const FAMILLES = [
  {
    tag: "Avocats & cabinets",
    title: "Droit du logement",
    body: "Vous défendez des locataires ? Nous instruisons des dossiers solides (calcul détaillé, base légale, pièces réunies) que nous pouvons vous transmettre quand la voie amiable est épuisée. Vous récupérez un dossier prêt à plaider, le locataire garde un interlocuteur clair.",
  },
  {
    tag: "Associations",
    title: "Défense des locataires",
    body: "ADIL, CNL, CGL, CLCV, CSF, AFOC et acteurs de terrain : vous informez et accompagnez les locataires au quotidien. Nous aimerions imaginer des passerelles et orienter vers vous les situations qui relèvent de votre mission. (Ces organismes sont indépendants et ne sont pas affiliés à TropPayé.)",
  },
  {
    tag: "CSE & employeurs",
    title: "Un coup de pouce budget",
    body: "Offrez à vos salariés un avantage concret : ils vérifient gratuitement si leur loyer est trop élevé et récupèrent le trop-perçu sans rien avancer. Un service utile, pensé pour être simple à proposer côté comité.",
  },
] as const;

/* Ressources publiques citées comme RÉFÉRENCES (non affiliées). */
const RESSOURCES = [
  { label: "ADIL / ANIL — l'info logement, gratuite et neutre", href: "https://www.anil.org/" },
  { label: "CNL — Confédération nationale du logement", href: "https://confederationnationaledulogement.fr/" },
  { label: "CLCV — Consommation, logement et cadre de vie", href: "https://www.clcv.org/" },
] as const;

export default function PartenairesPage() {
  return (
    <PublicShell>
      <PageHeroNb
        kicker="TropPayé · Collaborations"
        title="Construisons ensemble un logement plus juste"
        lede="TropPayé aide les locataires à récupérer le loyer payé en trop. Pour aller plus loin, nous voulons travailler avec celles et ceux qui défendent les mêmes droits : avocats, associations, comités d'entreprise. Voici comment nous envisageons ces collaborations."
      />

      {/* [AVOCAT] — micro-mention de non-revendication (garde-fou L121-2). */}
      <section className="border-b-3 border-nb-ink py-12">
        <div className="mx-auto max-w-container px-6">
          <p className="nb-mono text-xs uppercase tracking-wider text-nb-ink/60">
            Cette page présente les collaborations que nous recherchons. Elle ne liste pas de
            partenariats existants.
          </p>
          {/* [AVOCAT] — frontière recouvrement amiable / acte judiciaire (art. R124-1 CPCE). */}
          <h2 className="mt-6 max-w-3xl text-[clamp(26px,4vw,44px)]">
            Notre rôle, et là où d&apos;autres prennent le <span className="nb-mark">relais</span>.
          </h2>
          <p className="mt-5 max-w-2xl font-nb-body leading-relaxed text-nb-ink/80">
            Notre métier, c&apos;est l&apos;analyse et la négociation amiable, pas la procédure
            judiciaire. Quand un dossier doit aller devant le juge, ou quand une situation dépasse
            le simple trop-perçu (logement indécent, conflit lourd), le bon réflexe est de
            s&apos;appuyer sur un avocat ou une association agréée. C&apos;est pour ces situations
            que nous voulons bâtir un réseau de confiance.
          </p>
        </div>
      </section>

      <section className="border-b-3 border-nb-ink py-16 sm:py-20">
        <div className="mx-auto max-w-container px-6">
          <h2 className="text-[clamp(26px,4vw,44px)]">
            Trois familles de partenaires que nous <span className="nb-mark">recherchons</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FAMILLES.map((f, i) => (
              <Reveal key={f.tag} delay={0.08 + i * 0.08} className="h-full">
                <article className="nb-tilt nb-card flex h-full flex-col p-7">
                  <p className="nb-mono text-[11px] uppercase tracking-widest text-nb-ink/55">
                    {f.tag}
                  </p>
                  <h3 className="mt-3 text-xl">{f.title}</h3>
                  <p className="mt-3 font-nb-body text-sm leading-relaxed text-nb-ink/75">
                    {f.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Devenir partenaire — CTA contact. TODO_VERIFIER l'adresse partenariats. */}
      <section className="nb-band-final border-b-3 border-nb-ink py-16 sm:py-20">
        <div className="mx-auto max-w-container px-6">
          <h2 className="max-w-2xl text-[clamp(28px,4.5vw,52px)]">Envie d&apos;avancer avec nous ?</h2>
          <p className="mt-5 max-w-2xl font-nb-body text-lg leading-relaxed opacity-80">
            Avocat, responsable associatif ou élu de CSE : écrivez-nous en deux minutes. Pas de
            discours, juste une conversation.
          </p>
          <a
            href="mailto:partenaires@troppaye.fr"
            className="nb-card-hover mt-8 inline-flex border-3 border-nb-ink bg-paper px-6 py-3 font-nb-display text-base uppercase text-nb-ink shadow-nb"
          >
            Proposer une collaboration
          </a>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-container px-6">
          <h2 className="text-[clamp(24px,3.5vw,40px)]">Besoin d&apos;aide tout de suite ?</h2>
          {/* [AVOCAT] — formulation « indépendants / non affiliés ». */}
          <p className="mt-4 max-w-2xl font-nb-body leading-relaxed text-nb-ink/75">
            Ces organismes sont indépendants de TropPayé et proposent une information gratuite et
            neutre sur vos droits.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {RESSOURCES.map((r) => (
              <li key={r.href}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nb-card-hover block h-full border-3 border-nb-ink bg-paper p-5 font-nb-body text-sm shadow-nb-sm"
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
          {/* [AVOCAT] — bandeau de conformité (recouvrement amiable, RGPD). */}
          <p className="mt-10 nb-mono text-[11px] uppercase leading-relaxed tracking-wider text-nb-ink/50">
            Données hébergées en France · pièces sensibles chiffrées · conforme au RGPD ·
            recouvrement amiable pour le compte du locataire, nous n&apos;exerçons pas d&apos;acte
            juridique réservé.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
