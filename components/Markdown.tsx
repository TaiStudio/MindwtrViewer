/* eslint-disable @next/next/no-img-element -- Markdown images and attachments
   point at arbitrary URLs / files in public/, so next/image cannot optimize
   them at build time. `loading="lazy"` keeps the impact in check. */
"use client";

import type { ReactNode } from "react";

/**
 * Minimal Markdown renderer.
 *
 * It builds React elements directly (never `dangerouslySetInnerHTML`), so the
 * source text is always escaped. Supported: YAML front-matter, headings,
 * bold / italic / inline code / code fences, links, images, autolinked URLs,
 * ordered & nested lists, block quotes, tables, thematic breaks and paragraphs.
 */

/* ------------------------------- inline ------------------------------- */

const INLINE = new RegExp(
  [
    "(!\\[([^\\]]*)\\]\\(([^)\\s]+)\\))", // image
    "(\\[([^\\]]+)\\]\\(([^)\\s]+)\\))", // link
    "(`([^`]+)`)", // inline code
    "(\\*\\*([^*]+)\\*\\*)", // strong
    "(__([^_]+)__)", // strong
    "(?<![*\\w])\\*([^*\\n]+)\\*(?![*\\w])", // emphasis
    "(?<![_\\w])_([^_\\n]+)_(?![\\w])", // emphasis
    "(https?:\\/\\/[^\\s<>()\\[\\]]+)", // bare URL
  ].join("|"),
  "g",
);

function safeHref(href: string): string | null {
  const value = href.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(value)) return value;
  if (/^[^:/?#\s]+\/[^/]/.test(value)) return `/${value.replace(/^\.?\//, "")}`;
  return null;
}

function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  // Defensive: a capture group can come back undefined on odd input.
  const src = text ?? "";
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  // Fresh regex per call: a shared `/g` instance would have its lastIndex
  // reset by the recursive calls below and re-match the same token forever.
  const re = new RegExp(INLINE.source, "g");

  let match: RegExpExecArray | null;
  while ((match = re.exec(src)) !== null) {
    if (match.index > last) out.push(src.slice(last, match.index));
    const key = `${keyPrefix}${n++}`;

    if (match[1]) {
      // image ![alt](src)
      const src = safeHref(match[3]);
      out.push(
        src ? (
          <img key={key} src={src} alt={match[2]} className="my-2 max-h-80 rounded-lg" loading="lazy" />
        ) : (
          match[2]
        ),
      );
    } else if (match[4]) {
      // link [text](href)
      const href = safeHref(match[6]);
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noreferrer" className="text-info underline underline-offset-2 hover:opacity-80">
            {renderInline(match[5], `${key}.`)}
          </a>
        ) : (
          renderInline(match[5], `${key}.`)
        ),
      );
    } else if (match[7]) {
      out.push(
        <code key={key} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">
          {match[8]}
        </code>,
      );
    } else if (match[9] || match[11]) {
      out.push(<strong key={key}>{renderInline((match[10] ?? match[12]) as string, `${key}.`)}</strong>);
    } else if (match[13]) {
      // `*emphasis*` — the lookarounds do not capture, so its inner text is group 13.
      out.push(<em key={key}>{renderInline(match[13], `${key}.`)}</em>);
    } else if (match[14]) {
      // `_emphasis_` → group 14.
      out.push(<em key={key}>{renderInline(match[14], `${key}.`)}</em>);
    } else if (match[15]) {
      const href = safeHref(match[15]);
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noreferrer" className="break-all text-info underline underline-offset-2 hover:opacity-80">
            {match[15]}
          </a>
        ) : (
          match[15]
        ),
      );
    }

    last = match.index + match[0].length;
  }

  if (last < src.length) out.push(src.slice(last));
  return out;
}

/* -------------------------------- blocks ------------------------------ */

