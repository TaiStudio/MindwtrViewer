import type { Attachment, RawTask, Task } from "./types";

/* ------------------------------------------------------------------ */
/* Reading the (possibly nested) tasks.json                            */
/* ------------------------------------------------------------------ */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function looksLikeTask(v: unknown): boolean {
  return isPlainObject(v) && typeof v.title === "string";
}

function collectInto(list: unknown, out: RawTask[]): void {
  if (!Array.isArray(list)) return;
  for (const item of list) {
    if (looksLikeTask(item)) out.push(item as RawTask);
  }
}

/**
 * tasks.json has been seen as `[{ tasks: [...] }]`, but the format may evolve
 * (flat array, `{ tasks }`, projects containing tasks, …). Be tolerant.
 */
export function extractTasks(raw: unknown): RawTask[] {
  const out: RawTask[] = [];

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!isPlainObject(item)) {
        collectInto([item], out);
        continue;
      }
      if (Array.isArray(item.tasks)) collectInto(item.tasks, out);
      else if (Array.isArray(item.items)) collectInto(item.items, out);
      else if (Array.isArray(item.projects)) {
        for (const p of item.projects) {
          if (isPlainObject(p)) collectInto(p.tasks ?? p.items, out);
        }
      } else if (looksLikeTask(item)) {
        out.push(item as RawTask);
      }
    }
  } else if (isPlainObject(raw)) {
    if (Array.isArray(raw.tasks)) collectInto(raw.tasks, out);
    if (Array.isArray(raw.items)) collectInto(raw.items, out);
    if (Array.isArray(raw.projects)) {
      for (const p of raw.projects) {
        if (isPlainObject(p)) collectInto(p.tasks ?? p.items, out);
      }
    }
  }

  // De-duplicate by id (the same task can appear in several groups).
  const seen = new Set<string>();
  return out.filter((t) => {
    const id = typeof t.id === "string" && t.id ? t.id : t.title;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* Normalization                                                       */
/* ------------------------------------------------------------------ */

export function toDate(v: unknown): Date | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const DONE_STATUSES = new Set([
  "done",
  "completed",
  "complete",
  "finished",
  "cancelled",
  "canceled",
  "archived",
]);

/** Statuses that count as "finished" when a task has no checklist. */
export function isDoneStatus(status: string): boolean {
  return DONE_STATUSES.has(status.toLowerCase());
}

/**
 * Dates cross the wire as ISO strings — turn them back into `Date` objects
 * (and tolerate anything malformed) before rendering.
 */
export function reviveDates(tasks: Task[]): Task[] {
  return tasks.map((task) => ({
    ...task,
    createdAt: toDate(task.createdAt),
    updatedAt: toDate(task.updatedAt),
  }));
}

export function normalizeTasks(raw: unknown): Task[] {
  return extractTasks(raw)
    .map((r): Task => {
      const rawChecklist: unknown[] = Array.isArray(r.checklist) ? r.checklist : [];
      const checklist = rawChecklist.filter(isPlainObject).map((c) => ({
        id: typeof c.id === "string" ? c.id : Math.random().toString(36).slice(2),
        title: typeof c.title === "string" ? c.title : "",
        completed: c.isCompleted === true,
      }));

      const done = checklist.filter((c) => c.completed).length;
      const progress = checklist.length
        ? done / checklist.length
        : isDoneStatus(String(r.status ?? ""))
          ? 1
          : 0;

      const rawAttachments: unknown[] = Array.isArray(r.attachments) ? r.attachments : [];
      const attachments = rawAttachments
        .filter(isPlainObject)
        .map((a): Attachment => ({
          id: typeof a.id === "string" ? a.id : Math.random().toString(36).slice(2),
          title: typeof a.title === "string" && a.title ? a.title : "link",
          uri: typeof a.uri === "string" ? a.uri : "",
          kind: typeof a.kind === "string" ? a.kind : "link",
          cloudKey:
            typeof a.cloudKey === "string" && a.cloudKey ? a.cloudKey : null,
          deleted: typeof a.deletedAt === "string" && a.deletedAt.length > 0,
          size: typeof a.size === "number" && Number.isFinite(a.size) ? a.size : null,
        }))
        // Soft-deleted attachments never reach the UI.
        .filter((a) => !a.deleted);

      const order =
        typeof r.orderNum === "number"
          ? r.orderNum
          : typeof r.order === "number"
            ? r.order
            : 0;

      return {
        id: String(r.id ?? Math.random().toString(36).slice(2)),
        title: typeof r.title === "string" ? r.title : "(sans titre)",
        description:
          typeof r.description === "string" && r.description.trim()
            ? r.description
            : null,
        status: String(r.status ?? "inbox").toLowerCase(),
        projectId: typeof r.projectId === "string" ? r.projectId : null,
        sectionId: typeof r.sectionId === "string" ? r.sectionId : null,
        areaId: typeof r.areaId === "string" ? r.areaId : null,
        assignedTo: typeof r.assignedTo === "string" && r.assignedTo ? r.assignedTo : null,
        contexts: Array.isArray(r.contexts)
          ? r.contexts.filter((c): c is string => typeof c === "string" && c.length > 0)
          : [],
        tags: Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === "string") : [],
        focused: r.isFocusedToday === true,
        deleted: typeof r.deletedAt === "string" && r.deletedAt.length > 0,
        archived: typeof r.archivedAt === "string" && r.archivedAt.length > 0,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
        order,
        checklist,
        attachments,
        progress,
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

/**
 * Description reduced to plain text (front-matter, headings, links, emphasis
 * and tables stripped) — used for list previews.
 */
export function plainExcerpt(text: string | null, max = 180): string {
  if (!text) return "";
  const plain = text
    .replace(/^---\n[\s\S]*?\n---\n/, "") // YAML front-matter
    .replace(/```[\s\S]*?```/g, " ") // code fences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → label
    .replace(/^\s*[|>#+\-*]+\s?/gm, " ") // table cells, headings, list marks
    .replace(/\s*\|\s*/g, " · ") // table separators inside a line
    .replace(/[*_`~]/g, "") // emphasis
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain;
}

/* ------------------------------------------------------------------ */
/* Attachments (files live under `public/`)                            */
/* ------------------------------------------------------------------ */

const EXTERNAL = /^https?:\/\//i;

/**
 * URL an attachment can be opened with:
 *  - `https://…` `uri` → used as-is (external link);
 *  - `cloudKey` (`attachments/<id>.png`) → `/attachments/<id>.png` in `public/`;
 *  - a relative `uri` → served from `public/` too;
 *  - otherwise `null` (the file simply is not in the repository yet).
 */
export function attachmentHref(attachment: Attachment): string | null {
  const { uri, cloudKey } = attachment;
  if (uri && EXTERNAL.test(uri)) return uri;

  const source = cloudKey || uri;
  if (!source) return null;
  const clean = source.replace(/^(\.\/|public\/|\/)+/, "").trim();
  return clean ? `/${clean}` : null;
}

/** Extensions rendered inline as an image. */
export function isImageHref(href: string | null): boolean {
  return !!href && /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(href);
}

/** `attachment` files are shown in an iframe (browsers render PDFs natively). */
export function isPdfHref(href: string | null): boolean {
  return !!href && /\.pdf$/i.test(href);
}

export function formatBytes(bytes: number | null, locale: string): string | null {
  if (!bytes || !Number.isFinite(bytes)) return null;
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = value >= 10 || unit === 0 ? 0 : 1;
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
  }).format(value)} ${units[unit]}`;
}

/* ------------------------------------------------------------------ */
/* Status helpers (colours — labels live in lib/i18n)                  */
/* ------------------------------------------------------------------ */

export const STATUS_ORDER = [
  "today",
  "in_progress",
  "next",
  "waiting",
  "inbox",
  "backlog",
  "someday",
  "done",
  "completed",
  "cancelled",
];

/** Semantic colour token used for a status. */
export function statusTone(status: string): string {
  const key = status.toLowerCase();
  if (["done", "completed", "complete", "finished"].includes(key)) return "ok";
  if (["today", "in_progress", "doing"].includes(key)) return "accent";
  if (["next"].includes(key)) return "info";
  if (["waiting", "hold", "blocked"].includes(key)) return "warn";
  if (["cancelled", "canceled", "archived"].includes(key)) return "bad";
  if (["someday", "backlog", "maybe"].includes(key)) return "muted";
  return "info";
}

export function statusToneVar(status: string): string {
  switch (statusTone(status)) {
    case "ok":
      return "var(--c-success)";
    case "warn":
      return "var(--c-warning)";
    case "bad":
      return "var(--c-danger)";
    case "muted":
      return "var(--c-text-muted)";
    case "accent":
      return "var(--c-accent)";
    default:
      return "var(--c-info)";
  }
}

/** Statuses present in the task list, in display order. */
export function presentStatuses(tasks: Task[]): string[] {
  const present = new Set(tasks.map((t) => t.status));
  const ordered = STATUS_ORDER.filter((s) => present.has(s));
  const rest = [...present].filter((s) => !STATUS_ORDER.includes(s)).sort();
  return [...ordered, ...rest];
}

/* ------------------------------------------------------------------ */
/* Aggregates                                                          */
/* ------------------------------------------------------------------ */

export function overallProgress(tasks: Task[]): number {
  if (!tasks.length) return 0;
  return tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length;
}

export function tasksInStatus(tasks: Task[], status: string): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function groupProgress(tasks: Task[]): number {
  if (!tasks.length) return 0;
  return tasks.reduce((s, t) => s + t.progress, 0) / tasks.length;
}

export function allTags(tasks: Task[]): string[] {
  const set = new Set<string>();
  for (const t of tasks) for (const tag of t.tags) set.add(tag);
  return [...set].sort();
}

/**
 * Drop soft-deleted / archived tasks when the matching config flags are set.
 * Defaults (both `false`) keep every task visible, as before.
 */
export function applyVisibility(
  tasks: Task[],
  cfg: { hideDeleted: boolean; hideArchived: boolean },
): Task[] {
  if (!cfg.hideDeleted && !cfg.hideArchived) return tasks;
  return tasks.filter((t) => {
    if (cfg.hideDeleted && t.deleted) return false;
    if (cfg.hideArchived && t.archived) return false;
    return true;
  });
}

/** Keep only the tasks carrying `context` (`null`/`""` = no filtering). */
export function filterByContext(tasks: Task[], context: string | null): Task[] {
  if (!context) return tasks;
  return tasks.filter((t) => t.contexts.includes(context));
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

export function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Matrix of Date cells covering the 6 weeks of `cursor`'s month. */
export function monthGrid(cursor: Date, firstWeekday: number): Date[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - firstWeekday + 7) % 7;
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
