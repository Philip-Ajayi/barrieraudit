import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: "#0f172a",
        "surface-card": "#141e33",
        "clinical-cyan": "#06b6d4",
        "alert-crimson": "#ef4444",
        "barrier-green": "#10b981",
        "lipid-gold": "#f59e0b",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(6, 182, 212, 0.25)",
        crimsonGlow: "0 0 25px -5px rgba(239, 68, 68, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
