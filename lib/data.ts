import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { discoverLocales, discoverThemes } from "./discover";
import { applyVisibility, extractTasks, normalizeTasks } from "./derive";
import { mergeConfig } from "./defaults";
import { extractReferences, mergeContexts } from "./references";
import type { AppConfig, DataSet, RawTask, ReferenceData, Task } from "./types";

const EMPTY_REFERENCES: ReferenceData = {
  areas: [],
  people: [],
  projects: [],
  sections: [],
  contexts: [],
};

const DATA_DIR = path.join(process.cwd(), "data");

async function readJsonFile(name: string): Promise<{ value: unknown; mtime: string | null }> {
  const file = path.join(DATA_DIR, name);
  try {
    const [raw, stat] = await Promise.all([fs.readFile(file, "utf8"), fs.stat(file)]);
    return { value: JSON.parse(raw), mtime: stat.mtime.toISOString() };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return { value: null, mtime: null };
    throw err;
  }
}

/**
 * Loads data/config.ts: type-stripped by Node at runtime (mtime in the query
 * string busts the ESM module cache so external edits show up on refresh).
 * Falls back to the bundled copy when native TS imports are unavailable, then
 * to the legacy data/config.json, then to `null` (defaults).
 */
async function readUserConfig(): Promise<{ value: unknown; mtime: string | null }> {
  const file = path.join(DATA_DIR, "config.ts");
  let mtime: string | null = null;
  try {
    mtime = (await fs.stat(file)).mtime.toISOString();
  } catch {
    // config.ts absent — try the legacy JSON below.
  }

  if (mtime) {
    const url = `${pathToFileURL(file).href}?v=${encodeURIComponent(mtime)}`;
    try {
      const mod = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)) as {
        default?: unknown;
      };
      return { value: mod.default ?? null, mtime };
    } catch {
      // Native TS import unsupported here (e.g. older Node) — use the bundle.
      try {
        const mod = await import("../data/config");
        return { value: mod.default ?? null, mtime };
      } catch {
        // Bundle unavailable too — fall through to legacy JSON / defaults.
      }
    }
  }

  return readJsonFile("config.json");
}

/**
 * Reads data/tasks.json and data/config.ts from disk and discovers the
 * languages/themes — never cached, so any external edit is picked up on the
 * next refresh.
 */
export async function loadDataSet(): Promise<DataSet> {
  const generatedAt = new Date().toISOString();

  const [locales, themes] = await Promise.all([discoverLocales(), discoverThemes()]);

  let config: AppConfig;
  let configMtime: string | null = null;
  try {
    const cfg = await readUserConfig();
    configMtime = cfg.mtime;
    config = mergeConfig(cfg.value);
  } catch {
    config = mergeConfig(null);
  }

  let rawTasks: RawTask[] = [];
  let references: ReferenceData = EMPTY_REFERENCES;
  let tasksMtime: string | null = null;
  let error: string | undefined;

  try {
    const data = await readJsonFile("tasks.json");
    tasksMtime = data.mtime;
    rawTasks = extractTasks(data.value);
    references = extractReferences(data.value);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const allTasks: Task[] = normalizeTasks(rawTasks);

  // Contexts = declared taxonomy ∪ contexts actually used by the tasks.
  const usedContexts = allTasks.flatMap((t) => t.contexts);
  references = { ...references, contexts: mergeContexts(references.contexts, usedContexts) };

  // `hideDeleted` / `hideArchived` (config.ts) decide what stays visible.
  const tasks = applyVisibility(allTasks, config);

  return {
    ok: !error,
    ...(error ? { error } : {}),
    tasks,
    config,
    locales,
    themes,
    references,
    sources: { tasks: tasksMtime, config: configMtime },
    generatedAt,
  };
}
