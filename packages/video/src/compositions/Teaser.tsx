import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { demoLaunch } from "../fixtures";
import { formatEurosVideo, theme } from "../lib/theme";
import { EndCard, Frame } from "../components/shared";

/** Loyers qui montent (tension) — colonne mono défilante, données fictives. */
const RENTS = [86_500, 89_000, 92_350, 95_000, 98_700, 102_185, 105_900, 109_400];

/**
 * TeaserLancement (spec P4 #5, 15 s) — montée de tension : les loyers
 * grimpent en mono sur fond ink, la question tombe, puis date + gimmick.
 * Date de lancement TODO_COPY (fixtures).
 */
export function Teaser() {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  const scroll = interpolate(frame, [0, 190], [0, -RENTS.length * 150], {
    extrapolateRight: "clamp",
  });
  const dim = interpolate(frame, [150, 200], [1, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const questionIn = spring({ frame: frame - 195, fps, config: { damping: 15, stiffness: 160 } });
  const dateIn = spring({ frame: frame - 300, fps, config: { damping: 200 } });

  return (
    <Frame bg={theme.colors.ink}>
      {/* La colonne des hausses : chaque ligne plus chère que la précédente. */}
      <AbsoluteFill style={{ alignItems: "center", opacity: dim }}>
        <div style={{ transform: `translateY(${height / 2 + scroll}px)` }}>
          {RENTS.map((cents, i) => (
            <div
              key={cents}
              style={{
                fontFamily: theme.fontMono,
                fontVariantNumeric: "tabular-nums",
                fontSize: 96,
                lineHeight: "150px",
                textAlign: "center",
                color: i === RENTS.length - 1 ? theme.colors.stamp : `${theme.colors.paper}77`,
              }}
            >
              {formatEurosVideo(cents)} / mois
            </div>
          ))}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80, gap: 56 }}>
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontWeight: 800,
            fontSize: 104,
            lineHeight: 1.15,
            color: theme.colors.paper,
            textAlign: "center",
            transform: `translateY(${(1 - questionIn) * 90}px)`,
            opacity: questionIn,
          }}
        >
          Votre loyer est-il <span style={{ color: theme.colors.accent }}>légal</span> ?
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: 44,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: `${theme.colors.paper}AA`,
            opacity: dateIn,
          }}
        >
          {demoLaunch.date} · {demoLaunch.handle}
        </div>
      </AbsoluteFill>

      {frame >= 365 ? <EndCard from={370} /> : null}
    </Frame>
  );
}
