import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { demoStat } from "../fixtures";
import { theme } from "../lib/theme";
import { EndCard, Frame } from "../components/shared";

/**
 * StatPunch (spec P4 #3, 6 s) — une stat SOURCÉE en compteur : « 1 logement
 * loué sur 6 » (copy deck §1, mot pour mot ; URL de la source TODO_COPY).
 */
export function StatPunch() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ratioIn = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 200 } });
  // Le dénominateur compte 1 → 6 (punch).
  const denom = Math.max(1, Math.min(6, Math.floor(interpolate(frame, [10, 55], [1, 6.99]))));
  const textIn = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const punchIn = spring({ frame: frame - 115, fps, config: { damping: 12, stiffness: 220 } });

  return (
    <Frame>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80, gap: 48 }}>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontVariantNumeric: "tabular-nums",
            fontWeight: 500,
            fontSize: 260,
            color: theme.colors.ink,
            transform: `scale(${0.6 + 0.4 * ratioIn})`,
            opacity: ratioIn,
            lineHeight: 1,
          }}
        >
          1<span style={{ color: `${theme.colors.ink}55`, margin: "0 18px" }}>/</span>
          <span style={{ color: theme.colors.stamp }}>{denom}</span>
        </div>

        <div
          style={{
            maxWidth: 860,
            textAlign: "center",
            fontFamily: theme.fontDisplay,
            fontWeight: 800,
            fontSize: 64,
            lineHeight: 1.2,
            color: theme.colors.ink,
            opacity: textIn,
            transform: `translateY(${(1 - textIn) * 30}px)`,
          }}
        >
          {demoStat.text}
        </div>

        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontWeight: 800,
            fontSize: 84,
            color: theme.colors.ink,
            backgroundColor: theme.colors.accent,
            borderRadius: 14,
            padding: "6px 36px",
            transform: `scale(${punchIn})`,
            opacity: punchIn,
          }}
        >
          {demoStat.punch}
        </div>

        <div style={{ fontFamily: theme.fontMono, fontSize: 26, color: `${theme.colors.ink}66` }}>
          {demoStat.source}
        </div>
      </AbsoluteFill>

      {frame >= 148 ? <EndCard from={152} /> : null}
    </Frame>
  );
}
