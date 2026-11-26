import type { ThemeInput } from "@lib/types";

/** Crisp, refreshing Nordic ice theme with cool blue and slate tones. */
const nordique: ThemeInput = {
  name: { fr: "Nordique", en: "Nordic" },
  mode: "light",
  colors: {
    bg: "#f3f6f9",
    surface: "#ffffff",
    surface2: "#e5ecf4",
    border: "#d0dce8",
    text: "#2e3b4e",
    textMuted: "#7a8b9e",
    accent: "#5e81ac",
    accentText: "#ffffff",
    accentSoft: "#e2ebf5",
    success: "#a3be8c",
    warning: "#ebcb8b",
    danger: "#bf616a",
    info: "#88c0d0",
    shadow: "0 1px 3px rgb(46 59 78 / 0.05), 0 10px 30px rgb(46 59 78 / 0.07)",
  },
};

export default nordique;
