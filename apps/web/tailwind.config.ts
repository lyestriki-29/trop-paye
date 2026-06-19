import type { Config } from "tailwindcss";

/** Tailwind câblé EXCLUSIVEMENT sur les tokens de la charte (§2). */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: {
          DEFAULT: "rgb(var(--color-paper) / <alpha-value>)",
          2: "rgb(var(--color-paper-2) / <alpha-value>)",
        },
        refund: {
          DEFAULT: "rgb(var(--color-refund) / <alpha-value>)",
          text: "rgb(var(--color-refund-text) / <alpha-value>)",
        },
        stamp: "rgb(var(--color-stamp) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        /* Néubrutalisme (site public, réf. LP3) — additif, ne remplace rien. */
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        "nb-ink": "rgb(var(--color-nb-ink) / <alpha-value>)",
        violet: "rgb(var(--color-violet) / <alpha-value>)",
        pink: "rgb(var(--color-pink) / <alpha-value>)",
        acid: "rgb(var(--color-acid) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        /* Néubrutalisme — appliquées via le scope `.nb` (cf. globals.css). */
        "nb-display": ["var(--font-nb-display)", "system-ui", "sans-serif"],
        "nb-body": ["var(--font-nb-body)", "system-ui", "sans-serif"],
        "nb-mono": ["var(--font-nb-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["12px", "1.5"],
        sm: ["14px", "1.6"],
        base: ["16px", "1.6"],
        lg: ["20px", "1.5"],
        xl: ["28px", "1.3"],
        "2xl": ["40px", "1.1"],
        hero: ["64px", "1.02"],
        /* Premium v2.1 — typo éditoriale géante (fluide, mobile-first). */
        mega: ["clamp(56px, 8.5vw, 104px)", "0.98"],
        giga: ["clamp(72px, 12vw, 160px)", "0.92"],
      },
      borderRadius: { card: "8px", field: "4px", badge: "999px" },
      maxWidth: { container: "1120px" },
      letterSpacing: { display: "-0.02em" },
      borderWidth: { 3: "3px" },
      /* Premium v2.1 — ombres « papier posé » chaudes (teintées ink, jamais grises). */
      boxShadow: {
        lift: "0 2px 0 rgb(var(--color-ink) / 0.06), 0 12px 28px -12px rgb(var(--color-ink) / 0.18)",
        deep: "0 2px 0 rgb(var(--color-ink) / 0.08), 0 18px 50px -18px rgb(var(--color-ink) / 0.32)",
        pile: "6px 6px 0 rgb(var(--color-paper-2)), 7px 7px 0 rgb(var(--color-line)), 0 24px 60px -24px rgb(var(--color-ink) / 0.35)",
        /* Néubrutalisme — ombres dures pleines (réf. LP3). */
        "nb-sm": "3px 3px 0 rgb(var(--color-nb-ink))",
        nb: "6px 6px 0 rgb(var(--color-nb-ink))",
        "nb-lg": "10px 10px 0 rgb(var(--color-nb-ink))",
      },
    },
  },
  plugins: [],
};

export default config;
