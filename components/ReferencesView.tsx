"use client";

import { useMemo, type ReactNode } from "react";

import { attachmentHref, isImageHref, overallProgress, plainExcerpt, statusToneVar } from "@/lib/derive";
import { localized, type ResolvedLocale } from "@/lib/i18n";
import { isGroupVisible, visibleEntries } from "@/lib/references";
import type { ReferenceData, ReferencesConfig, SectionRef, Task } from "@/lib/types";
import { EmptyState, ProgressBar } from "./ui";

interface Stats {
  count: number;
  progress: number;
}

const EMPTY: Stats = { count: 0, progress: 0 };

function stats(tasks: Task[]): Stats {
  if (!tasks.length) return EMPTY;
  return { count: tasks.length, progress: overallProgress(tasks) };
}

/** Section heading with its total on the right. */
function Group({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="card rounded-2xl p-4">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className="tnum text-[11px] text-muted">{count}</span>
      </header>
      {count ? children : <p className="text-xs text-muted">—</p>}
    </section>
  );
}

/** Name + task count + progress bar, used by areas / people / sections. */
function Row({
  name,
  hint,
  color,
  stat,
}: {
  name: string;
  hint?: string;
  color?: string | null;
  stat: Stats;
}) {
  return (
    <li className="rounded-xl border border-line bg-surface-2/50 px-3 py-2">
      <div className="flex items-center gap-2">
        {color ? (
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: color }}
          />
        ) : null}
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">
          {name}
        </span>
        <span className="tnum shrink-0 text-[11px] text-muted">
          {hint ? `${hint} · ` : ""}
          {stat.count}
        </span>
      </div>
      {stat.count ? (
        <div className="mt-1.5">
          <ProgressBar value={stat.progress} height="h-1" />
        </div>
      ) : null}
    </li>
  );
}

