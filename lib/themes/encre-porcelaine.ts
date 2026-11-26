import type { ThemeInput } from "@lib/types";

/** Crisp porcelain and ink minimal theme inspired by traditional East Asian calligraphy. */
const encrePorcelaine: ThemeInput = {
  name: { fr: "Encre et Porcelaine", en: "Ink & Porcelain" },
  mode: "light",
  colors: {
    bg: "#fafafa",
    surface: "#ffffff",
    surface2: "#f0f0f0",
    border: "#d9d9d9",
    text: "#111111",
    textMuted: "#666666",
    accent: "#1f1f1f",
    accentText: "#ffffff",
    accentSoft: "#e6e6e6",
    success: "#15803d",
    warning: "#b45309",
    danger: "#b91c1c",
    info: "#0369a1",
    shadow: "0 4px 16px rgb(0 0 0 / 0.05), 0 12px 32px rgb(0 0 0 / 0.03)",
  },
};

export default encrePorcelaine;
