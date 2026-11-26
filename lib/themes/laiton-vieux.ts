import type { ThemeInput } from "@lib/types";

/** Warm vintage brass theme with golden metallic accents and rich sepia undertones. */
const laitonVieux: ThemeInput = {
  name: { fr: "Laiton Ancien", en: "Vintage Brass" },
  mode: "dark",
  colors: {
    bg: "#16130e",
    surface: "#221d17",
    surface2: "#332a21",
    border: "#524335",
    text: "#fbf8f2",
    textMuted: "#d4b584",
    accent: "#d4af37",
    accentText: "#16130e",
    accentSoft: "#4a3c10",
    success: "#65a30d",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#0284c7",
    shadow: "0 4px 20px rgb(212 175 55 / 0.12), 0 16px 40px rgb(0 0 0 / 0.7)",
  },
};

export default laitonVieux;
