import { promises as fs } from "node:fs";
import path from "node:path";

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
 * Reads data/tasks.json and data/config.json from disk and discovers the
 * languages/themes — never cached, so any external edit is picked up on the
 * next refresh.
 */
export async function loadDataSet(): Promise<DataSet> {
  const generatedAt = new Date().toISOString();

  const [locales, themes] = await Promise.all([discoverLocales(), discoverThemes()]);

  let config: AppConfig;
  let configMtime: string | null = null;
  try {
    const cfg = await readJsonFile("config.json");
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

  // `hideDeleted` / `hideArchived` (config.json) decide what stays visible.
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
