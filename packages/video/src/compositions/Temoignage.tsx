import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { demoTemoignage } from "../fixtures";
import { formatEurosVideo, theme } from "../lib/theme";
import { EndCard, Frame } from "../components/shared";

/**
 * Témoignage (spec P4 #6, 18 s) — citation habillée d'un dossier gagné.
 * Fixture FICTIVE : à remplacer post-pilote par un témoignage réel consenti.
 */
export function Temoignage() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const quoteIn = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const authorIn = interpolate(frame, [170, 200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeIn = spring({ frame: frame - 230, fps, config: theme.motion.stampSpring });

  return (
    <Frame bg={theme.colors.paper2}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 90, gap: 52 }}>
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontWeight: 800,
            fontSize: 200,
            lineHeight: 0.5,
            color: theme.colors.accent,
          }}
          aria-hidden
        >
          “
        </div>
        <blockquote
          style={{
            margin: 0,
            maxWidth: 880,
            textAlign: "center",
            fontFamily: theme.fontDisplay,
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.3,
            color: theme.colors.ink,
            opacity: quoteIn,
            transform: `translateY(${(1 - quoteIn) * 24}px)`,
          }}
        >
          {demoTemoignage.quote}
        </blockquote>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: 32,
            letterSpacing: 2,
            color: `${theme.colors.ink}88`,
            opacity: authorIn,
          }}
        >
          {demoTemoignage.author}
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontVariantNumeric: "tabular-nums",
            fontSize: 64,
            fontWeight: 500,
            color: theme.colors.paper,
            backgroundColor: theme.colors.refund,
            borderRadius: 18,
            padding: "14px 44px",
            transform: `scale(${badgeIn}) rotate(-2deg)`,
            opacity: badgeIn,
          }}
        >
          + {formatEurosVideo(demoTemoignage.amountCents)} récupérés
        </div>
      </AbsoluteFill>

      {frame >= 445 ? <EndCard from={450} /> : null}
    </Frame>
  );
}
