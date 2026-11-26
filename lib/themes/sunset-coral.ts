import type { ThemeInput } from "@lib/types";

/** Tropical sunset dark theme with vibrant coral pinks and warm dusk gradients. */
const sunsetCoral: ThemeInput = {
  name: { fr: "Coucher de soleil", en: "Sunset Coral" },
  mode: "dark",
  colors: {
    bg: "#130912",
    surface: "#211120",
    surface2: "#301a2f",
    border: "#522b50",
    text: "#feebe2",
    textMuted: "#f4a261",
    accent: "#ff5964",
    accentText: "#ffffff",
    accentSoft: "#591c24",
    success: "#2a9d8f",
    warning: "#e9c46a",
    danger: "#e76f51",
    info: "#4ea8de",
    shadow: "0 4px 20px rgb(255 89 100 / 0.15), 0 16px 40px rgb(0 0 0 / 0.7)",
  },
};

export default sunsetCoral;
