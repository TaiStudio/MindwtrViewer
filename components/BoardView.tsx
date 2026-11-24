"use client";

import { presentStatuses, statusToneVar, tasksInStatus, groupProgress } from "@/lib/derive";
import { statusLabel, type ResolvedLocale } from "@/lib/i18n";
import type { Task } from "@/lib/types";
import { EmptyState, ProgressBar, TaskCard } from "./ui";

export default function BoardView({
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
  const statuses = presentStatuses(tasks);

  if (!tasks.length) {
    return <EmptyState title={tr.noTasks} hint={tr.noTasksHint} />;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {statuses.map((status) => {
        const items = tasksInStatus(tasks, status);
        const avg = groupProgress(items);
        const tone = statusToneVar(status);

        return (
          <section
            key={status}
            className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-line bg-surface-2/60 p-3"
          >
            <header className="mb-3 px-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="h-2 w-2 rounded-full" style={{ background: tone }} />
                  {statusLabel(status, locale)}
                </h3>
                <span className="tnum rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted">
                  {items.length}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <ProgressBar value={avg} tone={tone} />
                <span className="tnum w-9 shrink-0 text-right text-[11px] text-muted">
                  {Math.round(avg * 100)}%
                </span>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-2.5">
              {items.length ? (
                items.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    locale={locale}
                    onOpen={onOpenTask ? () => onOpenTask(task) : undefined}
                  />
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
                  {tr.boardEmpty}
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
