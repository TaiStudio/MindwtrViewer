import type { ThemeInput } from "@lib/types";

/** Deep midnight steel theme with cool electric blue highlights and dark industrial tones. */
const acierBleu: ThemeInput = {
  name: { fr: "Acier Bleu", en: "Blue Steel" },
  mode: "dark",
  colors: {
    bg: "#080c10",
    surface: "#111822",
    surface2: "#1c2636",
    border: "#2e3f59",
    text: "#f0f4f8",
    textMuted: "#94a3b8",
    accent: "#3b82f6",
    accentText: "#ffffff",
    accentSoft: "#1e3a8a",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#06b6d4",
    shadow: "0 4px 20px rgb(59 130 246 / 0.15), 0 16px 40px rgb(0 0 0 / 0.7)",
  },
};

export default acierBleu;
