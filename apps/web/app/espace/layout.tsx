import { requireAuthPage } from "@/lib/auth/guards";

export default async function EspaceRootLayout({ children }: { children: React.ReactNode }) {
  await requireAuthPage();
  // Scope `.nb` (DA « quittance ») sur tout l'espace client — fond crème + grille
  // de points fournis par la classe. Décision Lyes 2026-06-20 : on étend le nb aux
  // surfaces authentifiées (retour sur « nb = public only »).
  return <div className="nb min-h-screen">{children}</div>;
}
