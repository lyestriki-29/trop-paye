import { Button } from "@/components/ui/Button";

export interface NextStepRailProps {
  text: string;
  href?: string;
  cta?: string;
}

/**
 * Rail "Prochaine étape" — bandeau collant fond encre.
 * Server Component.
 */
export function NextStepRail({ text, href, cta }: NextStepRailProps) {
  return (
    <div className="sticky top-6 rounded-card border border-ink bg-ink p-5 text-paper">
      <p className="text-xs uppercase tracking-wide text-paper/60">Prochaine étape</p>
      <p className="mt-2 text-sm leading-relaxed">{text}</p>
      {href && cta && (
        <div className="mt-4">
          <Button href={href} variant="accent" size="md">
            {cta}
          </Button>
        </div>
      )}
    </div>
  );
}
