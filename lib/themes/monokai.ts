import type { ThemeInput } from "@lib/types";

/** Clean, high-contrast monochrome dark theme. */
const monokaiDark: ThemeInput = {
  name: { fr: "Monokai Nuit", en: "Monokai Dark" },
  mode: "dark",
  colors: {
    bg: "#272822",
    surface: "#1e1f1c",
    surface2: "#383a32",
    border: "#49483e",
    text: "#f8f8f2",
    textMuted: "#75715e",
    accent: "#a6e22e",
    accentText: "#1e1f1c",
    accentSoft: "#3a4d17",
    success: "#a6e22e",
    warning: "#fd971f",
    danger: "#f92672",
    info: "#66d9ef",
    shadow: "0 4px 20px rgb(0 0 0 / 0.4)",
  },
};

export default monokaiDark;
