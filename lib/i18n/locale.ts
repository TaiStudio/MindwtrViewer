import type { Dictionary } from "./dictionary";

/**
 * A language file. Drop a new file in `lib/i18n/` (e.g. `de.ts`) and it is
 * picked up automatically — no index to update.
 *
 * ```ts
 * import type { Locale } from "@lib/i18n/locale";
 *
 * const de: Locale = {
 *   code: "de",
 *   name: "Deutsch",
 *   intl: "de-DE",
 *   weekStart: 1,
 *   dict: { tabBoard: "Board", tabCalendar: "Kalender" }, // partial is fine
 * };
 * export default de;
 * ```
 */
export interface Locale {
  /** BCP-47 code. Should match the file name without extension. */
  code: string;
  /** Language name in its own language, shown in the language switcher. */
  name: string;
  /** Locale used by `Intl` for dates/numbers. Defaults to `code`. */
  intl?: string;
  /** First day of the week: 0 = Sunday, 1 = Monday. Defaults to 1. */
  weekStart?: 0 | 1;
  /**
   * Translations. Partial on purpose: any missing key falls back to the
   * fallback locale (English).
   */
  dict: Partial<Dictionary>;
}

/**
 * A locale after discovery: its dictionary has been merged with the fallback
 * locale, so every key is guaranteed to exist.
 */
export interface ResolvedLocale extends Locale {
  dict: Dictionary;
}
