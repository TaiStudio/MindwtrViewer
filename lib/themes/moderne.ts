import type { ThemeInput } from "@/lib/types";

/** Default theme: modern & minimalist. */
const moderne: ThemeInput = {
  name: { fr: "Moderne & minimaliste", en: "Modern & minimalist" },
  mode: "light",
  colors: {
    bg: "#fafafa",
    surface: "#ffffff",
    surface2: "#f4f4f5",
    border: "#e8e8ec",
    text: "#18181b",
    textMuted: "#71717a",
    accent: "#18181b",
    accentText: "#ffffff",
    accentSoft: "#f0f0f2",
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#2563eb",
    shadow: "0 1px 2px rgb(0 0 0 / 0.04), 0 12px 32px rgb(0 0 0 / 0.05)",
  },
};

export default moderne;
