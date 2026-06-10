import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { demoVerdict } from "../fixtures";
import { formatEurosVideo, theme } from "../lib/theme";
import { EndCard, Frame, Sub, useCountUp } from "../components/shared";

/**
 * VerdictReveal (spec P4 #1, 10 s) — LE format à industrialiser :
 * 1 dossier gagné = 1 vidéo. Séquence signature v2 : carte dossier →
 * surligneur → count-up vert → tampon → gimmick. Fixtures DEMO.
 */
export function VerdictReveal() {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const compact = width <= 1080 && width >= 1000 ? width / 1080 : 1;

  const cardIn = spring({ frame, fps, config: { damping: 200 } });
  const sweep = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const amountCents = useCountUp(demoVerdict.recoverableCents, 80, 70);
  const stamp = spring({
    frame: frame - 165,
    fps,
    config: theme.motion.stampSpring,
  });

  return (
    <Frame>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 56 * compact }}>
        {/* Carte dossier (la preuve est la décoration, charte §5). */}
        <div
          style={{
            width: 820 * compact,
            backgroundColor: theme.colors.paper,
            border: `2px solid ${theme.colors.line}`,
            borderRadius: theme.radius.card * 3,
            padding: 56 * compact,
            boxShadow: "0 30px 80px rgba(42,33,24,0.18)",
            transform: `translateY(${(1 - cardIn) * 160}px) rotate(-1deg)`,
            opacity: cardIn,
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: theme.fontMono,
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: `${theme.colors.ink}88`,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Réf. dossier {demoVerdict.reference}</span>
            <span>{demoVerdict.city}</span>
          </div>
          <div
            style={{
              marginTop: 40,
              fontFamily: theme.fontDisplay,
              fontWeight: 800,
              fontSize: 58,
              color: theme.colors.ink,
              lineHeight: 1.15,
            }}
          >
            Logement classé{" "}
            <span
              style={{
                display: "inline-block",
                backgroundColor: theme.colors.stamp,
                color: theme.colors.paper,
                borderRadius: 12,
                padding: "0 22px",
              }}
            >
              {demoVerdict.dpeClass}
            </span>
          </div>
          <div style={{ marginTop: 36, position: "relative", width: "fit-content" }}>
            {/* Surligneur (signature charte §1) — balaie « trop-perçu détecté ». */}
            <span
              style={{
                position: "absolute",
                inset: "-6px -14px",
                backgroundColor: theme.colors.accent,
                transform: `scaleX(${sweep})`,
                transformOrigin: "left",
                borderRadius: 8,
              }}
            />
            <span
              style={{
                position: "relative",
                fontFamily: theme.fontMono,
                fontSize: 34,
                textTransform: "uppercase",
                letterSpacing: 5,
                color: theme.colors.ink,
              }}
            >
              Trop-perçu détecté
            </span>
          </div>
          {/* Tampon (marque secondaire — verdict gagné + réseaux UNIQUEMENT). */}
          <div
            style={{
              position: "absolute",
              right: 30,
              top: -40,
              fontFamily: theme.fontDisplay,
              fontWeight: 800,
              fontSize: 54,
              textTransform: "uppercase",
              letterSpacing: 4,
              color: theme.colors.stamp,
              border: `6px solid ${theme.colors.stamp}`,
              borderRadius: 16,
              padding: "10px 28px",
              transform: `rotate(-12deg) scale(${stamp})`,
              opacity: stamp,
            }}
          >
            Récupéré
          </div>
        </div>

        {/* Count-up — LE vert de l'argent récupéré, mono tabular (charte §2). */}
        <div
          style={{
            fontFamily: theme.fontMono,
            fontVariantNumeric: "tabular-nums",
            fontWeight: 500,
            fontSize: 150 * compact,
            color: theme.colors.refund,
            opacity: interpolate(frame, [80, 92], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {formatEurosVideo(amountCents)}
        </div>
      </AbsoluteFill>

      {frame < 100 ? (
        <Sub text={`Ce locataire payait ${(demoVerdict.monthlyOverchargeCents / 100).toLocaleString("fr-FR")} € de trop chaque mois.`} />
      ) : frame < 235 ? (
        <Sub text={`${formatEurosVideo(demoVerdict.recoverableCents)} récupérés sur 3 ans.`} />
      ) : null}

      {frame >= 235 ? <EndCard from={240} /> : null}
    </Frame>
  );
}
