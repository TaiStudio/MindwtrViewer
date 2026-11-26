"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { filterByContext, overallProgress, reviveDates } from "@lib/derive";
import { DEFAULT_CONFIG } from "@lib/defaults";
import { formatClock, formatDateTime, localized, type ResolvedLocale } from "@lib/i18n";
import { updatePrefs, usePrefs } from "@lib/prefs";
import type { AppConfig, DataSet, ReferenceData, Task, ViewId } from "@lib/types";
import BoardView from "./BoardView";
import CalendarView from "./CalendarView";
import ReferencesView from "./ReferencesView";
import RoadmapView from "./RoadmapView";
import TaskModal from "./TaskModal";
import TasksView from "./TasksView";
import { ProgressBar, Ring } from "./ui";

type TabKey = "tabBoard" | "tabCalendar" | "tabRoadmap" | "tabTasks" | "tabReferences";

const EMPTY_REFERENCES: ReferenceData = {
  areas: [],
  people: [],
  projects: [],
  sections: [],
  contexts: [],
};

const VIEWS: { id: ViewId; key: TabKey }[] = [
  { id: "board", key: "tabBoard" },
  { id: "calendar", key: "tabCalendar" },
  { id: "roadmap", key: "tabRoadmap" },
  { id: "tasks", key: "tabTasks" },
  { id: "references", key: "tabReferences" },
];

