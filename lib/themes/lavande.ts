import type { ThemeInput } from "@lib/types";

/** Soft light theme with a violet-lavender accent. */
const lavande: ThemeInput = {
  name: { fr: "Lavande (doux)", en: "Lavender (soft)" },
  mode: "light",
  colors: {
    bg: "#f8f6fc",
    surface: "#ffffff",
    surface2: "#f1edf9",
    border: "#e2dbf3",
    text: "#261f38",
    textMuted: "#7a7191",
    accent: "#6d4fd0",
    accentText: "#ffffff",
    accentSoft: "#ebe4fb",
    success: "#4f9d69",
    warning: "#d98e2b",
    danger: "#d4546b",
    info: "#5b7fd6",
    shadow: "0 1px 2px rgb(60 40 110 / 0.05), 0 14px 34px rgb(60 40 110 / 0.08)",
  },
};

export default lavande;
