import type { ThemeInput } from "@lib/types";

/** Cool light theme with a classic blue accent. */
const azur: ThemeInput = {
  name: { fr: "Azur (bleu)", en: "Azure (blue)" },
  mode: "light",
  colors: {
    bg: "#f5f8fc",
    surface: "#ffffff",
    surface2: "#ecf1f8",
    border: "#dbe4f0",
    text: "#14213a",
    textMuted: "#64748b",
    accent: "#1769e0",
    accentText: "#ffffff",
    accentSoft: "#e3edfd",
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#0ea5e9",
    shadow: "0 1px 2px rgb(30 60 110 / 0.05), 0 14px 34px rgb(30 60 110 / 0.08)",
  },
};

export default azur;
