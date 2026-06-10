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
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["12px", "1.5"],
        sm: ["14px", "1.6"],
        base: ["16px", "1.6"],
        lg: ["20px", "1.5"],
        xl: ["28px", "1.3"],
        "2xl": ["40px", "1.1"],
        hero: ["64px", "1.02"],
      },
      borderRadius: { card: "8px", field: "4px", badge: "999px" },
      maxWidth: { container: "1120px" },
      letterSpacing: { display: "-0.02em" },
    },
  },
  plugins: [],
};

export default config;
