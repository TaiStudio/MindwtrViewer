import type { ThemeInput } from "@/lib/types";

/** Luxurious pastel violet and plum theme with soft royal highlights. */
const violette: ThemeInput = {
  name: { fr: "Violette", en: "Violet" },
  mode: "light",
  colors: {
    bg: "#f8f5fc",
    surface: "#ffffff",
    surface2: "#f0eaf8",
    border: "#ded3ee",
    text: "#2c223b",
    textMuted: "#7a6b91",
    accent: "#8b5cf6",
    accentText: "#ffffff",
    accentSoft: "#f3e8ff",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#6366f1",
    shadow: "0 1px 3px rgb(90 60 130 / 0.05), 0 10px 30px rgb(90 60 130 / 0.07)",
  },
};

export default violette;
