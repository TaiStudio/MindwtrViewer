import type { ThemeInput } from "@lib/types";

/** Warm vintage coffee theme with rich roast tones and warm cream accents. */
const cafeMocha: ThemeInput = {
  name: { fr: "Café Mocha", en: "Cafe Mocha" },
  mode: "dark",
  colors: {
    bg: "#181412",
    surface: "#241f1c",
    surface2: "#332c28",
    border: "#4e433c",
    text: "#f5f3f0",
    textMuted: "#d7ccc8",
    accent: "#d78240",
    accentText: "#181412",
    accentSoft: "#4a2e18",
    success: "#85a55c",
    warning: "#e5a953",
    danger: "#d96b6b",
    info: "#61afef",
    shadow: "0 4px 20px rgb(215 130 64 / 0.12), 0 16px 40px rgb(0 0 0 / 0.6)",
  },
};

export default cafeMocha;
