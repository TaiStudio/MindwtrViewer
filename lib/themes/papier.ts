import type { ThemeInput } from "@/lib/types";

/** Warm cream paper with deep navy ink. */
const papier: ThemeInput = {
  name: { fr: "Papier (crème, encre bleue)", en: "Paper (cream, blue ink)" },
  mode: "light",
  colors: {
    bg: "#f7f4ec",
    surface: "#fffdf7",
    surface2: "#f1ede2",
    border: "#e3ddcc",
    text: "#22304a",
    textMuted: "#6b7488",
    accent: "#1f3f7a",
    accentText: "#ffffff",
    accentSoft: "#e8edf7",
    success: "#2f7d4f",
    warning: "#b4761c",
    danger: "#b33a3a",
    info: "#2f6fb3",
    shadow: "0 1px 2px rgb(70 60 40 / 0.05), 0 14px 34px rgb(70 60 40 / 0.07)",
  },
};

export default papier;
