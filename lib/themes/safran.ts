import type { ThemeInput } from "@lib/types";

/** Warm light theme with a golden-saffron accent. */
const safran: ThemeInput = {
  name: { fr: "Safran (ambre)", en: "Saffron (amber)" },
  mode: "light",
  colors: {
    bg: "#fffaf2",
    surface: "#ffffff",
    surface2: "#fdf2e2",
    border: "#f2e3ca",
    text: "#33251a",
    textMuted: "#8a7560",
    accent: "#c26a10",
    accentText: "#ffffff",
    accentSoft: "#fcecd4",
    success: "#5b8c5a",
    warning: "#d97706",
    danger: "#d2453a",
    info: "#3a7ca5",
    shadow: "0 1px 2px rgb(120 80 30 / 0.05), 0 14px 34px rgb(120 80 30 / 0.08)",
  },
};

export default safran;
