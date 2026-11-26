import type { ThemeInput } from "@lib/types";

/** Sleek dark obsidian theme with clean monochromatic steel tones and stark white contrast. */
const monochromeDark: ThemeInput = {
  name: { fr: "Monochrome Sombre", en: "Monochrome Dark" },
  mode: "dark",
  colors: {
    bg: "#0a0a0a",
    surface: "#141414",
    surface2: "#1f1f1f",
    border: "#333333",
    text: "#ededed",
    textMuted: "#a1a1a1",
    accent: "#fafafa",
    accentText: "#0a0a0a",
    accentSoft: "#262626",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444",
    info: "#38bdf8",
    shadow: "0 4px 20px rgb(0 0 0 / 0.5), 0 16px 40px rgb(0 0 0 / 0.8)",
  },
};

export default monochromeDark;
