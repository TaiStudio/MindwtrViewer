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
  tags: string[];
  focused: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  order: number;
  checklist: { id: string; title: string; completed: boolean }[];
  attachments: { id: string; title: string; uri: string; kind: string }[];
  /** 0..1 — checklist completion when a checklist exists, else status-based. */
  progress: number;
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
 * import type { ThemeInput } from "@/lib/types";
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
  /** Polling interval (ms) used to re-read data/tasks.json & data/config.json */
  refreshIntervalMs: number;
  calendar: { dateField: "createdAt" | "updatedAt" };
}

/** Main navigation tabs. */
export type ViewId = "board" | "calendar" | "roadmap" | "tasks";

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
  /** ISO timestamps of the source files, for the "last updated" hint. */
  sources: { tasks: string | null; config: string | null };
  /** ISO time of this response. */
  generatedAt: string;
}
