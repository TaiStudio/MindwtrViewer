import type { ThemeInput } from "@/lib/types";

/** Dark, low-contrast theme. */
const minuit: ThemeInput = {
  name: { fr: "Minuit (sombre)", en: "Midnight (dark)" },
  mode: "dark",
  colors: {
    bg: "#0b0b0d",
    surface: "#131316",
    surface2: "#1a1a1f",
    border: "#27272c",
    text: "#f4f4f5",
    textMuted: "#a1a1aa",
    accent: "#fafafa",
    accentText: "#101012",
    accentSoft: "#1f1f24",
    success: "#4ade80",
    warning: "#fbbf24",
    danger: "#f87171",
    info: "#60a5fa",
    shadow: "0 1px 2px rgb(0 0 0 / 0.4), 0 16px 40px rgb(0 0 0 / 0.35)",
  },
};

export default minuit;
