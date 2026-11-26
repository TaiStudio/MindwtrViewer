import type { ThemeInput } from "@lib/types";

/** Warm autumn theme featuring rich terracotta, amber, and olive tones. */
const automne: ThemeInput = {
  name: { fr: "Automne", en: "Autumn" },
  mode: "light",
  colors: {
    bg: "#faf6f0",
    surface: "#ffffff",
    surface2: "#f2ece1",
    border: "#e2d7c5",
    text: "#3b2f2f",
    textMuted: "#8c7a6b",
    accent: "#b85d33",
    accentText: "#ffffff",
    accentSoft: "#fae8e0",
    success: "#658c43",
    warning: "#d9822b",
    danger: "#b83b3b",
    info: "#3f729b",
    shadow: "0 1px 3px rgb(59 47 47 / 0.06), 0 10px 30px rgb(59 47 47 / 0.08)",
  },
};

export default automne;
