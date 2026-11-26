import type { ThemeInput } from "@lib/types";

/** Striking electric violet dark theme with vivid magenta pulses and neon highlights. */
const electroViolet: ThemeInput = {
  name: { fr: "Électro Violet", en: "Electro Violet" },
  mode: "dark",
  colors: {
    bg: "#0d0714",
    surface: "#170f24",
    surface2: "#241838",
    border: "#432a6b",
    text: "#f5f0ff",
    textMuted: "#c4b5fd",
    accent: "#8b5cf6",
    accentText: "#ffffff",
    accentSoft: "#3b0764",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#f43f5e",
    info: "#06b6d4",
    shadow: "0 4px 20px rgb(139 92 246 / 0.2), 0 16px 40px rgb(0 0 0 / 0.7)",
  },
};

export default electroViolet;
