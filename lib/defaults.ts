import type { AppConfig } from "./types";

/**
 * Fallback configuration. Everything here can be overridden by editing
 * data/config.json — the file is re-read on every refresh.
 *
 * Note: languages (`lib/i18n/*.ts`) and themes (`lib/themes/*.ts`) are
 * discovered from files, not from this config; it only selects the defaults.
 */
export const DEFAULT_CONFIG: AppConfig = {
  siteName: "Mindwtr Viewer",
  language: "fr",
  theme: "moderne",
  refreshIntervalMs: 4000,
  calendar: { dateField: "updatedAt" },
};

function pick(obj: unknown): Record<string, unknown> {
  return obj && typeof obj === "object" && !Array.isArray(obj)
    ? (obj as Record<string, unknown>)
    : {};
}

/**
 * Merge whatever is in data/config.json over the defaults, so an empty or
 * partial config file never breaks the site.
 */
export function mergeConfig(raw: unknown): AppConfig {
  const cfg = pick(raw);
  const calendar = pick(cfg.calendar);

  const language = typeof cfg.language === "string" && cfg.language ? cfg.language : DEFAULT_CONFIG.language;
  const theme = typeof cfg.theme === "string" && cfg.theme ? cfg.theme : DEFAULT_CONFIG.theme;
  const dateField = calendar.dateField === "createdAt" ? "createdAt" : "updatedAt";
  const refreshRaw = typeof cfg.refreshIntervalMs === "number" ? cfg.refreshIntervalMs : NaN;

  return {
    siteName:
      typeof cfg.siteName === "string" || (cfg.siteName && typeof cfg.siteName === "object")
        ? (cfg.siteName as AppConfig["siteName"])
        : DEFAULT_CONFIG.siteName,
    language,
    theme,
    refreshIntervalMs:
      Number.isFinite(refreshRaw) && refreshRaw >= 500
        ? Math.min(refreshRaw, 60_000)
        : DEFAULT_CONFIG.refreshIntervalMs,
    calendar: { dateField },
  };
}
