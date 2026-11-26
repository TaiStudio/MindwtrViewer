import type { ThemeInput } from "@lib/types";

/** Soft sepia and parchment theme reminiscent of old vintage books. */
const parchemin: ThemeInput = {
  name: { fr: "Parchemin", en: "Parchment" },
  mode: "light",
  colors: {
    bg: "#f4f1ea",
    surface: "#fffdfa",
    surface2: "#eae5d9",
    border: "#d4cebe",
    text: "#3d3832",
    textMuted: "#877d6f",
    accent: "#8b4513",
    accentText: "#ffffff",
    accentSoft: "#eaddcf",
    success: "#38761d",
    warning: "#b45f06",
    danger: "#990000",
    info: "#1d6fa5",
    shadow: "0 1px 3px rgb(60 50 40 / 0.08), 0 10px 30px rgb(60 50 40 / 0.06)",
  },
};

export default parchemin;
