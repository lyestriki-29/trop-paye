import { devLoginClient, devLoginAdmin } from "./dev-actions";

/**
 * Boutons de connexion démo « 1 clic » — rendu UNIQUEMENT hors production
 * (cf. garde côté `page.tsx` + garde serveur dans `dev-actions.ts`). Pratique
 * pour tester l'espace client et le back-office sans email ni code.
 */
export function DevLoginButtons() {
  return (
    <div className="mt-6 border-2 border-dashed border-nb-ink/40 p-4">
      <p className="nb-mono text-[10px] uppercase tracking-widest text-nb-ink/55">
        Dev · connexion rapide
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <form action={devLoginClient}>
          <button
            type="submit"
            className="nb-pill nb-pill--dashed w-full py-2 text-xs font-black uppercase tracking-wide"
          >
            Client démo
          </button>
        </form>
        <form action={devLoginAdmin}>
          <button
            type="submit"
            className="nb-pill nb-pill--ink w-full py-2 text-xs font-black uppercase tracking-wide"
          >
            Admin démo
          </button>
        </form>
      </div>
      <p className="nb-mono mt-2 text-[10px] text-nb-ink/45">
        client@troppaye.test · admin@troppaye.test
      </p>
    </div>
  );
}
