import type { ThemeInput } from "@lib/types";

/** Sleek cybernetic dark theme with bright neon chartreuse accents and deep asphalt tones. */
const matrixGreen: ThemeInput = {
  name: { fr: "Matrice Verte", en: "Matrix Green" },
  mode: "dark",
  colors: {
    bg: "#090d0a",
    surface: "#101a12",
    surface2: "#192b1d",
    border: "#284a2f",
    text: "#e2fee8",
    textMuted: "#86efac",
    accent: "#22c55e",
    accentText: "#090d0a",
    accentSoft: "#052e16",
    success: "#4ade80",
    warning: "#facc15",
    danger: "#ef4444",
    info: "#38bdf8",
    shadow: "0 4px 20px rgb(34 197 94 / 0.15), 0 16px 40px rgb(0 0 0 / 0.6)",
  },
};

export default matrixGreen;
