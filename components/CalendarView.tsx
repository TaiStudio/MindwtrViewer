"use client";

import { useMemo, useState } from "react";

import { addMonths, dayKey, monthGrid, sameDay } from "@lib/derive";
import {
  formatDate,
  formatMonth,
  intlOf,
  weekStartOf,
  type ResolvedLocale,
} from "@lib/i18n";
import type { Task } from "@lib/types";
import { EmptyState, ProgressBar, StatusPill, TaskDetail } from "./ui";

type DateField = "createdAt" | "updatedAt";

export default function CalendarView({
  tasks,
  locale,
  defaultField,
  onOpenTask,
}: {
  tasks: Task[];
  locale: ResolvedLocale;
  defaultField: DateField;
  /** Opens the task modal. */
  onOpenTask?: (task: Task) => void;
}) {
  const tr = locale.dict;
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [field, setField] = useState<DateField>(defaultField);

  const weekStart = weekStartOf(locale);
  const cells = useMemo(
    () => monthGrid(cursor, weekStart),
    [cursor, weekStart],
  );

  // Short weekday names, starting on the locale's first day of the week.
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(intlOf(locale), { weekday: "short" });
    // 2024-01-07 is a Sunday, so `7 + weekStart` is the first day of that week.
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(2024, 0, 7 + weekStart + i)),
    );
  }, [locale, weekStart]);

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const d = field === "createdAt" ? task.createdAt : task.updatedAt;
      if (!d) continue;
      const key = dayKey(d);
      const list = map.get(key);
      if (list) list.push(task);
      else map.set(key, [task]);
    }
    return map;
  }, [tasks, field]);

  const selectedKey = dayKey(selected);
  const selectedTasks = byDay.get(selectedKey) ?? [];
  const today = new Date();

  if (!tasks.length) {
    return <EmptyState title={tr.noTasks} hint={tr.noTasksHint} />;
  }

  // Mobile: the grid itself scrolls. lg: fixed grid, only panels scroll.
  return (
    <div className="grid h-full min-h-0 gap-4 overflow-y-auto overscroll-contain lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden lg:grid-cols-[1fr_320px]">
      {/* Calendar stays fixed; only scrolls if the window is too short. */}
      <section className="card rounded-2xl p-4 lg:min-h-0 lg:overflow-y-auto">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCursor((c) => addMonths(c, -1))}
              aria-label={tr.prevMonth}
              className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              ‹
            </button>
            <h3 className="min-w-[110px] text-center text-sm font-semibold capitalize text-ink sm:min-w-[160px]">
              {formatMonth(cursor, locale)}
            </h3>
            <button
              onClick={() => setCursor((c) => addMonths(c, 1))}
              aria-label={tr.nextMonth}
              className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              ›
            </button>
            <button
              onClick={() => {
                setCursor(new Date());
                setSelected(new Date());
              }}
              className="ml-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {tr.goToday}
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-line bg-surface-2 p-1">
            <span className="px-2 text-[11px] text-muted">{tr.dateField}</span>
            {(["updatedAt", "createdAt"] as DateField[]).map((f) => (
              <button
                key={f}
                onClick={() => setField(f)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  field === f ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {f === "createdAt" ? tr.dateCreatedAt : tr.dateUpdatedAt}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {weekdays.map((d, i) => (
            <div
              key={`${i}-${d}`}
              className="pb-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted"
            >
              {d}
            </div>
          ))}

          {cells.map((date) => {
            const key = dayKey(date);
            const items = byDay.get(key) ?? [];
            const inMonth = date.getMonth() === cursor.getMonth();
            const isToday = sameDay(date, today);
            const isSelected = sameDay(date, selected);

            return (
              <button
                key={key}
                onClick={() => setSelected(date)}
                className={`relative flex min-h-[52px] flex-col items-stretch gap-1 rounded-xl border p-1 text-left transition-colors sm:min-h-[76px] ${
                  isSelected
                    ? "border-accent bg-accent-soft"
                    : "border-transparent hover:border-line hover:bg-surface-2"
                } ${inMonth ? "" : "opacity-35"}`}
              >
                <span
                  className={`tnum grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                    isToday
                      ? "bg-accent font-semibold text-accent-contrast"
                      : "text-muted"
                  }`}
                >
                  {date.getDate()}
                </span>

                {items.slice(0, 3).map((task) => (
                  <span
                    key={task.id}
                    className="truncate rounded px-1 py-0.5 text-[10px] leading-tight text-ink"
                    style={{ background: "var(--c-surface2)" }}
                    title={task.title}
                  >
                    <span
                      className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
                      style={{
                        background:
                          task.progress >= 1
                            ? "var(--c-success)"
                            : task.progress > 0
                              ? "var(--c-info)"
                              : "var(--c-text-muted)",
                      }}
                    />
                    {task.title}
                  </span>
                ))}

                {items.length > 3 ? (
                  <span className="px-1 text-[10px] text-muted">+{items.length - 3}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* Right panel: header fixed, task list scrolls independently on lg. */}
      <aside className="card flex min-h-0 flex-col rounded-2xl p-4 lg:overflow-hidden">
        <div className="shrink-0">
          <h3 className="text-sm font-semibold text-ink">
            {tr.tasksOn} {formatDate(selected, locale)}
          </h3>
          <p className="mb-3 mt-1 text-[11px] text-muted">
            {selectedTasks.length
              ? `${selectedTasks.length} ${tr.totalTasks}`
              : tr.noTasksThisDay}
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain">
          {selectedTasks.length ? (
            selectedTasks.map((task) => (
              <div key={task.id} className="rise rounded-xl border border-line bg-surface p-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-ink">{task.title}</h4>
                  {task.focused ? (
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full live-dot"
                      style={{ background: "var(--c-warning)" }}
                    />
                  ) : null}
                </div>
                <div className="mt-2">
                  <StatusPill status={task.status} locale={locale} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ProgressBar value={task.progress} />
                  <span className="tnum w-9 shrink-0 text-right text-[11px] text-muted">
                    {Math.round(task.progress * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenTask?.(task)}
                    className="ml-auto rounded-lg border border-line px-2 py-1 text-[11px] text-muted transition-colors hover:border-accent hover:text-ink"
                  >
                    {tr.open}
                  </button>
                </div>
                {/* <TaskDetail task={task} locale={locale} /> */}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-xs text-muted">
              {tr.selectDay}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
