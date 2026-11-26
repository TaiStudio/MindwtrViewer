import type { ThemeInput } from "@lib/types";

/** Tranquil zen garden light theme with soft sand textures and gentle slate grey highlights. */
const zenJardin: ThemeInput = {
  name: { fr: "Jardin Zen", en: "Zen Garden" },
  mode: "light",
  colors: {
    bg: "#f7f7f5",
    surface: "#ffffff",
    surface2: "#efefe9",
    border: "#deded8",
    text: "#262624",
    textMuted: "#73736f",
    accent: "#52796f",
    accentText: "#ffffff",
    accentSoft: "#d8e2dc",
    success: "#386641",
    warning: "#bc6c25",
    danger: "#bc4749",
    info: "#457b9d",
    shadow: "0 4px 16px rgb(82 121 111 / 0.08), 0 12px 32px rgb(38 38 36 / 0.04)",
  },
};

export default zenJardin;
