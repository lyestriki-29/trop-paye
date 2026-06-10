import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { demoHooks } from "../fixtures";
import { theme } from "../lib/theme";
import { Frame } from "../components/shared";

/** Durée d'un hook (3 hooks × 60 f = 180 f = 6 s, boucle parfaite). */
const SEGMENT = 60;

/**
 * HookLoop (spec P4 #2, 6 s) — hooks de brand.ts en typographie cinétique,
 * boucle parfaite : chaque segment entre et sort symétriquement, l'état de
 * la frame 0 = l'état de la dernière frame. Curation hooks Lyes en attente.
 */
export function HookLoop() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = Math.min(Math.floor(frame / SEGMENT), demoHooks.length - 1);
  const local = frame - i * SEGMENT;

  const enter = spring({ frame: local, fps, config: { damping: 16, stiffness: 180 } });
  const exit = interpolate(local, [SEGMENT - 10, SEGMENT - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweep = interpolate(local, [14, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hook = demoHooks[i] ?? demoHooks[0] ?? "";
  // Le dernier mot porte le surligneur (registre offensif des réseaux).
  const words = hook.split(" ");
  const lastWord = words.pop() ?? "";

  return (
    <Frame bg={theme.colors.ink}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 90 }}>
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontWeight: 800,
            fontSize: 110,
            lineHeight: 1.12,
            color: theme.colors.paper,
            textAlign: "center",
            transform: `translateY(${(1 - enter) * 120 - exit * 120}px)`,
            opacity: enter * (1 - exit),
          }}
        >
          {words.join(" ")}{" "}
          <span style={{ position: "relative", whiteSpace: "nowrap", display: "inline-block" }}>
            <span
              style={{
                position: "absolute",
                inset: "8% -3%",
                backgroundColor: theme.colors.accent,
                transform: `scaleX(${sweep})`,
                transformOrigin: "left",
                borderRadius: 10,
              }}
            />
            <span style={{ position: "relative", color: sweep > 0.4 ? theme.colors.ink : theme.colors.paper }}>
              {lastWord}
            </span>
          </span>
        </div>

        {/* Compteur de segment, registre mono — repère discret. */}
        <div
          style={{
            position: "absolute",
            bottom: 90,
            fontFamily: theme.fontMono,
            fontSize: 28,
            letterSpacing: 6,
            color: `${theme.colors.paper}66`,
          }}
        >
          {String(i + 1).padStart(2, "0")} / {String(demoHooks.length).padStart(2, "0")}
        </div>
      </AbsoluteFill>
    </Frame>
  );
}
