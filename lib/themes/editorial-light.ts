import type { ThemeInput } from "@lib/types";

/** Crisp and clean light theme inspired by clean editorial design and warm cream paper. */
const editorialLight: ThemeInput = {
  name: { fr: "Éditorial Clair", en: "Editorial Light" },
  mode: "light",
  colors: {
    bg: "#fcfbf9",
    surface: "#f4f2ee",
    surface2: "#eae5dc",
    border: "#d6cfc7",
    text: "#1c1917",
    textMuted: "#78716c",
    accent: "#ea580c",
    accentText: "#ffffff",
    accentSoft: "#ffedd5",
    success: "#16a34a",
    warning: "#ca8a04",
    danger: "#dc2626",
    info: "#0284c7",
    shadow: "0 4px 20px rgb(28 25 23 / 0.05), 0 12px 32px rgb(28 25 23 / 0.08)",
  },
};

export default editorialLight;
