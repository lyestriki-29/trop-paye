import { brand } from "@troppaye/shared";
import { Button } from "@/components/ui/Button";
import { Marker } from "@/components/ui/Marker";
import { QuittanceCard } from "@/components/ui/QuittanceCard";

/**
 * Variante B — « dossier preuve » : deux colonnes desktop, carte « l'essentiel »
 * collante à droite (la preuve est la décoration, charte §5), CTA intégré à la
 * carte. La conversion est visible en permanence sans interrompre la lecture.
 * Contenu FICTIF (démo de composition — TODO_COPY, ne pas publier).
 */
export function GabaritGuideVarianteB() {
  return (
    <main className="mx-auto max-w-container px-6 py-14">
      <div className="grid gap-10 lg:grid-cols-[7fr_4fr]">
        <article>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
            Guides · Gel DPE
          </p>
          <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-display sm:text-[40px]">
            Logement classé F ou G : votre loyer est <Marker>gelé</Marker>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            Depuis le 24 août 2022, la loi interdit toute augmentation de loyer des
            passoires thermiques. (Texte fictif.)
          </p>

          <div className="mt-8 space-y-5 border-t border-line pt-8 leading-relaxed text-ink/80">
            <h2 className="font-display text-xl font-extrabold tracking-display text-ink">
              1. Ce que dit la loi
            </h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit — paragraphe de
              démonstration pour juger la lecture à côté d&apos;une colonne sticky.
              (Texte fictif.)
            </p>
            <h2 className="font-display text-xl font-extrabold tracking-display text-ink">
              2. Vérifier la classe de votre logement
            </h2>
            <p>
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
              minim veniam, quis nostrud exercitation. (Texte fictif.)
            </p>
          </div>
        </article>

        {/* Colonne preuve : l'essentiel du guide en carte-quittance + CTA. */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <QuittanceCard
            reference="L'essentiel"
            kind="Guide"
            className="shadow-xl"
            rows={[
              { label: "Logements concernés", text: "Classes F et G", highlight: true },
              { label: "Gel depuis le", text: "24/08/2022" },
              { label: "Trop-perçu", text: "Récupérable 3 ans" },
            ]}
          >
            <div className="mt-5">
              <Button href="#" className="w-full">
                {brand.hero.cta}
              </Button>
              <p className="mt-3 text-center text-xs font-medium text-ink/60">
                {brand.hero.reassurance.join(" · ")}
              </p>
            </div>
          </QuittanceCard>
        </aside>
      </div>
    </main>
  );
}
