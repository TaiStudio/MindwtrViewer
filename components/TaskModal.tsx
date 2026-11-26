"use client";

import { useEffect } from "react";

import type { ResolvedLocale } from "@lib/i18n";
import type { Task } from "@lib/types";
import { ProgressBar, StatusPill, Tag, TaskDetail } from "./ui";

/**
 * Full-screen dialog showing one task: description (Markdown), checklist,
 * attachments (images previewed, links & files clickable) and metadata.
 * Closes with ✕, Esc or a click outside.
 */
export default function TaskModal({
  task,
  locale,
  projectTitle,
  onClose,
}: {
  task: Task;
  locale: ResolvedLocale;
  projectTitle?: string | null;
  onClose: () => void;
}) {
  const tr = locale.dict;
  const pct = Math.round(task.progress * 100);

  // Lock the page scroll and close on Escape while the modal is open.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={task.title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rise card my-auto w-full max-w-3xl rounded-2xl">
        {/* header */}
        <header className="flex items-start gap-3 border-b border-line p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={task.status} locale={locale} />
              {task.contexts.map((c) => (
                <Tag key={c} label={c} />
              ))}
              {task.tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
            </div>
            <h2 className="mt-2 text-lg font-semibold leading-snug text-ink">{task.title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={tr.close}
            title={tr.close}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            ✕
          </button>
        </header>

        {/* progress */}
        <div className="flex items-center gap-3 px-4 pt-4 sm:px-5">
          <ProgressBar
            value={task.progress}
            tone={task.progress >= 1 ? "var(--c-success)" : "var(--c-accent)"}
          />
          <span className="tnum w-10 shrink-0 text-right text-xs text-muted">{pct}%</span>
          <span className="tnum shrink-0 text-[11px] text-muted">
            {task.checklist.length
              ? `${task.checklist.filter((c) => c.completed).length}/${task.checklist.length}`
              : ""}
          </span>
        </div>

        <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto p-4 sm:p-5">
          <TaskDetail task={task} locale={locale} projectTitle={projectTitle} />
        </div>

        {/* footer */}
        <footer className="border-t border-line px-4 py-3 text-[11px] text-muted sm:px-5">
          {tr.close} · Esc
        </footer>
      </div>
    </div>
  );
}
