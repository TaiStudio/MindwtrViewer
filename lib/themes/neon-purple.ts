import type { ThemeInput } from "@lib/types";

/** Modern dark theme inspired by neon purple neon accents and deep midnight space. */
const neonPurple: ThemeInput = {
  name: { fr: "Néon Violet", en: "Neon Purple" },
  mode: "dark",
  colors: {
    bg: "#0b0714",
    surface: "#140e24",
    surface2: "#1f1636",
    border: "#362859",
    text: "#f3e8ff",
    textMuted: "#d8b4fe",
    accent: "#c084fc",
    accentText: "#0b0714",
    accentSoft: "#3b0764",
    success: "#4ade80",
    warning: "#facc15",
    danger: "#f87171",
    info: "#38bdf8",
    shadow: "0 4px 20px rgb(192 132 252 / 0.15), 0 16px 40px rgb(0 0 0 / 0.6)",
  },
};

export default neonPurple;
