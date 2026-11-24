import type { ThemeInput } from "@/lib/types";

/** Cyberpunk dark theme with vibrant neon pink and cyan highlights. */
const cyberpunk: ThemeInput = {
  name: { fr: "Cyberpunk", en: "Cyberpunk" },
  mode: "dark",
  colors: {
    bg: "#080511",
    surface: "#100c24",
    surface2: "#191238",
    border: "#2d205c",
    text: "#f0eeff",
    textMuted: "#9b92cc",
    accent: "#ff007f",
    accentText: "#ffffff",
    accentSoft: "#330022",
    success: "#00ffcc",
    warning: "#ffaa00",
    danger: "#ff3366",
    info: "#00dfff",
    shadow: "0 4px 20px rgb(255 0 127 / 0.15), 0 16px 40px rgb(0 0 0 / 0.6)",
  },
};

export default cyberpunk;
