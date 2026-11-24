import type {
  AreaRef,
  PersonRef,
  ProjectRef,
  ReferenceData,
  ReferenceGroupId,
  ReferencesConfig,
  SectionRef,
} from "./types";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): string | null {
  return typeof v === "string" && v ? v : null;
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function list(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function sorted<T extends { order: number; name?: string; title?: string }>(
  items: T[],
): T[] {
  return items.sort(
    (a, b) =>
      a.order - b.order ||
      String(a.title ?? a.name ?? "").localeCompare(String(b.title ?? b.name ?? "")),
  );
}

/**
 * tasks.json is sometimes a plain object, sometimes an array of objects
 * (`[{ tasks: [...] }]`). Collect every object that could hold a collection.
 */
function rootsOf(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw.filter(isPlainObject);
  return isPlainObject(raw) ? [raw] : [];
}

/** All items named `key` across every root, de-duplicated by `id`. */
function gather(
  roots: Record<string, unknown>[],
  key: string,
): Record<string, unknown>[] {
  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];
  for (const root of roots) {
    for (const item of list(root[key])) {
      if (!isPlainObject(item)) continue;
      const id = str(item.id) ?? str(item.token) ?? str(item.title) ?? str(item.name) ?? "";
      if (id && seen.has(id)) continue;
      if (id) seen.add(id);
      out.push(item);
    }
  }
  return out;
}

/**
 * Reads `areas`, `people`, `projects`, `sections` and the context taxonomy out
 * of data/tasks.json. Anything missing simply yields an empty list, so the tab
 * still renders on an older file.
 */
export function extractReferences(raw: unknown): ReferenceData {
  const roots = rootsOf(raw);

  const areas: AreaRef[] = gather(roots, "areas")
    .map((a) => ({
      id: str(a.id) ?? "",
      name: str(a.name) ?? "",
      color: str(a.color),
      order: num(a.order),
    }))
    .filter((a) => a.id && a.name);

  const people: PersonRef[] = gather(roots, "people")
    .map((p) => ({
      id: str(p.id) ?? "",
      name: str(p.name) ?? "",
      order: num(p.order),
    }))
    .filter((p) => p.id && p.name);

  const projects: ProjectRef[] = gather(roots, "projects")
    .map((p) => ({
      id: str(p.id) ?? "",
      title: str(p.title) ?? str(p.name) ?? "",
      areaId: str(p.areaId),
      areaTitle: str(p.areaTitle),
      color: str(p.color),
      status: str(p.status),
      order: num(p.order),
    }))
    .filter((p) => p.id && p.title);

  const sections: SectionRef[] = gather(roots, "sections")
    .map((s) => ({
      id: str(s.id) ?? "",
      title: str(s.title) ?? str(s.name) ?? "",
      projectId: str(s.projectId),
      order: num(s.order),
    }))
    .filter((s) => s.id && s.title);

  // Contexts declared in the taxonomy…
  const tokens: string[] = [];
  for (const root of roots) {
    const settings = isPlainObject(root.settings) ? root.settings : {};
    const taxonomy = isPlainObject(settings.taxonomy) ? settings.taxonomy : {};
    for (const c of list(taxonomy.contexts)) {
      if (!isPlainObject(c)) continue;
      const token = str(c.token);
      if (token) tokens.push(token);
    }
  }

  return {
    areas: sorted(areas),
    people: sorted(people),
    projects: sorted(projects),
    sections: sorted(sections),
    contexts: [...new Set(tokens)].sort((a, b) => a.localeCompare(b)),
  };
}

/**
 * Context list = taxonomy ∪ contexts actually used by tasks, so a token that
 * exists only on tasks is still filterable.
 */
export function mergeContexts(
  taxonomy: string[],
  used: Iterable<string>,
): string[] {
  const set = new Set(taxonomy);
  for (const t of used) if (t) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b));
}

/* ------------------------------------------------------------------ */
/* Visibility rules from data/config.json (`references` block)         */
/* ------------------------------------------------------------------ */

/** `groups.<id>.hidden: true` removes the whole group. */
export function isGroupVisible(
  id: ReferenceGroupId,
  cfg: ReferencesConfig,
): boolean {
  return cfg.groups[id]?.hidden !== true;
}

/**
 * Entries of one group, honouring the two config rules:
 *  - `groups.<id>.hidden` → the group is gone;
 *  - `hideEmpty` → entries with zero tasks are dropped (an empty group then
 *    simply renders nothing, which the caller turns into "hide the group").
 */
export function visibleEntries<T>(
  id: ReferenceGroupId,
  items: T[],
  cfg: ReferencesConfig,
  count: (item: T) => number,
): T[] {
  if (!isGroupVisible(id, cfg)) return [];
  if (!cfg.hideEmpty) return items;
  return items.filter((item) => count(item) > 0);
}
