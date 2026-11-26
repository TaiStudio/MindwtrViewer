import type { ThemeInput } from "@lib/types";

/** Crisp alpine pine dark theme with forest green needles and cool mist highlights. */
const foretAlpine: ThemeInput = {
  name: { fr: "Forêt Alpine", en: "Alpine Pine" },
  mode: "dark",
  colors: {
    bg: "#0a120e",
    surface: "#101d16",
    surface2: "#192e23",
    border: "#294d3a",
    text: "#ecfdf5",
    textMuted: "#9ca3af",
    accent: "#059669",
    accentText: "#ffffff",
    accentSoft: "#064e3b",
    success: "#10b981",
    warning: "#fbbf24",
    danger: "#f87171",
    info: "#38bdf8",
    shadow: "0 4px 20px rgb(5 150 105 / 0.15), 0 16px 40px rgb(0 0 0 / 0.7)",
  },
};

export default foretAlpine;