/** camelCase colour key → kebab-case CSS variable name (textMuted → text-muted). */
function cssVarName(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

export default function Viewer({ initialData }: { initialData: DataSet }) {
  const [data, setData] = useState < DataSet | null > (() => ({
    ...initialData,
    tasks: reviveDates(initialData.tasks ?? []),
  }));
  const [error, setError] = useState < string | null > (
    initialData.ok ? null : (initialData.error ?? "error"),
  );
  const [busy, setBusy] = useState(false);
  /** Task opened in the modal (`null` = closed). */
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const prefs = usePrefs();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      const json: DataSet = await res.json();
      if (!json || typeof json !== "object") throw new Error("Invalid payload");
      json.tasks = reviveDates(json.tasks ?? []);
      setData(json);
      setError(json.ok ? null : (json.error ?? "error"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, []);

  const refreshMs = data?.config.refreshIntervalMs ?? 4000;

  // keep the view in sync with the files on disk
  useEffect(() => {
    const id = setInterval(() => void load(), refreshMs);
    const onVisibility = () => {
      if (!document.hidden) void load();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load, refreshMs]);

  const config: AppConfig | undefined = data?.config;

  // Languages and themes come from the server, which discovers them on disk.
  const locales = useMemo(() => data?.locales ?? [], [data]);
  const themes = useMemo(() => data?.themes ?? [], [data]);

  const locale: ResolvedLocale =
    locales.find((l) => l.code === (prefs.lang ?? config?.language)) ??
    locales[0];
  const themeId = prefs.theme ?? config?.theme ?? "moderne";
  const view: ViewId = prefs.view ?? "board";

  const theme = useMemo(
    () => themes.find((th) => th.id === themeId) ?? themes[0],
    [themes, themeId],
  );

  // apply theme colours + language to the document
  useEffect(() => {
    if (!theme || !locale) return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.colors)) {
      if (typeof value === "string") root.style.setProperty(`--c-${cssVarName(key)}`, value);
    }
    root.dataset.mode = theme.mode === "dark" ? "dark" : "light";
    root.lang = locale.code;
  }, [theme, locale]);

  const allTasks: Task[] = useMemo(() => data?.tasks ?? [], [data]);
  const references = data?.references ?? EMPTY_REFERENCES;
  const contextList = references.contexts;

  const openTask = useCallback((task: Task) => setOpenTaskId(task.id), []);
  // Looked up in `allTasks` so the modal survives a filter change.
  const selectedTask = allTasks.find((t) => t.id === openTaskId) ?? null;

  // Global context filter (stored in localStorage) — applies to every view.
  const activeContext =
    prefs.ctx && contextList.includes(prefs.ctx) ? prefs.ctx : null;
  const tasks = useMemo(
    () => filterByContext(allTasks, activeContext),
    [allTasks, activeContext],
  );

  const tr = locale.dict;
  const progress = overallProgress(tasks);
  const doneCount = tasks.filter((task) => task.progress >= 1).length;
  const focusedCount = tasks.filter((task) => task.focused).length;
  const siteName = localized(config?.siteName, locale.code, "Mindwtr Viewer");
  const themeName = localized(theme?.name, locale.code, theme?.id ?? "");
  // Tab + group labels can be overridden in data/config.ts (`references` block).
  const refCfg = config?.references ?? DEFAULT_CONFIG.references;
  const referencesLabel = localized(
    refCfg.label ?? undefined,
    locale.code,
    tr.tabReferences,
  );

  const lastUpdate = data?.sources.tasks ?? data?.generatedAt ?? null;
  const lastUpdateDate = lastUpdate ? new Date(lastUpdate) : null;
  // Server clock from the payload — keeps date maths out of the render path.
  const nowMs = Date.parse(data?.generatedAt ?? "");

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[1500px] flex-col overflow-hidden px-4 py-5 sm:px-6">
      {/* ---------------------------- header ---------------------------- */}
      <header className="mb-5 max-h-[65vh] shrink-0 overflow-y-auto">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink">{siteName}</h1>
            <p className="text-xs text-muted">{tr.appSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={locale.code}
              onChange={(e) => updatePrefs({ lang: e.target.value })}
              title={tr.language}
              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
            >
              {locales.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>

            <select
              value={theme?.id ?? themeId}
              onChange={(e) => updatePrefs({ theme: e.target.value })}
              title={tr.theme}
              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
            >
              {themes.map((th) => (
                <option key={th.id} value={th.id}>
                  {localized(th.name, locale.code, th.id)}
                </option>
              ))}
              {!themes.length && theme ? (
                <option value={theme.id}>{themeName}</option>
              ) : null}
            </select>

            {contextList.length ? (
              <select
                value={activeContext ?? ""}
                onChange={(e) => updatePrefs({ ctx: e.target.value || undefined })}
                title={tr.contextFilter}
                className={`rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-accent ${
                  activeContext
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-line bg-surface text-ink"
                }`}
              >
                <option value="">{tr.allContexts}</option>
                {contextList.map((ctx) => (
                  <option key={ctx} value={ctx}>
                    {ctx}
                  </option>
                ))}
              </select>
            ) : null}

            <button
              onClick={() => {
                setBusy(true);
                void load();
              }}
              disabled={busy}
              className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:text-ink disabled:opacity-60"
              title={tr.autoRefresh}
            >
              <span
                className="h-1.5 w-1.5 rounded-full live-dot"
                style={{ background: busy ? "var(--c-warning)" : "var(--c-success)" }}
              />
              {busy ? tr.refreshing : tr.refresh}
            </button>
          </div>
        </div>

        {/* stats */}
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(240px,1fr)_auto] sm:items-center">
          <div className="card flex items-center gap-4 rounded-2xl px-4 py-3">
            <Ring value={progress} size={56} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-ink">{tr.overallProgress}</span>
                <span className="tnum text-xs text-muted">
                  {doneCount}/{tasks.length} {tr.completedTasks}
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar value={progress} />
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted">
                <span className="tnum">
                  {tasks.length} {tr.totalTasks}
                </span>
                {focusedCount > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full live-dot"
                      style={{ background: "var(--c-warning)" }}
                    />
                    {focusedCount} {tr.focusedToday}
                  </span>
                ) : null}
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--c-ok)" }} />
                  {tr.lastUpdate} {lastUpdateDate ? formatClock(lastUpdateDate, locale) : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* tabs */}
          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 sm:flex-wrap">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => updatePrefs({ view: v.id })}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${view === v.id
                  ? "bg-accent text-accent-contrast"
                  : "text-muted hover:bg-surface-2 hover:text-ink"
                  }`}
              >
                {v.key === "tabReferences" ? referencesLabel : tr[v.key]}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ----------------------------- body ----------------------------- */}
      {/* Non-scrolling column: each view owns its header + scroll region. */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {error ? (
          <div className="mb-4 shrink-0 rounded-2xl border border-bad/40 bg-surface p-4">
            <p className="text-sm font-medium text-bad">{tr.errorTitle}</p>
            <p className="mt-1 break-words text-xs text-muted">{error}</p>
            <p className="mt-1 text-xs text-muted">{tr.errorHint}</p>
          </div>
        ) : null}

        {!data && !error ? (
          <div className="grid shrink-0 place-items-center py-24 text-sm text-muted">{tr.loading}</div>
        ) : null}

        {view === "board" ? (
          <BoardView tasks={tasks} locale={locale} onOpenTask={openTask} />
        ) : null}
        {view === "calendar" ? (
          <CalendarView
            tasks={tasks}
            locale={locale}
            defaultField={config?.calendar.dateField ?? "updatedAt"}
            onOpenTask={openTask}
          />
        ) : null}
        {view === "roadmap" ? (
          <RoadmapView
            tasks={tasks}
            locale={locale}
            nowMs={Number.isNaN(nowMs) ? 0 : nowMs}
            onOpenTask={openTask}
          />
        ) : null}
        {view === "tasks" ? <TasksView tasks={tasks} locale={locale} onOpenTask={openTask} /> : null}
        {view === "references" ? (
          <ReferencesView
            tasks={tasks}
            allTasks={allTasks}
            references={references}
            config={refCfg}
            locale={locale}
            activeContext={activeContext}
            onSelectContext={(ctx) => updatePrefs({ ctx: ctx ?? undefined })}
            onOpenTask={openTask}
          />
        ) : null}
      </main>

      <footer className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[11px] text-muted">
        <span>🦊<a href="https://taistudio.fr">Tai Studio</a> | 2021-{new Date().getFullYear()}</span>
        <span className="tnum">
          {tr.lastUpdate} {lastUpdateDate ? formatDateTime(lastUpdateDate, locale) : "—"}
          {" · "}
          {themeName}
        </span>
      </footer>

      {selectedTask ? (
        <TaskModal
          task={selectedTask}
          locale={locale}
          projectTitle={
            selectedTask.projectId
              ? (references.projects.find((p) => p.id === selectedTask.projectId)?.title ?? null)
              : null
          }
          onClose={() => setOpenTaskId(null)}
        />
      ) : null}
    </div>
  );
}
