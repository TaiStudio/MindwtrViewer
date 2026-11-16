import type { ThemeInput } from "@/lib/types";

/** Fresh light theme with a mint-green accent. */
const menthe: ThemeInput = {
  name: { fr: "Menthe (clair)", en: "Mint (light)" },
  mode: "light",
  colors: {
    bg: "#f2faf6",
    surface: "#ffffff",
    surface2: "#e7f4ee",
    border: "#d1e9de",
    text: "#0f2b21",
    textMuted: "#5b7a6c",
    accent: "#0b8f63",
    accentText: "#ffffff",
    accentSoft: "#d9f3e8",
    success: "#0b8f63",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#0284c7",
    shadow: "0 1px 2px rgb(20 80 60 / 0.05), 0 14px 34px rgb(20 80 60 / 0.07)",
  },
};

export default menthe;
