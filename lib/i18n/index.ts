import { toDate } from "../derive";
import type { Dictionary } from "./dictionary";
import type { Locale } from "./locale";

export type { Dictionary } from "./dictionary";
export type { Locale, ResolvedLocale } from "./locale";

/** Locale passed to `Intl` (falls back to the locale code). */
export function intlOf(locale: Locale): string {
  return locale.intl ?? locale.code;
}

/** First day of the week: 0 = Sunday, 1 = Monday. */
export function weekStartOf(locale: Locale): number {
  return locale.weekStart ?? 1;
}

function lookup(dict: Partial<Dictionary>, key: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(dict, key)
    ? (dict as Record<string, string>)[key]
    : undefined;
}

/**
 * Merge a (possibly partial) locale over a complete one. Run once per locale
 * at discovery time, so the UI never has to deal with missing keys.
 */
export function resolveDict(locale: Locale, base: Locale): Dictionary {
  const merged: Record<string, string> = {};
  for (const key of Object.keys(base.dict) as (keyof Dictionary)[]) {
    const value = lookup(base.dict, key);
    if (value !== undefined) merged[key] = value;
  }
  for (const key of Object.keys(locale.dict) as (keyof Dictionary)[]) {
    const value = lookup(locale.dict, key);
    if (value !== undefined) merged[key] = value;
  }
  return merged as unknown as Dictionary;
}

/** `{placeholder}` interpolation: `fmt(tr.subItems, { done: 2, total: 5 })`. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) =>
    key in values ? String(values[key]) : m,
  );
}

/**
 * Localised label for a value that is either a plain string or a map keyed by
 * locale code (`{ "fr": "…", "en": "…" }`), used for theme names.
 */
export function localized(
  value: string | Record<string, string> | undefined,
  code: string,
  fallback = "",
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value[code] ?? value.en ?? value.fr ?? Object.values(value)[0] ?? fallback;
}

/* ------------------------------- dates -------------------------------- */

export function formatDate(
  input: Date | string | null | undefined,
  locale: Locale,
  withTime = false,
): string {
  const d = toDate(input);
  if (!d) return "—";
  return new Intl.DateTimeFormat(intlOf(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
}

export function formatMonth(input: Date | string | null | undefined, locale: Locale): string {
  const d = toDate(input);
  if (!d) return "—";
  return new Intl.DateTimeFormat(intlOf(locale), { month: "long", year: "numeric" }).format(d);
}

export function formatClock(input: Date | string, locale: Locale): string {
  const d = toDate(input);
  if (!d) return "—";
  return new Intl.DateTimeFormat(intlOf(locale), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

export function formatDateTime(input: Date | string | null | undefined, locale: Locale): string {
  const d = toDate(input);
  if (!d) return "—";
  return new Intl.DateTimeFormat(intlOf(locale), {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

/* ------------------------------- statuses ----------------------------- */

/** Map raw status ids onto the `status_*` dictionary keys. */
const STATUS_ALIASES: Record<string, string> = {
  completed: "done",
  complete: "done",
  finished: "done",
  canceled: "cancelled",
  doing: "in_progress",
  active: "in_progress",
  hold: "waiting",
  blocked: "waiting",
  open: "next",
};

/** Localised label for any status id — unknown ids are shown as-is. */
export function statusLabel(status: string, locale: Locale): string {
  const id = status.toLowerCase().trim();
  const key = `status_${STATUS_ALIASES[id] ?? id}`;
  const known = lookup(locale.dict, key);
  if (known) return known;
  const prettified = id.replace(/[_-]+/g, " ");
  return prettified.charAt(0).toUpperCase() + prettified.slice(1);
}
