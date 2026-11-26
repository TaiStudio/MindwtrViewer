import type { ThemeInput } from "@lib/types";

/** Rich ruby wine dark theme with luxurious crimson accents and deep cabernet backgrounds. */
const vinRouge: ThemeInput = {
  name: { fr: "Vin Rouge", en: "Ruby Wine" },
  mode: "dark",
  colors: {
    bg: "#11080a",
    surface: "#1f1013",
    surface2: "#2d171b",
    border: "#4d262c",
    text: "#fae8eb",
    textMuted: "#e6b8bf",
    accent: "#e11d48",
    accentText: "#ffffff",
    accentSoft: "#4c0519",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f43f5e",
    info: "#38bdf8",
    shadow: "0 4px 20px rgb(225 29 72 / 0.15), 0 16px 40px rgb(0 0 0 / 0.7)",
  },
};

export default vinRouge;
