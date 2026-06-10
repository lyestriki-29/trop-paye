import { brand } from "@troppaye/shared";
import { Button } from "@/components/ui/Button";
import { Marker } from "@/components/ui/Marker";

/**
 * Variante A — « éditorial sobre » : une colonne, sommaire ancré, prose large,
 * un seul encart CTA accent en milieu d'article. Le guide se lit comme un
 * article de référence ; la conversion reste discrète.
 * Contenu FICTIF (démo de composition — TODO_COPY, ne pas publier).
 */
export function GabaritGuideVarianteA() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
        Guides · Gel DPE
      </p>
      <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-display sm:text-[40px]">
        Logement classé F ou G : votre loyer est <Marker>gelé</Marker>
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink/70">
        Depuis le 24 août 2022, la loi interdit toute augmentation de loyer des passoires
        thermiques. Voici comment vérifier — et récupérer le trop-perçu. (Texte fictif.)
      </p>

      {/* Sommaire ancré : zéro JS, juste des ancres. */}
      <nav aria-label="Sommaire" className="mt-8 rounded-card border border-line bg-paper-2 p-5">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-ink/50">
          Sommaire
        </p>
        <ol className="mt-2 space-y-1 text-sm font-medium text-ink/75">
          <li>1. Ce que dit la loi</li>
          <li>2. Vérifier la classe de votre logement</li>
          <li>3. Calculer le trop-perçu</li>
        </ol>
      </nav>

      <div className="prose-guide mt-8 space-y-5 leading-relaxed text-ink/80">
        <h2 className="font-display text-xl font-extrabold tracking-display text-ink">
          1. Ce que dit la loi
        </h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit — paragraphe de
          démonstration pour juger la couleur typographique du gabarit, la largeur de
          colonne et le rythme vertical. (Texte fictif.)
        </p>
        <p>
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, avec une
          <strong> base légale citée en clair</strong> et un terme technique expliqué en une
          ligne. (Texte fictif.)
        </p>
      </div>

      {/* L'encart CTA unique, en milieu de lecture. */}
      <aside className="mt-10 rounded-card bg-accent px-7 py-8 text-ink">
        <p className="font-display text-lg font-extrabold tracking-display">{brand.baseline}</p>
        <div className="mt-4">
          <Button href="#">{brand.hero.cta}</Button>
        </div>
        <p className="mt-3 text-sm font-medium text-ink/70">
          {brand.hero.reassurance.join(" · ")}
        </p>
      </aside>

      <div className="mt-10 space-y-5 leading-relaxed text-ink/80">
        <h2 className="font-display text-xl font-extrabold tracking-display text-ink">
          2. Vérifier la classe de votre logement
        </h2>
        <p>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. (Texte fictif.)
        </p>
      </div>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/60">
          Sources
        </h2>
        <p className="mt-2 text-sm text-refund-text underline underline-offset-4">
          Loi Climat et résilience, art. 159 — Légifrance (lien fictif)
        </p>
      </section>
    </main>
  );
}
