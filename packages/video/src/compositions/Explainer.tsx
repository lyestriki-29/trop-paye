import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "@troppaye/shared";
import { explainerSteps } from "../fixtures";
import { theme } from "../lib/theme";
import { EndCard, Frame, Wordmark } from "../components/shared";

/** Une étape du « Comment ça marche » (copy deck §1, mot pour mot). */
function Step({ index }: { index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const step = explainerSteps[index];
  if (!step) return null;

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 140px", gap: 36 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 36,
          transform: `translateX(${(1 - enter) * 120}px)`,
          opacity: enter,
        }}
      >
        <span
          style={{
            fontFamily: theme.fontMono,
            fontSize: 44,
            color: theme.colors.ink,
            backgroundColor: theme.colors.accent,
            borderRadius: 999,
            width: 100,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          style={{
            fontFamily: theme.fontDisplay,
            fontWeight: 800,
            fontSize: 96,
            color: theme.colors.ink,
          }}
        >
          {step.title}
        </span>
      </div>
      <p
        style={{
          maxWidth: 1300,
          fontFamily: theme.fontBody,
          fontWeight: 500,
          fontSize: 52,
          lineHeight: 1.4,
          color: `${theme.colors.ink}CC`,
          margin: 0,
          opacity: interpolate(frame, [12, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {step.text}
      </p>
    </AbsoluteFill>
  );
}

/**
 * Explainer (spec P4 #4, 36 s, 16:9) — comment ça marche en 3 étapes
 * (site, presse, pre-roll). Intro promesse → 3 étapes → carte de fin.
 */
export function Explainer() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = spring({ frame, fps, config: { damping: 200 } });

  return (
    <Frame>
      <Sequence durationInFrames={150}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 44 }}>
          <Wordmark size={84} />
          <div
            style={{
              fontFamily: theme.fontDisplay,
              fontWeight: 800,
              fontSize: 100,
              color: theme.colors.ink,
              textAlign: "center",
              maxWidth: 1400,
              lineHeight: 1.12,
              transform: `translateY(${(1 - titleIn) * 60}px)`,
            }}
          >
            {brand.hero.title}
          </div>
          <div style={{ fontFamily: theme.fontBody, fontWeight: 600, fontSize: 48, color: `${theme.colors.ink}AA` }}>
            {brand.hero.subtitle}
          </div>
        </AbsoluteFill>
      </Sequence>

      {explainerSteps.map((step, i) => (
        <Sequence key={step.title} from={150 + i * 250} durationInFrames={250}>
          <Step index={i} />
        </Sequence>
      ))}

      {frame >= 895 ? <EndCard from={900} /> : null}
    </Frame>
  );
}
