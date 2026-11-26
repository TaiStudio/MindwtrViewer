import type { ThemeInput } from "@lib/types";

/** Warm terracotta theme inspired by rustic Mediterranean clay and sunbaked earth. */
const terracotta: ThemeInput = {
  name: { fr: "Terre cuite", en: "Terracotta" },
  mode: "light",
  colors: {
    bg: "#faf6f2",
    surface: "#f2ece4",
    surface2: "#e6ded2",
    border: "#d4c5b3",
    text: "#2c241d",
    textMuted: "#7a6a5b",
    accent: "#c85a32",
    accentText: "#ffffff",
    accentSoft: "#f7e5df",
    success: "#4b8b3b",
    warning: "#d97706",
    danger: "#b91c1c",
    info: "#0284c7",
    shadow: "0 4px 20px rgb(200 90 50 / 0.08), 0 12px 32px rgb(44 36 29 / 0.05)",
  },
};

export default terracotta;
