"use client";

import type { ReactNode } from "react";

import { fmt, formatDate, statusLabel, type ResolvedLocale } from "@/lib/i18n";
import { statusToneVar } from "@/lib/derive";
import type { Task } from "@/lib/types";

/* ----------------------------- primitives ----------------------------- */

export function ProgressBar({
  value,
  tone = "var(--c-accent)",
  className = "",
  height = "h-1.5",
}: {
  value: number;
  tone?: string;
  className?: string;
  height?: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-line ${height} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct * 100}%`, background: tone }}
      />
    </div>
  );
}

export function Ring({
  value,
  size = 64,
  stroke = 6,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const pct = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="var(--c-accent)"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        {children ?? <span className="tnum text-sm font-semibold">{Math.round(pct * 100)}%</span>}
      </div>
    </div>
  );
}

export function StatusPill({ status, locale }: { status: string; locale: ResolvedLocale }) {
  const color = statusToneVar(status);
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {statusLabel(status, locale)}
    </span>
  );
}

export function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">
      {label}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------- task --------------------------------- */

export function TaskCard({
  task,
  locale,
  compact = false,
}: {
  task: Task;
  locale: ResolvedLocale;
  compact?: boolean;
}) {
  const tr = locale.dict;
  const tone = statusToneVar(task.status);
  const pct = Math.round(task.progress * 100);

  return (
    <article className="group rounded-xl border border-line bg-surface p-3 transition-colors hover:border-accent/40">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug text-ink">{task.title}</h4>
        {task.focused ? (
          <span
            title={tr.focusedToday}
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full live-dot"
            style={{ background: "var(--c-warning)" }}
          />
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StatusPill status={task.status} locale={locale} />
        {task.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <ProgressBar value={task.progress} tone={tone} />
        <span className="tnum w-9 shrink-0 text-right text-[11px] text-muted">{pct}%</span>
      </div>

      {!compact ? (
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
          <span>
            {task.checklist.length
              ? fmt(tr.subItems, {
                  done: task.checklist.filter((c) => c.completed).length,
                  total: task.checklist.length,
                })
              : tr.noChecklist}
          </span>
          <span className="tnum">{formatDate(task.updatedAt, locale)}</span>
        </div>
      ) : null}
    </article>
  );
}

export function TaskDetail({ task, locale }: { task: Task; locale: ResolvedLocale }) {
  const tr = locale.dict;
  const isLink = (uri: string) => /^https?:\/\//i.test(uri);

  return (
    <div className="mt-3 space-y-3 border-t border-line pt-3">
      {task.description ? (
        <div>
          <h5 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {tr.description}
          </h5>
          {isLink(task.description) ? (
            <a
              href={task.description}
              target="_blank"
              rel="noreferrer"
              className="break-all text-sm text-info underline-offset-2 hover:underline"
            >
              {task.description}
            </a>
          ) : (
            <p className="whitespace-pre-wrap text-sm text-ink">{task.description}</p>
          )}
        </div>
      ) : null}

      <div>
        <h5 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {tr.checklist}
        </h5>
        {task.checklist.length ? (
          <ul className="space-y-1">
            {task.checklist.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                <span
                  className="mt-1 inline-block h-3 w-3 shrink-0 rounded border"
                  style={{
                    borderColor: item.completed ? "var(--c-success)" : "var(--c-border)",
                    background: item.completed ? "var(--c-success)" : "transparent",
                  }}
                />
                <span className={item.completed ? "text-muted line-through" : "text-ink"}>
                  {item.title}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{tr.noChecklist}</p>
        )}
      </div>

      {task.attachments.length ? (
        <div>
          <h5 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {tr.attachments}
          </h5>
          <ul className="space-y-1">
            {task.attachments.map((a) =>
              a.uri && isLink(a.uri) ? (
                <li key={a.id}>
                  <a
                    href={a.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-info underline-offset-2 hover:underline"
                  >
                    {a.title} ↗
                  </a>
                </li>
              ) : (
                <li key={a.id} className="text-sm text-muted">
                  {a.title}
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted">
        <dt className="font-medium">{tr.created}</dt>
        <dd className="tnum">{formatDate(task.createdAt, locale, true)}</dd>
        <dt className="font-medium">{tr.updated}</dt>
        <dd className="tnum">{formatDate(task.updatedAt, locale, true)}</dd>
        {task.projectId ? (
          <>
            <dt className="font-medium">{tr.project}</dt>
            <dd className="truncate font-mono" title={task.projectId}>
              {task.projectId.slice(0, 8)}…
            </dd>
          </>
        ) : null}
      </dl>
    </div>
  );
}
