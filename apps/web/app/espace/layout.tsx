import { requireAuthPage } from "@/lib/auth/guards";

export default async function EspaceRootLayout({ children }: { children: React.ReactNode }) {
  await requireAuthPage();
  return <>{children}</>;
}
