import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "@troppaye/shared";
import { demoVerdict } from "../fixtures";
import { formatEurosVideo, theme } from "../lib/theme";
import { EndCard, Frame, Sub, useCountUp } from "../components/shared";

const ADDRESS = "12 rue des Lilas, Paris 11ᵉ";

/** Faux champ adresse : frappe au clavier + caret clignotant (UI stylisée). */
function AddressScreen() {
  const frame = useCurrentFrame();
  const typed = ADDRESS.slice(0, Math.floor(interpolate(frame, [15, 120], [0, ADDRESS.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })));
  const caretOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 70 }}>
      <div
        style={{
          width: "100%",
          maxWidth: 880,
          backgroundColor: theme.colors.paper,
          border: `2px solid ${theme.colors.line}`,
          borderRadius: 999,
          padding: "34px 48px",
          fontFamily: theme.fontBody,
          fontWeight: 500,
          fontSize: 42,
          color: theme.colors.ink,
          boxShadow: "0 20px 60px rgba(42,33,24,0.12)",
        }}
      >
        {typed}
        <span style={{ opacity: caretOn ? 1 : 0, color: theme.colors.refund }}>|</span>
      </div>
      <Sub text="Tapez votre adresse. C'est tout." />
    </AbsoluteFill>
  );
}

/** Carte DPE stylisée : la classe G tombe avec le tampon rouge. */
function DpeScreen() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const pill = spring({ frame: frame - 30, fps, config: theme.motion.stampSpring });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 70 }}>
      <div
        style={{
          width: "100%",
          maxWidth: 880,
          backgroundColor: theme.colors.paper,
          border: `2px solid ${theme.colors.line}`,
          borderRadius: theme.radius.card * 3,
          padding: 56,
          transform: `translateY(${(1 - enter) * 120}px)`,
          opacity: enter,
          boxShadow: "0 20px 60px rgba(42,33,24,0.12)",
        }}
      >
        <div style={{ fontFamily: theme.fontMono, fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: `${theme.colors.ink}77` }}>
          DPE trouvé · {demoVerdict.city}
        </div>
        <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 36 }}>
          <span
            style={{
              fontFamily: theme.fontDisplay,
              fontWeight: 800,
              fontSize: 120,
              color: theme.colors.paper,
              backgroundColor: theme.colors.stamp,
              borderRadius: 20,
              padding: "0 44px",
              transform: `scale(${pill})`,
            }}
          >
            {demoVerdict.dpeClass}
          </span>
          <span style={{ fontFamily: theme.fontBody, fontWeight: 600, fontSize: 44, lineHeight: 1.25, color: theme.colors.ink }}>
            Passoire thermique :<br />loyer gelé depuis 2022.
          </span>
        </div>
      </div>
      <Sub text="On croise vos réponses avec les données publiques." />
    </AbsoluteFill>
  );
}

/** Verdict stylisé : count-up + CTA pilule (les boutons disent ce qui se passe). */
function VerdictScreen() {
  const frame = useCurrentFrame();
  const amount = useCountUp(demoVerdict.recoverableCents, 20, 70);
  const ctaIn = interpolate(frame, [100, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 48, padding: 70 }}>
      <div style={{ fontFamily: theme.fontDisplay, fontWeight: 800, fontSize: 76, color: theme.colors.ink }}>
        Vous avez trop payé.
      </div>
      <div
        style={{
          fontFamily: theme.fontMono,
          fontVariantNumeric: "tabular-nums",
          fontWeight: 500,
          fontSize: 140,
          color: theme.colors.refund,
        }}
      >
        {formatEurosVideo(amount)}
      </div>
      <div
        style={{
          fontFamily: theme.fontDisplay,
          fontWeight: 700,
          fontSize: 46,
          color: theme.colors.ink,
          backgroundColor: theme.colors.accent,
          borderRadius: 999,
          padding: "26px 64px",
          opacity: ctaIn,
          transform: `translateY(${(1 - ctaIn) * 30}px)`,
          boxShadow: "0 16px 40px rgba(42,33,24,0.18)",
        }}
      >
        Récupérer mes {formatEurosVideo(demoVerdict.recoverableCents)}
      </div>
      <Sub text={brand.hero.reassurance.join(" · ")} />
    </AbsoluteFill>
  );
}

/**
 * DemoScreen (spec P4 #7, 24 s) — screencast STYLISÉ du diagnostic :
 * recréation UI aux tokens (pas de capture brute), 3 écrans → carte de fin.
 */
export function DemoScreen() {
  const frame = useCurrentFrame();
  return (
    <Frame bg={theme.colors.paper2}>
      <Sequence durationInFrames={180}>
        <AddressScreen />
      </Sequence>
      <Sequence from={180} durationInFrames={180}>
        <DpeScreen />
      </Sequence>
      <Sequence from={360} durationInFrames={240}>
        <VerdictScreen />
      </Sequence>
      {frame >= 595 ? <EndCard from={600} /> : null}
    </Frame>
  );
}