const RE_HEADING = /^(#{1,6})\s+(.*)$/;
const RE_HR = /^(?:-{3,}|\*{3,}|_{3,})\s*$/;
const RE_FENCE = /^\s*(`{3,}|~{3,})\s*(\S*)\s*$/;
const RE_LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const RE_QUOTE = /^\s*>\s?(.*)$/;
const RE_TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

/** `---\nkey: value\n---` at the very top of the document. */
function splitFrontMatter(
  lines: string[],
): { meta: [string, string][]; rest: string[] } {
  if (lines[0]?.trim() !== "---") return { meta: [], rest: lines };
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (end === -1) return { meta: [], rest: lines };

  const meta: [string, string][] = [];
  for (const line of lines.slice(1, end)) {
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    const value = m[2].trim().replace(/^["']|["']$/g, "").replace(/^\[|\]$/g, "");
    if (!value || m[1].toLowerCase() === "title") continue;
    meta.push([m[1], value]);
  }
  return { meta, rest: lines.slice(end + 1) };
}

function tableCells(line: string): string[] {
  const row = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return row.split("|").map((c) => c.trim());
}

interface ListItem {
  indent: number;
  ordered: boolean;
  text: string;
  children: ListItem[];
}

function buildList(items: ListItem[], key: string): ReactNode {
  const ordered = items[0]?.ordered;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      key={key}
      className={
        ordered
          ? "my-3 list-decimal space-y-1 pl-6 marker:text-muted"
          : "my-3 list-disc space-y-1 pl-6 marker:text-muted"
      }
    >
      {items.map((item, i) => (
        <li key={i} className="text-ink">
          {renderInline(item.text, `li${i}.`)}
          {item.children.length ? buildList(item.children, `${key}-${i}`) : null}
        </li>
      ))}
    </Tag>
  );
}

/** Turns a run of `-` / `1.` lines (with their indented children) into a list. */
function parseListLines(lines: string[], key: string): ReactNode {
  const flat: { indent: number; ordered: boolean; text: string }[] = [];
  for (const line of lines) {
    const m = RE_LIST_ITEM.exec(line);
    if (m) {
      flat.push({
        indent: Math.floor(m[1].replace(/\t/g, "  ").length / 2),
        ordered: /\d/.test(m[2]),
        text: m[3],
      });
    } else if (line.trim()) {
      // lazy continuation of the previous item
      const last = flat[flat.length - 1];
      if (last) last.text += ` ${line.trim()}`;
    }
  }
  if (!flat.length) return null;

  const roots: ListItem[] = [];
  const stack: ListItem[] = [];
  for (const entry of flat) {
    const node: ListItem = { ...entry, children: [] };
    while (stack.length && stack[stack.length - 1].indent >= entry.indent) stack.pop();
    if (stack.length) stack[stack.length - 1].children.push(node);
    else roots.push(node);
    stack.push(node);
  }
  return buildList(roots, key);
}

function renderBlocks(lines: string[], keyPrefix = "b"): ReactNode[] {
  const { meta, rest } = splitFrontMatter(lines);
  const out: ReactNode[] = [];
  const nodes: ReactNode[] = [];

  if (meta.length) {
    nodes.push(
      <dl key={`${keyPrefix}fm`} className="mb-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-xl border border-line bg-surface-2/60 px-3 py-2 text-xs">
        {meta.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-semibold uppercase tracking-wide text-muted">{k}</dt>
            <dd className="text-ink">{renderInline(v, `${k}.`)}</dd>
          </div>
        ))}
      </dl>,
    );
  }

  let i = 0;
  let n = 0;
  const key = () => `${keyPrefix}${n++}`;

  while (i < rest.length) {
    const line = rest[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // fenced code
    const fence = RE_FENCE.exec(line);
    if (fence) {
      const marker = fence[1][0];
      const body: string[] = [];
      i += 1;
      while (i < rest.length && !rest[i].trim().startsWith(marker.repeat(3))) {
        body.push(rest[i]);
        i += 1;
      }
      i += 1;
      nodes.push(
        <pre key={key()} className="my-3 overflow-x-auto rounded-xl border border-line bg-surface-2 p-3 text-xs leading-relaxed">
          <code className="font-mono text-ink">{body.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // heading
    const heading = RE_HEADING.exec(line);
    if (heading) {
      const level = heading[1].length;
      const content = renderInline(heading[2], `h${i}.`);
      const cls =
        "mt-5 mb-2 font-semibold text-ink first:mt-0 " +
        (level === 1
          ? "text-xl"
          : level === 2
            ? "text-lg"
            : level === 3
              ? "text-base"
              : "text-sm");
      const Tag = `h${Math.min(level + 2, 6)}` as "h3" | "h4" | "h5" | "h6";
      nodes.push(<Tag key={key()} className={cls}>{content}</Tag>);
      i += 1;
      continue;
    }

    // thematic break
    if (RE_HR.test(line)) {
      nodes.push(<hr key={key()} className="my-4 border-line" />);
      i += 1;
      continue;
    }

    // table
    if (line.trim().startsWith("|") && i + 1 < rest.length && RE_TABLE_SEP.test(rest[i + 1])) {
      const header = tableCells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < rest.length && rest[i].trim().startsWith("|")) {
        rows.push(tableCells(rest[i]));
        i += 1;
      }
      nodes.push(
        <div key={key()} className="my-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-surface-2">
                {header.map((cell, ci) => (
                  <th key={ci} className="border-b border-line px-3 py-2 text-left font-semibold text-ink">
                    {renderInline(cell, `th${ci}.`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="odd:bg-surface-2/40">
                  {header.map((_, ci) => (
                    <td key={ci} className="border-b border-line px-3 py-2 align-top text-ink">
                      {renderInline(row[ci] ?? "", `td${ri}${ci}.`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // block quote
    if (RE_QUOTE.test(line)) {
      const inner: string[] = [];
      while (i < rest.length && (RE_QUOTE.test(rest[i]) || (rest[i].trim() && inner.length && !RE_HEADING.test(rest[i])))) {
        const m = RE_QUOTE.exec(rest[i]);
        inner.push(m ? m[1] : rest[i]);
        i += 1;
      }
      nodes.push(
        <blockquote key={key()} className="my-3 border-l-2 border-accent pl-3 text-muted italic">
          {renderBlocks(inner, `q${i}.`)}
        </blockquote>,
      );
      continue;
    }

    // list
    if (RE_LIST_ITEM.test(line)) {
      const run: string[] = [];
      while (i < rest.length && (RE_LIST_ITEM.test(rest[i]) || (rest[i].trim() && !RE_HEADING.test(rest[i]) && !RE_HR.test(rest[i]) && !rest[i].trim().startsWith("|") && RE_LIST_ITEM.test(run[run.length - 1] ?? "")))) {
        if (!rest[i].trim() && RE_LIST_ITEM.test(rest[i + 1] ?? "")) break;
        run.push(rest[i]);
        i += 1;
      }
      const list = parseListLines(run, key());
      if (list) nodes.push(list);
      continue;
    }

    // paragraph
    const para: string[] = [];
    while (i < rest.length && rest[i].trim()) {
      const stop =
        RE_HEADING.test(rest[i]) ||
        RE_FENCE.test(rest[i]) ||
        RE_HR.test(rest[i]) ||
        RE_QUOTE.test(rest[i]) ||
        RE_LIST_ITEM.test(rest[i]) ||
        (rest[i].trim().startsWith("|") && i + 1 < rest.length && RE_TABLE_SEP.test(rest[i + 1]));
      if (stop && para.length) break;
      if (stop && !para.length) break;
      para.push(rest[i].trim());
      i += 1;
    }
    if (para.length) {
      nodes.push(
        <p key={key()} className="my-2 leading-relaxed text-ink">
          {renderInline(para.join(" "), `p${n}.`)}
        </p>,
      );
    } else {
      i += 1;
    }
  }

  out.push(...nodes);
  return out;
}

export default function Markdown({ text, className = "" }: { text: string; className?: string }) {
  if (!text?.trim()) return null;
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  return <div className={`md-body ${className}`}>{renderBlocks(lines)}</div>;
}
