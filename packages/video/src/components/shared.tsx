import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "@troppaye/shared";
import { DEMO_TAG } from "../fixtures";
import { theme } from "../lib/theme";

/** Fond papier + filigrane DEMO (fixtures jamais publiées, spec P4). */
export function Frame({
  children,
  bg = theme.colors.paper,
  style,
}: {
  children: ReactNode;
  bg?: string;
  style?: CSSProperties;
}) {
  return (
    <AbsoluteFill style={{ backgroundColor: bg, ...style }}>
      {children}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: theme.fontMono,
          fontSize: 22,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: bg === theme.colors.ink ? `${theme.colors.paper}55` : `${theme.colors.ink}40`,
        }}
      >
        {DEMO_TAG}
      </div>
    </AbsoluteFill>
  );
}

/** Wordmark TropPayé : « Payé » souligné par le surligneur accent (charte §3). */
export function Wordmark({ size = 72, color = theme.colors.ink }: { size?: number; color?: string }) {
  return (
    <div style={{ fontFamily: theme.fontDisplay, fontWeight: 800, fontSize: size, color, lineHeight: 1 }}>
      Trop
      <span
        style={{
          backgroundImage: `linear-gradient(${theme.colors.accent}, ${theme.colors.accent})`,
          backgroundSize: "100% 0.22em",
          backgroundPosition: "0 92%",
          backgroundRepeat: "no-repeat",
        }}
      >
        Payé
      </span>
    </div>
  );
}

/** Sous-titre intégré (spec P4 : sous-titres dans l'image), bas d'écran. */
export function Sub({ text, color = theme.colors.ink }: { text: string; color?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 110,
        left: 60,
        right: 60,
        textAlign: "center",
        fontFamily: theme.fontBody,
        fontWeight: 600,
        fontSize: 44,
        lineHeight: 1.3,
        color,
      }}
    >
      {text}
    </div>
  );
}

/**
 * Carte de fin commune (spec P4) : gimmick « Trop payé ? Tape l'adresse ! »
 * + wordmark + domaine. `from` = frame d'apparition.
 */
export function EndCard({ from }: { from: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - from, fps, config: { damping: 200 } });
  const opacity = interpolate(frame, [from - 8, from], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.accent,
        justifyContent: "center",
        alignItems: "center",
        gap: 48,
        opacity,
        transform: `translateY(${(1 - enter) * 80}px)`,
      }}
    >
      <div
        style={{
          fontFamily: theme.fontDisplay,
          fontWeight: 800,
          fontSize: 92,
          color: theme.colors.ink,
          textAlign: "center",
          lineHeight: 1.1,
          padding: "0 80px",
        }}
      >
        {brand.hooks.gimmick}
      </div>
      <Wordmark size={64} />
      <div style={{ fontFamily: theme.fontMono, fontSize: 34, color: `${theme.colors.ink}99` }}>
        {brand.domain}
      </div>
    </AbsoluteFill>
  );
}

/** Count-up eased d'un montant en centimes (euros entiers, mono, charte §4). */
export function useCountUp(cents: number, from: number, durationFrames: number): number {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [from, from + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = 1 - (1 - t) ** 3;
  return Math.round((cents * eased) / 100) * 100;
}
