import type { AppConfig, ReferenceGroupId } from "./types";

/**
 * Fallback configuration. Everything here can be overridden by editing
 * data/config.ts — the file is re-read on every refresh.
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
  references: {
    /** `null` → use the translated `tabReferences` label from the language files. */
    label: null,
    /** Empty groups and entries without task are hidden by default. */
    hideEmpty: true,
    groups: {
      tasks: { hidden: false, label: null },
      areas: { hidden: false, label: null },
      people: { hidden: false, label: null },
      projects: { hidden: false, label: null },
      sections: { hidden: false, label: null },
      contexts: { hidden: false, label: null },
    },
  },
  /** Deleted tasks stay out of the views unless you ask for them. */
  hideDeleted: true,
  hideArchived: false,
};

function pick(obj: unknown): Record<string, unknown> {
  return obj && typeof obj === "object" && !Array.isArray(obj)
    ? (obj as Record<string, unknown>)
    : {};
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/** `null` → absent; string → plain label; object → per-locale label map. */
function label(
  v: unknown,
): string | Record<string, string> | null {
  if (typeof v === "string" && v) return v;
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, string>;
  return null;
}

function groupConfig(raw: unknown): AppConfig["references"]["groups"] {
  const g = pick(raw);
  const out = {} as AppConfig["references"]["groups"];
  for (const id of Object.keys(DEFAULT_CONFIG.references.groups) as ReferenceGroupId[]) {
    const entry = pick(g[id]);
    const def = DEFAULT_CONFIG.references.groups[id];
    out[id] = {
      hidden: bool(entry.hidden, def.hidden),
      label: label(entry.label),
    };
  }
  return out;
}

/**
 * Merge whatever is in data/config.ts over the defaults, so an empty or
 * partial config file never breaks the site.
 */
export function mergeConfig(raw: unknown): AppConfig {
  const cfg = pick(raw);
  const calendar = pick(cfg.calendar);
  const references = pick(cfg.references);

  const language = typeof cfg.language === "string" && cfg.language ? cfg.language : DEFAULT_CONFIG.language;
  const theme = typeof cfg.theme === "string" && cfg.theme ? cfg.theme : DEFAULT_CONFIG.theme;
  const dateField = calendar.dateField === "createdAt" ? "createdAt" : "updatedAt";
  const refreshRaw = typeof cfg.refreshIntervalMs === "number" ? cfg.refreshIntervalMs : NaN;

  // Accept both the nested `references.label` and the older top-level
  // `referencesLabel` so an in-flight config keeps working.
  const tabLabel = label(references.label) ?? label(cfg.referencesLabel);

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
    references: {
      label: tabLabel,
      hideEmpty: bool(references.hideEmpty, DEFAULT_CONFIG.references.hideEmpty),
      groups: groupConfig(references.groups),
    },
    hideDeleted: bool(cfg.hideDeleted, DEFAULT_CONFIG.hideDeleted),
    hideArchived: bool(cfg.hideArchived, DEFAULT_CONFIG.hideArchived),
  };
}
