import type { ThemeInput } from "@lib/types";

/** Deep space theme with rich indigo and cosmic purple accents. */
const cosmos: ThemeInput = {
  name: { fr: "Cosmos", en: "Cosmos" },
  mode: "dark",
  colors: {
    bg: "#0d0f18",
    surface: "#141726",
    surface2: "#1d2138",
    border: "#2e3454",
    text: "#e2e8f0",
    textMuted: "#8892b0",
    accent: "#818cf8",
    accentText: "#0d0f18",
    accentSoft: "#1e224f",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
    info: "#38bdf8",
    shadow: "0 4px 20px rgb(15 23 42 / 0.6), 0 16px 40px rgb(0 0 0 / 0.5)",
  },
};

export default cosmos;
