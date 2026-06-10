import type { Config } from "tailwindcss";

/** Tailwind câblé EXCLUSIVEMENT sur les tokens de la charte (§2). */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#11192B",
        paper: { DEFAULT: "#FBFBF8", 2: "#F1F1EC" },
        refund: { DEFAULT: "#0B9E6B", text: "#087A52" },
        stamp: "#C8322B",
        line: "#D9D9D1",
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
