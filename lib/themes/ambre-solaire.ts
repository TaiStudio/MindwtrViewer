import type { ThemeInput } from "@lib/types";

/** Warm golden amber sunset theme inspired by rich autumnal honey and glowing firelight. */
const ambreSolaire: ThemeInput = {
  name: { fr: "Ambre Solaire", en: "Solar Amber" },
  mode: "dark",
  colors: {
    bg: "#16110a",
    surface: "#241b10",
    surface2: "#332717",
    border: "#544026",
    text: "#fffbeb",
    textMuted: "#fde68a",
    accent: "#f59e0b",
    accentText: "#16110a",
    accentSoft: "#451a03",
    success: "#10b981",
    warning: "#fbbf24",
    danger: "#ef4444",
    info: "#38bdf8",
    shadow: "0 4px 20px rgb(245 158 11 / 0.15), 0 16px 40px rgb(0 0 0 / 0.7)",
  },
};

export default ambreSolaire;
