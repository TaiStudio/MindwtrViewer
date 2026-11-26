import type { ThemeInput } from "@lib/types";

/** Ultra-clean, high-contrast dark theme with a sleek slate finish. */
const obsidian: ThemeInput = {
  name: { fr: "Obsidienne", en: "Obsidian" },
  mode: "dark",
  colors: {
    bg: "#0f1115",
    surface: "#161920",
    surface2: "#1e222b",
    border: "#2b303c",
    text: "#e6edf3",
    textMuted: "#8b949e",
    accent: "#58a6ff",
    accentText: "#0f1115",
    accentSoft: "#1f3358",
    success: "#3fb950",
    warning: "#d29922",
    danger: "#f85149",
    info: "#79c0ff",
    shadow: "0 4px 20px rgb(0 0 0 / 0.5)",
  },
};

export default obsidian;
