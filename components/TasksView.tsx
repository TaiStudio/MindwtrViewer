"use client";

import { useMemo, useState } from "react";

import { allTags, compareTasksInList, presentStatuses } from "@lib/derive";
import { fmt, formatDate, statusLabel, type ResolvedLocale } from "@lib/i18n";
import type { Task } from "@lib/types";
import { EmptyState, ProgressBar, StatusPill, Tag } from "./ui";

export default function TasksView({
  tasks,
  locale,
  onOpenTask,
}: {
  tasks: Task[];
  locale: ResolvedLocale;
  /** Opens the task modal. */
  onOpenTask?: (task: Task) => void;
}) {
  const tr = locale.dict;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [tag, setTag] = useState("all");

  const statuses = useMemo(() => presentStatuses(tasks), [tasks]);
  const tags = useMemo(() => allTags(tasks), [tasks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((task) => {
        if (status !== "all" && task.status !== status) return false;
        if (tag !== "all" && !task.tags.includes(tag)) return false;
        if (!q) return true;
        return (
          task.title.toLowerCase().includes(q) ||
          (task.description ?? "").toLowerCase().includes(q) ||
          task.checklist.some((c) => c.title.toLowerCase().includes(q))
        );
      })
      .sort(compareTasksInList);
  }, [tasks, query, status, tag]);

  const hasFilters = query !== "" || status !== "all" || tag !== "all";

  if (!tasks.length) {
    return <EmptyState title={tr.noTasks} hint={tr.noTasksHint} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* filters — outside the scroll region */}
      <div className="card flex shrink-0 flex-wrap items-center gap-2 rounded-2xl p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr.search}
          className="min-w-[200px] flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-accent"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="all">{tr.allStatuses}</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s, locale)}
            </option>
          ))}
        </select>

        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="all">{tr.allTags}</option>
          {tags.map((tg) => (
            <option key={tg} value={tg}>
              {tg}
            </option>
          ))}
        </select>

        <span className="tnum ml-auto text-xs text-muted">
          {tr.showing} {filtered.length} {tr.of} {tasks.length}
        </span>

        {hasFilters ? (
          <button
            onClick={() => {
              setQuery("");
              setStatus("all");
              setTag("all");
            }}
            className="rounded-lg border border-line px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {tr.clearFilters}
          </button>
        ) : null}
      </div>

      {/* task list — the only thing that scrolls */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {filtered.length ? (
          <ul className="card divide-y divide-[var(--c-border)] overflow-hidden rounded-2xl">
          {filtered.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => onOpenTask?.(task)}
                title={tr.open}
                className="flex w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-surface-2/60 focus-visible:bg-surface-2/60 focus-visible:outline-none"
              >
                <span className="w-4 shrink-0 text-xs text-muted">▸</span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink">{task.title}</span>
                    {task.focused ? (
                      <span
                        className="h-1.5 w-1.5 rounded-full live-dot"
                        style={{ background: "var(--c-warning)" }}
                        title={tr.focusedToday}
                      />
                    ) : null}
                    {task.tags.map((tg) => (
                      <Tag key={tg} label={tg} />
                    ))}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted">
                    {task.checklist.length
                      ? fmt(tr.subItems, {
                          done: task.checklist.filter((c) => c.completed).length,
                          total: task.checklist.length,
                        })
                      : tr.noChecklist}
                    {" · "}
                    {tr.updated} {formatDate(task.updatedAt, locale)}
                  </span>
                </span>

                <span className="hidden w-32 shrink-0 sm:block">
                  <ProgressBar
                    value={task.progress}
                    tone={task.progress >= 1 ? "var(--c-success)" : "var(--c-accent)"}
                  />
                </span>
                <span className="tnum w-10 shrink-0 text-right text-xs text-muted">
                  {Math.round(task.progress * 100)}%
                </span>
                <span className="hidden shrink-0 md:block">
                  <StatusPill status={task.status} locale={locale} />
                </span>
              </button>
            </li>
          ))}
          </ul>
        ) : (
          <EmptyState title={tr.noResults} hint={tr.clearFilters} />
        )}
      </div>
    </div>
  );
}