export default function ReferencesView({
  tasks,
  allTasks,
  references,
  config,
  locale,
  activeContext,
  onSelectContext,
  onOpenTask,
}: {
  /** Tasks after the global context filter — drives every count. */
  tasks: Task[];
  /** Unfiltered tasks — drives the context chips so they stay selectable. */
  allTasks: Task[];
  references: ReferenceData;
  /** `references` block of data/config.json (labels + visibility). */
  config: ReferencesConfig;
  locale: ResolvedLocale;
  activeContext: string | null;
  onSelectContext: (context: string | null) => void;
  /** Opens the task modal. */
  onOpenTask?: (task: Task) => void;
}) {
  const tr = locale.dict;

  /** Group label: config override → translated default. */
  const groupLabel = (
    id: keyof ReferencesConfig["groups"],
    fallback: string,
  ) => localized(config.groups[id]?.label ?? undefined, locale.code, fallback);

  const projectById = useMemo(
    () => new Map(references.projects.map((p) => [p.id, p])),
    [references.projects],
  );

  /* ------------------------------- counts ------------------------------ */

  const byProject = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.projectId) continue;
      const list = map.get(t.projectId);
      if (list) list.push(t);
      else map.set(t.projectId, [t]);
    }
    return map;
  }, [tasks]);

  const bySection = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.sectionId) continue;
      const list = map.get(t.sectionId);
      if (list) list.push(t);
      else map.set(t.sectionId, [t]);
    }
    return map;
  }, [tasks]);

  const byPerson = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.assignedTo) continue;
      const key = t.assignedTo.toLowerCase();
      const list = map.get(key);
      if (list) list.push(t);
      else map.set(key, [t]);
    }
    return map;
  }, [tasks]);

  // An area holds tasks directly (`areaId`) or through its projects.
  const byArea = useMemo(() => {
    const map = new Map<string, Task[]>();
    const push = (id: string, task: Task) => {
      const list = map.get(id);
      if (list) list.push(task);
      else map.set(id, [task]);
    };
    for (const t of tasks) {
      if (t.areaId) push(t.areaId, t);
      const project = t.projectId ? projectById.get(t.projectId) : undefined;
      if (project?.areaId) push(project.areaId, t);
    }
    // The same task can reach an area twice (direct + via project).
    for (const [id, list] of map) {
      map.set(id, [...new Map(list.map((t) => [t.id, t])).values()]);
    }
    return map;
  }, [tasks, projectById]);

  const contextCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of allTasks) {
      for (const c of t.contexts) map.set(c, (map.get(c) ?? 0) + 1);
    }
    return map;
  }, [allTasks]);

  const hideEmpty = config.hideEmpty;

  const areas = visibleEntries(
    "areas",
    references.areas,
    config,
    (a) => byArea.get(a.id)?.length ?? 0,
  );
  const people = visibleEntries(
    "people",
    references.people,
    config,
    (p) => byPerson.get(p.name.toLowerCase())?.length ?? 0,
  );
  const projects = visibleEntries(
    "projects",
    references.projects,
    config,
    (p) => byProject.get(p.id)?.length ?? 0,
  );
  const sections = visibleEntries(
    "sections",
    references.sections,
    config,
    (s) => bySection.get(s.id)?.length ?? 0,
  );

  // Reference entries = tasks whose status is `reference` (`status_reference`).
  const referenceTasks = visibleEntries(
    "tasks",
    tasks.filter((t) => t.status === "reference"),
    config,
    () => 1,
  );
  const projectTitleOf = (id: string | null) =>
    id ? (references.projects.find((p) => p.id === id)?.title ?? null) : null;

  // Context chips: `allContexts` stays selectable only while the group is shown.
  const showContexts = isGroupVisible("contexts", config);
  const contextTokens = showContexts
    ? hideEmpty
      ? references.contexts.filter((c) => (contextCounts.get(c) ?? 0) > 0)
      : references.contexts
    : [];

  // Sections grouped by project, keeping only the visible ones.
  const visibleSectionsByProject = useMemo(() => {
    const visibleIds = new Set(sections.map((s) => s.id));
    const map = new Map<string, SectionRef[]>();
    for (const s of sections) {
      if (!visibleIds.has(s.id)) continue;
      const key = s.projectId ?? "";
      const list = map.get(key);
      if (list) list.push(s);
      else map.set(key, [s]);
    }
    return map;
  }, [sections]);

  // With `hideEmpty`, projects that no longer show any section lose their list.
  const projectHasContent = (project: (typeof references.projects)[number]) => {
    if (!hideEmpty) return true;
    const items = byProject.get(project.id) ?? [];
    if (items.length) return true;
    return (visibleSectionsByProject.get(project.id) ?? []).length > 0;
  };
  const shownProjects = projects.filter(projectHasContent);

  const hasAnything =
    referenceTasks.length ||
    areas.length ||
    people.length ||
    shownProjects.length ||
    sections.length ||
    contextTokens.length;

  if (!hasAnything) {
    return (
      <EmptyState
        title={tr.refNoMatch}
        hint="data/config.json — references.groups / hideEmpty"
      />
    );
  }

  /* -------------------------------- render ----------------------------- */

  return (
    <div className="space-y-4">
      {/* ------------------------- contexts ------------------------- */}
      {showContexts && contextTokens.length ? (
        <section className="card rounded-2xl p-4">
          <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">
              {groupLabel("contexts", tr.refContexts)}
            </h3>
            <span className="text-[11px] text-muted">{tr.contextFilter}</span>
          </header>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onSelectContext(null)}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                activeContext
                  ? "border-line text-muted hover:text-ink"
                  : "border-accent bg-accent text-accent-contrast"
              }`}
            >
              {tr.allContexts}
            </button>

            {contextTokens.map((ctx) => {
              const active = activeContext === ctx;
              const n = contextCounts.get(ctx) ?? 0;
              return (
                <button
                  key={ctx}
                  onClick={() => onSelectContext(active ? null : ctx)}
                  title={`${ctx} — ${n}`}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? "border-accent bg-accent text-accent-contrast"
                      : "border-line text-muted hover:border-accent hover:text-ink"
                  }`}
                >
                  {ctx}
                  <span className="tnum opacity-70">{n}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* -------------------- reference entries -------------------- */}
      {referenceTasks.length ? (
        <Group title={groupLabel("tasks", tr.refTasks)} count={referenceTasks.length}>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {referenceTasks.map((task) => {
              const excerpt = plainExcerpt(task.description);
              const images = task.attachments.filter((a) =>
                isImageHref(attachmentHref(a)),
              ).length;
              const project = projectTitleOf(task.projectId);
              return (
                <li key={task.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onOpenTask?.(task)}
                    title={tr.refOpenTask}
                    className="flex h-full w-full cursor-pointer flex-col rounded-xl border border-line bg-surface-2/50 p-3 text-left transition-colors hover:border-accent/60 focus-visible:border-accent focus-visible:outline-none"
                  >
                    <span className="flex items-start gap-2">
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: statusToneVar(task.status) }}
                      />
                      <span className="min-w-0 flex-1 text-xs font-semibold leading-snug text-ink">
                        {task.title}
                      </span>
                      <span className="tnum shrink-0 text-[11px] text-muted">
                        {task.attachments.length ? `${task.attachments.length} ⎘` : ""}
                      </span>
                    </span>

                    {excerpt ? (
                      <span className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-muted">
                        {excerpt}
                      </span>
                    ) : null}

                    <span className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-[10px] text-muted">
                      {project ? <span className="truncate">{project}</span> : null}
                      {images ? <span>🖼 {images}</span> : null}
                      <span className="tnum ml-auto">{Math.round(task.progress * 100)}%</span>
                    </span>

                    <span className="mt-1.5">
                      <ProgressBar
                        value={task.progress}
                        tone={
                          task.progress >= 1
                            ? "var(--c-success)"
                            : statusToneVar(task.status)
                        }
                        height="h-1"
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Group>
      ) : null}

      {(areas.length || people.length) ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* -------------------------- areas -------------------------- */}
          {areas.length ? (
            <Group title={groupLabel("areas", tr.refAreas)} count={areas.length}>
              <ul className="space-y-1.5">
                {areas.map((area) => (
                  <Row
                    key={area.id}
                    name={area.name}
                    color={area.color}
                    stat={stats(byArea.get(area.id) ?? [])}
                  />
                ))}
              </ul>
            </Group>
          ) : null}

          {/* -------------------------- people ------------------------- */}
          {people.length ? (
            <Group title={groupLabel("people", tr.refPeople)} count={people.length}>
              <ul className="space-y-1.5">
                {people.map((person) => (
                  <Row
                    key={person.id}
                    name={person.name}
                    stat={stats(byPerson.get(person.name.toLowerCase()) ?? [])}
                  />
                ))}
              </ul>
            </Group>
          ) : null}
        </div>
      ) : null}

      {/* -------------------------- projects ------------------------- */}
      {shownProjects.length ? (
        <Group title={groupLabel("projects", tr.refProjects)} count={shownProjects.length}>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {shownProjects.map((project) => {
              const items = byProject.get(project.id) ?? [];
              const projectSections = visibleSectionsByProject.get(project.id) ?? [];
              return (
                <li
                  key={project.id}
                  className="rounded-xl border border-line bg-surface-2/50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: project.color ?? "var(--c-text-muted)" }}
                    />
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">
                      {project.title}
                    </span>
                    <span className="tnum shrink-0 text-[11px] text-muted">
                      {stats(items).count}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
                    {project.areaTitle ? <span>{project.areaTitle}</span> : null}
                    {project.status ? <span>· {project.status}</span> : null}
                  </div>

                  {items.length ? (
                    <div className="mt-2">
                      <ProgressBar value={stats(items).progress} height="h-1" />
                    </div>
                  ) : null}

                  {projectSections.length ? (
                    <ul className="mt-2 space-y-1 border-t border-line pt-2">
                      {projectSections.map((section) => {
                        const sectionTasks = bySection.get(section.id) ?? [];
                        return (
                          <li
                            key={section.id}
                            className="flex items-center justify-between gap-2 text-[11px]"
                          >
                            <span className="min-w-0 truncate text-muted">
                              {section.title}
                            </span>
                            <span className="tnum shrink-0 text-muted">
                              {sectionTasks.length}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Group>
      ) : null}

      {/* -------------------------- sections ------------------------- */}
      {sections.length ? (
        <Group title={groupLabel("sections", tr.refSections)} count={sections.length}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[...visibleSectionsByProject.entries()].map(([projectId, list]) => (
              <div key={projectId || "none"} className="space-y-1.5">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {projectId
                    ? (projectById.get(projectId)?.title ?? projectId)
                    : "—"}
                </p>
                <ul className="space-y-1.5">
                  {list.map((section) => (
                    <Row
                      key={section.id}
                      name={section.title}
                      stat={stats(bySection.get(section.id) ?? [])}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Group>
      ) : null}
    </div>
  );
}
