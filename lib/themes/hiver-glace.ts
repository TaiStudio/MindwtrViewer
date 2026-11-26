import type { ThemeInput } from "@lib/types";

/** Crisp winter frost theme with clean ice blues and bright modern contrast. */
const hiverGlacé: ThemeInput = {
  name: { fr: "Hiver Glacé", en: "Glacial Winter" },
  mode: "light",
  colors: {
    bg: "#f4f8fb",
    surface: "#ffffff",
    surface2: "#e8eff5",
    border: "#cbd5e1",
    text: "#0f172a",
    textMuted: "#64748b",
    accent: "#0284c7",
    accentText: "#ffffff",
    accentSoft: "#e0f2fe",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
    shadow: "0 4px 16px rgb(2 132 199 / 0.08), 0 12px 32px rgb(15 23 42 / 0.05)",
  },
};

export default hiverGlacé;
