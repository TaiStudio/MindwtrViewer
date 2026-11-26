import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { resolveDict } from "@lib/i18n";
import type { Dictionary } from "@lib/i18n/dictionary";
import type { Locale, ResolvedLocale } from "@lib/i18n/locale";
import type { ThemeColors, ThemeDef, ThemeInput } from "@lib/types";

/** Safety net: bundled English, used when a locale file is missing/empty. */
import enFallback from "./i18n/en";

/**
 * Discovers locales (`lib/i18n/*.ts`) and themes (`lib/themes/*.ts`).
 *
 * Dropping a new file in one of those folders is enough: the site lists it on
 * the next refresh. No index file to update.
 *
 * Two loading strategies are tried, in order:
 *   1. native Node import of the file on disk — works even after a file was
 *      added while the server is running;
 *   2. bundler-resolved dynamic import — the file was part of the build.
 */

const LOCALES_DIR = path.join(process.cwd(), "lib", "i18n");
const THEMES_DIR = path.join(process.cwd(), "lib", "themes");

/** Infrastructure files inside a discovery folder — never user content. */
const RESERVED_FILES = ["index", "types", "locale", "dictionary", "palette", "discover"];

/** Palette used when a theme file only overrides a few colours. */
const FALLBACK_COLORS: ThemeColors = {
  bg: "#fafafa",
  surface: "#ffffff",
  surface2: "#f4f4f5",
  border: "#e8e8ec",
  text: "#18181b",
  textMuted: "#71717a",
  accent: "#18181b",
  accentText: "#ffffff",
  accentSoft: "#f0f0f2",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  info: "#2563eb",
  shadow: "0 1px 2px rgb(0 0 0 / 0.04), 0 12px 32px rgb(0 0 0 / 0.05)",
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** `.ts` file names in a folder, sorted for a stable order, with their mtime. */
async function listFiles(
  dir: string,
): Promise<{ file: string; name: string; version: string }[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const candidates = entries
      .filter((e) => e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".mts")))
      .filter((e) => !e.name.endsWith(".d.ts"))
      .map((e) => ({ file: path.join(dir, e.name), name: e.name.replace(/\.m?ts$/, "") }))
      .filter((e) => !RESERVED_FILES.includes(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    return await Promise.all(
      candidates.map(async (c) => {
        let version = "0";
        try {
          version = String((await fs.stat(c.file)).mtimeMs);
        } catch {
          /* vanished between readdir and stat */
        }
        return { ...c, version };
      }),
    );
  } catch {
    return [];
  }
}

async function importDefault(
  file: string,
  folder: "locales" | "themes",
  version: string,
): Promise<unknown> {
  // 1) native Node import (no rebuild required for files added at runtime).
  //    The `?v=` query busts Node's ESM cache so edits to an existing file
  //    are picked up too.
  try {
    const url = `${pathToFileURL(file).href}?v=${version}`;
    const mod = (await import(/* webpackIgnore: true */ url)) as {
      default?: unknown;
    };
    if (mod.default !== undefined) return mod.default;
  } catch {
    /* try the bundled version */
  }

  // 2) bundled import — resolves because the bundler saw the template literal
  try {
    const name = path.basename(file).replace(/\.m?ts$/, "");
    const mod =
      folder === "locales"
        ? ((await import(`./i18n/${name}`)) as { default?: unknown })
        : ((await import(`./themes/${name}`)) as { default?: unknown });
    if (mod.default !== undefined) return mod.default;
  } catch {
    /* unreadable file — skipped by the caller */
  }

  return null;
}

/* ------------------------------- locales ------------------------------ */

function toLocale(raw: unknown, fallbackCode: string): Locale | null {
  if (!isPlainObject(raw) || !isPlainObject(raw.dict)) return null;
  const code = typeof raw.code === "string" && raw.code ? raw.code : fallbackCode;
  const dict = raw.dict as Partial<Dictionary>;
  return {
    code,
    name: typeof raw.name === "string" && raw.name ? raw.name : code,
    intl: typeof raw.intl === "string" && raw.intl ? raw.intl : undefined,
    weekStart: raw.weekStart === 0 ? 0 : 1,
    dict,
  };
}

/* -------------------------------- themes ------------------------------ */

function toTheme(raw: unknown, fallbackId: string): ThemeDef | null {
  if (!isPlainObject(raw)) return null;
  const input = raw as unknown as ThemeInput;
  const colors = isPlainObject(input.colors) ? input.colors : {};
  const id = typeof input.id === "string" && input.id ? input.id : fallbackId;
  return {
    id,
    name: input.name ?? id,
    mode: input.mode === "dark" ? "dark" : "light",
    colors: { ...FALLBACK_COLORS, ...colors },
  };
}

/* -------------------------------- caches ------------------------------ */

type Cache<T> = { stamp: string; value: T } | null;

let localeCache: Cache<ResolvedLocale[]> = null;
let themeCache: Cache<ThemeDef[]> = null;

/**
 * Fingerprint of a discovery folder: file names + their mtimes. Editing the
 * content of an existing file changes the stamp, so the cache is invalidated.
 */
async function stamp(dir: string): Promise<string> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const parts: string[] = [];
    for (const e of entries) {
      if (!e.isFile()) continue;
      try {
        const stat = await fs.stat(path.join(dir, e.name));
        parts.push(`${e.name}:${stat.mtimeMs}`);
      } catch {
        /* ignore */
      }
    }
    parts.sort();
    return parts.join("|") || "empty";
  } catch {
    return "missing";
  }
}

/**
 * All languages found in `lib/i18n/`, with their dictionaries completed by
 * the fallback English so no key can be missing at render time.
 */
export async function discoverLocales(): Promise<ResolvedLocale[]> {
  const current = await stamp(LOCALES_DIR);
  if (localeCache && localeCache.stamp === current) return localeCache.value;

  const files = await listFiles(LOCALES_DIR);
  const locales: Locale[] = [];
  for (const entry of files) {
    const raw = await importDefault(entry.file, "locales", entry.version);
    const locale = raw === null ? null : toLocale(raw, entry.name);
    if (locale) locales.push(locale);
  }

  // English is the safety net for every untranslated string.
  const base = locales.find((l) => l.code === "en") ?? enFallback;
  const resolved: ResolvedLocale[] = locales.map((l) => ({
    ...l,
    dict: resolveDict(l, base),
  }));

  if (!resolved.length) {
    resolved.push({ ...enFallback, dict: resolveDict(enFallback, enFallback) });
  }

  localeCache = { stamp: current, value: resolved };
  return resolved;
}

/** All themes found in `lib/themes/`. */
export async function discoverThemes(): Promise<ThemeDef[]> {
  const current = await stamp(THEMES_DIR);
  if (themeCache && themeCache.stamp === current) return themeCache.value;

  const files = await listFiles(THEMES_DIR);
  const themes: ThemeDef[] = [];
  for (const entry of files) {
    const raw = await importDefault(entry.file, "themes", entry.version);
    const theme = raw === null ? null : toTheme(raw, entry.name);
    if (theme) themes.push(theme);
  }

  themeCache = { stamp: current, value: themes };
  return themes;
}
