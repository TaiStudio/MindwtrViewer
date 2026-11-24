import type { ThemeInput } from "@/lib/types";

/** Warm retro dark theme inspired by 1980s terminal amber monitors. */
const ambre: ThemeInput = {
  name: { fr: "Ambre rétro", en: "Retro Amber" },
  mode: "dark",
  colors: {
    bg: "#14110e",
    surface: "#1f1a14",
    surface2: "#2d261e",
    border: "#473a2e",
    text: "#ffb000",
    textMuted: "#b37d00",
    accent: "#ffb000",
    accentText: "#14110e",
    accentSoft: "#332400",
    success: "#73d216",
    warning: "#f57900",
    danger: "#cc0000",
    info: "#3465a4",
    shadow: "0 4px 20px rgb(255 176 0 / 0.1), 0 16px 40px rgb(0 0 0 / 0.7)",
  },
};

export default ambre;
