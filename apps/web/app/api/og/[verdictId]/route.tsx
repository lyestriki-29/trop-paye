import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { brand, colors, formatEUR, radius } from "@troppaye/shared";
import { getVerdictTeaser } from "@/lib/diagnostic/verdict-teaser";

export const runtime = "nodejs";

/**
 * Image OG 1200×630 (plan P2 Task 7 Step 3) — gabarit charte §3 validé en
 * /design-lab/directions/v2/identite : logotype (surligneur sous « Payé »),
 * montant mono surligné `accent`, tampon coin bas droit.
 * RGPD : montant + type d'irrégularité + ville UNIQUEMENT — jamais l'adresse.
 * Verdict non chiffré → gabarit générique sans montant ; UUID inconnu → 404.
 * Styles JSX inline OBLIGATOIRES ici (satori ne lit ni Tailwind, ni variables
 * CSS, ni fontes variables) : exception documentée à la règle « pas de styles
 * inline », couleurs depuis les constantes JS de @troppaye/shared.
 */

/** « #2A2118 » + alpha → « rgba(42, 33, 24, a) » (équivalent local de hexToChannels). */
function withAlpha(hex: string, alpha: number): string {
  const int = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(int >> 16) & 0xff}, ${(int >> 8) & 0xff}, ${int & 0xff}, ${alpha})`;
}

/** TTF statique (assets/fonts) → ArrayBuffer pour satori. */
async function loadFont(file: string): Promise<ArrayBuffer> {
  const buf = await readFile(path.join(process.cwd(), "assets", "fonts", file));
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(buf);
  return ab;
}

/** Espaces insécables (fine U+202F et U+00A0) de fr-FR → espaces simples (glyphes sûrs). */
const FR_NBSP_RE = new RegExp("[" + String.fromCharCode(0x202f, 0xa0) + "]", "g");
const ogAmount = (cents: number): string => formatEUR(cents).replace(FR_NBSP_RE, " ");

/** Wordmark « TropPayé » — surligneur `accent` sous « Payé » (LogoA, charte §3). */
function Wordmark() {
  return (
    <div style={{ display: "flex", lineHeight: 1 }}>
      <div style={{ fontSize: 54, fontWeight: 800 }}>Trop</div>
      <div style={{ display: "flex", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 2,
            right: -2,
            bottom: -2,
            height: 13,
            borderRadius: 7,
            background: colors.accent,
          }}
        />
        <div style={{ fontSize: 54, fontWeight: 800 }}>Payé</div>
      </div>
    </div>
  );
}

/** Tampon « TROP PAYÉ » — double filet `stamp`, −6°, claqué au coin (marque secondaire). */
function OgStamp() {
  const line = { fontSize: 40, fontWeight: 800, letterSpacing: 8, lineHeight: 1.15 } as const;
  return (
    <div
      style={{
        position: "absolute",
        right: -14,
        bottom: 26,
        display: "flex",
        transform: "rotate(-6deg)",
        opacity: 0.92,
      }}
    >
      <div style={{ display: "flex", border: `6px solid ${colors.stamp}`, borderRadius: 18, padding: 7 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: `2px solid ${colors.stamp}`,
            borderRadius: 12,
            padding: "10px 26px",
            color: colors.stamp,
          }}
        >
          <div style={line}>TROP</div>
          <div style={line}>PAYÉ</div>
        </div>
      </div>
    </div>
  );
}

export async function GET(_req: Request, ctx: { params: Promise<{ verdictId: string }> }) {
  const { verdictId } = await ctx.params;
  const teaser = await getVerdictTeaser(verdictId);
  if (!teaser) return new Response("Not found", { status: 404 });

  const [outfit, mono] = await Promise.all([
    loadFont("Outfit-ExtraBold.ttf"),
    loadFont("SplineSansMono-Medium.ttf"),
  ]);

  const quantified = teaser.amountCents !== null;
  const meta = [teaser.kindLabel, teaser.city].filter(Boolean).join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          padding: 64,
          background: colors.paper,
          color: colors.ink,
          fontFamily: "Outfit",
        }}
      >
        <Wordmark />

        {teaser.amountCents !== null ? (
          /* Phrase du gabarit validé (étude concurrence / identite v2). */
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
            <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
              {"J'ai vérifié mon loyer :"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  background: colors.accent,
                  color: colors.ink,
                  borderRadius: radius.field * 2,
                  padding: "2px 22px",
                  fontFamily: "Spline Sans Mono",
                  fontWeight: 500,
                  fontSize: 76,
                  lineHeight: 1.25,
                }}
              >
                {ogAmount(teaser.amountCents)}
              </div>
              <div style={{ fontSize: 58, fontWeight: 800 }}>à récupérer</div>
            </div>
            {meta ? (
              <div
                style={{
                  marginTop: 28,
                  fontFamily: "Spline Sans Mono",
                  fontWeight: 500,
                  fontSize: 27,
                  color: withAlpha(colors.ink, 0.62),
                }}
              >
                {meta}
              </div>
            ) : null}
          </div>
        ) : (
          /* Gabarit générique (conforme / insuffisant / non chiffré) — zéro donnée. */
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
            <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.1 }}>{brand.hero.title}</div>
            <div style={{ marginTop: 22, fontSize: 31, lineHeight: 1.35, color: withAlpha(colors.ink, 0.7) }}>
              {brand.baseline}
            </div>
          </div>
        )}

        <div
          style={{
            fontFamily: "Spline Sans Mono",
            fontWeight: 500,
            fontSize: 26,
            color: withAlpha(colors.ink, 0.55),
          }}
        >
          {brand.domain}
        </div>

        {/* Le tampon : réservé au verdict gagné (charte §1) — jamais sur le générique. */}
        {quantified ? <OgStamp /> : null}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Outfit", data: outfit, weight: 800, style: "normal" },
        { name: "Spline Sans Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
