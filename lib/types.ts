// Shared types for the viewer.

import type { ResolvedLocale } from "./i18n/locale";

/** Locale code (`"fr"`, `"en"`, `"de"`, …) — one per file in `lib/i18n/`. */
export type Lang = string;

/** Raw checklist item as stored in tasks.json */
export interface RawChecklistItem {
  id: string;
  title: string;
  isCompleted?: boolean;
}

/** Raw attachment as stored in tasks.json */
export interface RawAttachment {
  id: string;
  kind?: string;
  title?: string;
  uri?: string;
  cloudKey?: string;
  deletedAt?: string | null;
  size?: number;
}

/** Raw task exactly as it comes from data/tasks.json (unknown fields are kept). */
export interface RawTask {
  id: string;
  title: string;
  status?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  projectId?: string;
  sectionId?: string;
  areaId?: string;
  assignedTo?: string;
  deletedAt?: string | null;
  archivedAt?: string | null;
  tags?: string[];
  contexts?: unknown[];
  checklist?: RawChecklistItem[];
  attachments?: RawAttachment[];
  order?: number;
  orderNum?: number;
  taskMode?: string;
  isFocusedToday?: boolean;
  rev?: number;
  [key: string]: unknown;
}

/** A normalized, UI-ready task. */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  projectId: string | null;
  /** Section inside the project (tasks.json `sectionId`). */
  sectionId: string | null;
  /** Area the task belongs to directly (tasks.json `areaId`). */
  areaId: string | null;
  /** Person the task is assigned to (tasks.json `assignedTo`, a name). */
  assignedTo: string | null;
  /** Context tokens, e.g. `["@craft", "@mob"]`. */
  contexts: string[];
  tags: string[];
  focused: boolean;
  /** Soft-deleted (`deletedAt`) / archived (`archivedAt`) — shown or hidden
   *  according to the `hideDeleted` / `hideArchived` config flags. */
  deleted: boolean;
  archived: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  order: number;
  checklist: { id: string; title: string; completed: boolean }[];
  attachments: Attachment[];
  /** 0..1 — checklist completion when a checklist exists, else status-based. */
  progress: number;
}

/** A normalized attachment (`kind`: `"file"` | `"link"` | …). */
export interface Attachment {
  id: string;
  title: string;
  /** Raw `uri` — may be empty for files stored under `public/`. */
  uri: string;
  kind: string;
  /** Path inside `public/`, e.g. `attachments/<id>.png`. */
  cloudKey: string | null;
  /** Soft-deleted (`deletedAt`) — never shown. */
  deleted: boolean;
  /** Bytes, when known. */
  size: number | null;
}

/* ------------------------------ references ----------------------------- */

/** `areas[]` from tasks.json. */
export interface AreaRef {
  id: string;
  name: string;
  color: string | null;
  order: number;
}

/** `people[]` from tasks.json. */
export interface PersonRef {
  id: string;
  name: string;
  order: number;
}

/** `projects[]` from tasks.json. */
export interface ProjectRef {
  id: string;
  title: string;
  areaId: string | null;
  areaTitle: string | null;
  color: string | null;
  status: string | null;
  order: number;
}

/** `sections[]` from tasks.json. */
export interface SectionRef {
  id: string;
  title: string;
  projectId: string | null;
  order: number;
}

/** Everything the "References" tab renders. */
export interface ReferenceData {
  areas: AreaRef[];
  people: PersonRef[];
  projects: ProjectRef[];
  sections: SectionRef[];
  /** Context tokens = `settings.taxonomy.contexts` ∪ contexts used by tasks. */
  contexts: string[];
}

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  shadow?: string;
}

/** A theme as resolved at runtime (id + full palette). */
export interface ThemeDef {
  id: string;
  /** Plain string or a map keyed by locale code (`{ "fr": "…", "en": "…" }`). */
  name: string | Record<string, string>;
  mode?: "light" | "dark";
  colors: ThemeColors;
}

/**
 * What a file in `lib/themes/` exports. Only `colors` is required — `id`
 * defaults to the file name and the palette falls back to the default one.
 *
 * ```ts
 * import type { ThemeInput } from "@lib/types";
 * const neon: ThemeInput = { name: "Néon", mode: "dark", colors: { bg: "#05050a" } };
 * export default neon;
 * ```
 */
export interface ThemeInput {
  id?: string;
  name?: string | Record<string, string>;
  mode?: "light" | "dark";
  colors: Partial<ThemeColors>;
}

export interface AppConfig {
  siteName: string | Record<string, string>;
  /** Default locale code — must match a file in `lib/i18n/`. */
  language: Lang;
  /** Default theme id — must match a file in `lib/themes/`. */
  theme: string;
  /** Polling interval (ms) used to re-read data/tasks.json & data/config.ts */
  refreshIntervalMs: number;
  calendar: { dateField: "createdAt" | "updatedAt" };
  /** Presentation of the "Références" tab — see `ReferencesConfig`. */
  references: ReferencesConfig;
  /** Hide tasks carrying `deletedAt` (default: show them, as before). */
  hideDeleted: boolean;
  /** Hide tasks carrying `archivedAt`. */
  hideArchived: boolean;
}

/** Every key optional, recursively — helper for {@link UserConfig}. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * What `data/config.ts` exports (default export): any subset of
 * {@link AppConfig}. Missing fields fall back to `DEFAULT_CONFIG`
 * (`lib/defaults.ts`), so a nearly empty file is valid.
 *
 * ```ts
 * import type { UserConfig } from "@lib/types";
 * const config: UserConfig = { theme: "minuit" };
 * export default config;
 * ```
 */
export type UserConfig = DeepPartial<AppConfig>;

/** Identifiers of the groups shown in the "Références" tab. */
export type ReferenceGroupId =
  | "tasks"
  | "areas"
  | "people"
  | "projects"
  | "sections"
  | "contexts";

/** Per-group switch: hide it, and/or override its translated label. */
export interface ReferenceGroupConfig {
  /** Force-hide the group, whatever it contains. */
  hidden: boolean;
  /** `null` → use the translated label from the language files. */
  label: string | Record<string, string> | null;
}

/** `references` block of data/config.ts. */
export interface ReferencesConfig {
  /** Tab label. `null` → translated `tabReferences`. */
  label: string | Record<string, string> | null;
  /**
   * Hide empty groups, and inside a group hide every entry with no task.
   * `false` shows everything, even a group with zero entries.
   */
  hideEmpty: boolean;
  groups: Record<ReferenceGroupId, ReferenceGroupConfig>;
}

/** Main navigation tabs. */
export type ViewId = "board" | "calendar" | "roadmap" | "tasks" | "references";

/** What the client receives from the API. */
export interface DataSet {
  ok: boolean;
  error?: string;
  tasks: Task[];
  config: AppConfig;
  /** Languages discovered in `lib/i18n/`. */
  locales: ResolvedLocale[];
  /** Themes discovered in `lib/themes/`. */
  themes: ThemeDef[];
  /** Areas / people / projects / sections / contexts from tasks.json. */
  references: ReferenceData;
  /** ISO timestamps of the source files, for the "last updated" hint. */
  sources: { tasks: string | null; config: string | null };
  /** ISO time of this response. */
  generatedAt: string;
}
