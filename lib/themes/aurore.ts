import type { ThemeInput } from "@lib/types";

/** Soft light theme with a terracotta accent. */
const aurore: ThemeInput = {
  name: { fr: "Aurore (doux)", en: "Dawn (soft)" },
  mode: "light",
  colors: {
    bg: "#fdfcf9",
    surface: "#ffffff",
    surface2: "#f6f4ee",
    border: "#eae6dc",
    text: "#2c2a26",
    textMuted: "#8a857a",
    accent: "#c2653a",
    accentText: "#ffffff",
    accentSoft: "#f7ece5",
    success: "#5b8c5a",
    warning: "#d6a14a",
    danger: "#c05a4a",
    info: "#4a7c8c",
    shadow: "0 1px 2px rgb(74 60 40 / 0.05), 0 14px 34px rgb(74 60 40 / 0.07)",
  },
};

export default aurore;
