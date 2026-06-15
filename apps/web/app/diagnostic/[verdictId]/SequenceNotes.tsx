import type { Confidence } from "@troppaye/rules-engine";
import { frenchDate } from "@/lib/format-date";
import type { PrescriptionInfo } from "@/lib/diagnostic/prescription";

/**
 * Notes de bas de séquence (état verdict irrégulier) : score de confiance
 * et prescription. Blocs statiques — l'animation (Reveal) est portée par
 * `VerdictSequenceLive`. Textes copy deck §2 « Page verdict irrégulier ».
 */

export function ConfidenceNote({
  confidence,
  dpeNumber,
}: {
  confidence: Confidence;
  dpeNumber: string | null;
}) {
  if (confidence === "HIGH") {
    return (
      <div className="border-2 border-ink bg-paper p-5">
        <p className="text-sm font-semibold text-refund-text">Confiance élevée</p>
        {/* TODO_COPY : variante sans n° de DPE (le deck suppose « DPE n° {num} »). */}
        <p className="mt-1 text-sm leading-relaxed text-ink/70">
          Notre estimation s&apos;appuie sur des données officielles
          {dpeNumber ? (
            <>
              {" "}
              (DPE n° <span className="font-mono">{dpeNumber}</span>, indice INSEE)
            </>
          ) : (
            <> (indice INSEE)</>
          )}
          .
        </p>
      </div>
    );
  }
  return (
    <div className="border-2 border-ink bg-paper p-5">
      <p className="text-sm font-semibold text-ink/70">Confiance moyenne</p>
      {/* TODO_COPY : {pièce} = « une quittance de loyer » (le moteur n'expose pas la pièce exacte). */}
      <p className="mt-1 text-sm leading-relaxed text-ink/70">
        Il nous manque une quittance de loyer pour fiabiliser ce calcul — vous pourrez la fournir
        à l&apos;étape suivante.
      </p>
    </div>
  );
}

/** Prescription — fenêtre glissante 3 ans, présentation sobre (jamais alarme). [AVOCAT] */
export function PrescriptionNote({ prescription }: { prescription: PrescriptionInfo }) {
  return (
    <p
      className={
        prescription.urgent
          ? "border-2 border-ink bg-paper px-4 py-3 text-sm leading-relaxed text-ink/80"
          : "px-1 text-xs leading-relaxed text-ink/50"
      }
    >
      La loi limite la récupération aux 3 dernières années : passé le{" "}
      <span className="whitespace-nowrap font-mono font-medium">
        {frenchDate(prescription.deadline)}
      </span>
      , les mois les plus anciens ne seront plus récupérables.
    </p>
  );
}
