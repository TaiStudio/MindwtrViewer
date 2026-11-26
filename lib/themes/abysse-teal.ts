import type { ThemeInput } from "@lib/types";

/** Deep oceanic dark theme with vibrant teal and turquoise highlights. */
const abysseTeal: ThemeInput = {
  name: { fr: "Abysse Teal", en: "Abyssal Teal" },
  mode: "dark",
  colors: {
    bg: "#021017",
    surface: "#051b24",
    surface2: "#0a2a36",
    border: "#164e63",
    text: "#ecfeff",
    textMuted: "#a5f3fc",
    accent: "#06b6d4",
    accentText: "#021017",
    accentSoft: "#164e63",
    success: "#2dd4bf",
    warning: "#fbbf24",
    danger: "#f43f5e",
    info: "#38bdf8",
    shadow: "0 4px 20px rgb(6 182 212 / 0.15), 0 16px 40px rgb(0 0 0 / 0.7)",
  },
};

export default abysseTeal;
