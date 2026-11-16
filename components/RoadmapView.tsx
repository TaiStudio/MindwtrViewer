"use client";

import { useMemo } from "react";

import {
  presentStatuses,
  statusToneVar,
  tasksInStatus,
  groupProgress,
} from "@/lib/derive";
import { formatDate, statusLabel, type ResolvedLocale } from "@/lib/i18n";
import type { Task } from "@/lib/types";
import { EmptyState, ProgressBar } from "./ui";

const DAY = 86_400_000;
const LANE_MIN_H = 64;

/**
 * Horizontal timeline: one lane per status, one bar per task spanning from
 * createdAt to updatedAt, filled according to its progress.
 */
export default function RoadmapView({
  tasks,
  locale,
  nowMs,
}: {
  tasks: Task[];
  locale: ResolvedLocale;
  /** Current time in ms, taken from the payload so rendering stays pure. */
  nowMs: number;
}) {
  const tr = locale.dict;

  const { start, end, lanes, ticks } = useMemo(() => {
    const dates: number[] = [];
    for (const task of tasks) {
      if (task.createdAt) dates.push(task.createdAt.getTime());
      if (task.updatedAt) dates.push(task.updatedAt.getTime());
    }
    const now = nowMs;
    const min = dates.length ? Math.min(...dates) : now - 30 * DAY;
    const max = dates.length ? Math.max(...dates, now) : now;
    const pad = Math.max((max - min) * 0.04, DAY);
    const startTs = min - pad;
    const endTs = Math.max(max + pad, startTs + DAY);
    const span = endTs - startTs;

    const statuses = presentStatuses(tasks);
    const laneList = statuses.map((status) => {
      const items = tasksInStatus(tasks, status);
      return {
        status,
        items: [...items].sort(
          (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0),
        ),
        avg: groupProgress(items),
      };
    });

    const tickCount = 6;
    const tickList = Array.from({ length: tickCount + 1 }, (_, i) => {
      const ts = startTs + (span * i) / tickCount;
      return { ts, pct: (i / tickCount) * 100 };
    });

    return { start: startTs, end: endTs, lanes: laneList, ticks: tickList };
  }, [tasks, nowMs]);

  if (!tasks.length) return <EmptyState title={tr.noTasks} hint={tr.noTasksHint} />;

  const span = Math.max(end - start, DAY);
  const nowPct = ((nowMs - start) / span) * 100;
  const showToday = nowPct >= 0 && nowPct <= 100;

  const pctOf = (d: Date | null) =>
    d ? Math.max(0, Math.min(100, ((d.getTime() - start) / span) * 100)) : 0;

  return (
    <div className="space-y-4">
      <header className="card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <p className="max-w-xl text-xs text-muted">{tr.roadmapHint}</p>
        <div className="flex items-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-6 rounded-full" style={{ background: "var(--c-accent)" }} />
            {tr.laneProgress}
          </span>
          <span className="tnum">
            {formatDate(new Date(start), locale)} → {formatDate(new Date(end), locale)}
          </span>
        </div>
      </header>

      <div className="card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* time axis */}
            <div className="relative ml-[168px] h-9 border-b border-line bg-surface-2/50">
              {ticks.map((tick) => (
                <span
                  key={tick.ts}
                  className="tnum absolute top-1/2 -translate-y-1/2 -translate-x-1/2 whitespace-nowrap px-1 text-[10px] text-muted"
                  style={{ left: `${tick.pct}%` }}
                >
                  {formatDate(new Date(tick.ts), locale)}
                </span>
              ))}
              {showToday ? (
                <span
                  className="absolute bottom-0 top-0 w-px"
                  style={{ left: `${nowPct}%`, background: "var(--c-warning)" }}
                  title={tr.today}
                />
              ) : null}
            </div>

            {lanes.map((lane) => {
              const tone = statusToneVar(lane.status);
              return (
                <div
                  key={lane.status}
                  className="flex border-b border-line last:border-b-0"
                  style={{ minHeight: LANE_MIN_H }}
                >
                  {/* lane label */}
                  <div className="sticky left-0 z-10 w-[168px] shrink-0 border-r border-line bg-surface px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: tone }}
                      />
                      <span className="truncate text-xs font-semibold text-ink">
                        {statusLabel(lane.status, locale)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <ProgressBar value={lane.avg} tone={tone} height="h-1" />
                      <span className="tnum text-[10px] text-muted">
                        {Math.round(lane.avg * 100)}%
                      </span>
                    </div>
                    <span className="tnum text-[10px] text-muted">
                      {lane.items.length} {tr.totalTasks}
                    </span>
                  </div>

                  {/* lane track */}
                  <div className="relative flex-1 py-2">
                    {showToday ? (
                      <span
                        className="absolute bottom-0 top-0 w-px opacity-40"
                        style={{ left: `${nowPct}%`, background: "var(--c-warning)" }}
                      />
                    ) : null}

                    {lane.items.length ? (
                      <div className="space-y-1.5">
                        {lane.items.map((task) => {
                          const rawLeft = pctOf(task.createdAt);
                          const rawRight = pctOf(task.updatedAt);
                          const width = Math.max(rawRight - rawLeft, 0.5);
                          // keep the bar inside the track
                          const left = Math.min(rawLeft, Math.max(0, 100 - width));
                          return (
                            <div
                              key={task.id}
                              className="group relative"
                              style={{ marginLeft: `${left}%` }}
                            >
                              <div
                                className="relative h-7 overflow-hidden rounded-lg border text-left transition-transform group-hover:-translate-y-px"
                                style={{
                                  width: `${width}%`,
                                  minWidth: 132,
                                  borderColor: tone,
                                  background: "var(--c-surface2)",
                                  boxShadow: "var(--c-shadow)",
                                }}
                                title={`${task.title} — ${tr.from} ${formatDate(task.createdAt, locale)} · ${tr.to} ${formatDate(task.updatedAt, locale)}`}
                              >
                                <span
                                  className="absolute inset-y-0 left-0 opacity-25 transition-[width] duration-500"
                                  style={{ width: `${task.progress * 100}%`, background: tone }}
                                />
                                <span
                                  className="absolute inset-0 flex items-center gap-1.5 px-2 text-[11px] font-medium text-ink"
                                  style={{ textShadow: "0 1px 2px var(--c-surface)" }}
                                >
                                  <span className="truncate">{task.title}</span>
                                  <span className="tnum ml-auto shrink-0 rounded bg-surface px-1 text-[10px] text-muted">
                                    {Math.round(task.progress * 100)}%
                                  </span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="px-3 text-[11px] text-muted">{tr.boardEmpty}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
