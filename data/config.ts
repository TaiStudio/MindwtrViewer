import type { UserConfig } from "@lib/types";

/**
 * Viewer configuration — edit and save, the next refresh picks it up.
 *
 * Every field is optional: anything omitted falls back to `DEFAULT_CONFIG`
 * (`lib/defaults.ts`). `?` completion in your editor shows what's available.
 */
const config: UserConfig = {
  siteName: "Mindwtr Viewer",
  language: "fr",
  theme: "moderne",
  refreshIntervalMs: 4000,
  calendar: {
    dateField: "updatedAt",
  },
  references: {
    label: null,
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
  hideDeleted: true,
  hideArchived: false,
};

export default config;
