import type { ThemeInput } from "@lib/types";

/** Elegant, high-contrast dark theme with emerald green accents. */
const smaragde: ThemeInput = {
  name: { fr: "Émeraude (sombre)", en: "Emerald (dark)" },
  mode: "dark",
  colors: {
    bg: "#06130d",
    surface: "#0c1f17",
    surface2: "#132d22",
    border: "#1f4736",
    text: "#ecfdf5",
    textMuted: "#6ee7b7",
    accent: "#10b981",
    accentText: "#06130d",
    accentSoft: "#064e3b",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
    info: "#38bdf8",
    shadow: "0 4px 20px rgb(6 78 59 / 0.2), 0 16px 40px rgb(0 0 0 / 0.5)",
  },
};

export default smaragde;
