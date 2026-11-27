# Mindwtr Viewer

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3.0-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org)
[![pnpm](https://img.shields.io/badge/package%20manager-pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![Last commit](https://img.shields.io/github/last-commit/TaiStudio/MindwtrViewer?logo=github)](https://github.com/TaiStudio/MindwtrViewer/commits/main)
[![Repo](https://img.shields.io/badge/repo-TaiStudio%2FMindwtrViewer-blue?logo=github)](https://github.com/TaiStudio/MindwtrViewer)
[![Sponsor](https://img.shields.io/github/sponsors/LeGitHubDeTai?logo=githubsponsors&label=Sponsor&color=ea4aaa)](https://github.com/sponsors/LeGitHubDeTai)

A Next.js site for viewing `data/tasks.json` from several angles: **board (kanban)**, **calendar**, **roadmap**, **task list** and **references**, with progress (checklists) everywhere.

Click any task (card, row, roadmap bar, reference entry) to open it in a **modal**: the **Markdown** description rendered nicely (headings, tables, lists, links…), checklist, metadata and **attachments** with image previews.

> 🇫🇷 French version: [README_fr.md](./README_fr.md)

## Getting started

```bash
npm install   # or pnpm install
npm run dev
```

Then open <http://localhost:3000>.

## Dynamic data

The site re-reads **`data/tasks.json`** and **`data/config.ts`** on every page request (`/` and `/api/data`, blocking renders so never cached), and the browser refreshes automatically (by default every 4 seconds, and when you come back to the tab).

👉 You can edit `data/tasks.json` at any time: changes appear on their own, no server restart needed.

`tasks.json` is format-tolerant: an array of `{ tasks: [...] }` (the current format), an object `{ tasks: [...] }`, a flat array of tasks, or `{ projects: [{ tasks }] }`.

Each task is displayed with:
- its **status** (`today`, `next`, `someday`, `done`, … — unknown statuses are shown as-is),
- its **progress**: completed / total checklist, otherwise 100 % if the status is "done",
- its creation / update dates, tags, description, attachments.

## Configuration — `data/config.ts`

A **typed TypeScript file**: your editor knows every key (`Ctrl+Space` for completion, `Ctrl+click` on a word to jump to the `AppConfig` type in `lib/types.ts`). An unknown key or a wrong value is underlined **in the editor** before you even save.

```ts
// data/config.ts
import type { UserConfig } from "@lib/types";

const config: UserConfig = {
  siteName: "Mindwtr Viewer",            // string or { fr: …, en: … }
  language: "fr",                        // code of a language in lib/i18n/ — default language
  theme: "moderne",                      // id of a theme in lib/themes/ — default theme
  refreshIntervalMs: 4000,               // reload frequency (500–60000)
  calendar: { dateField: "updatedAt" },  // "createdAt" | "updatedAt"

  references: {                          // References tab (see below)
    label: null,                         //   tab name
    hideEmpty: true,                     //   hide empty groups + entries with 0 tasks
    groups: {                            //   one block per group:
      tasks:    { hidden: false, label: null },   // Reference tasks
      areas:    { hidden: false, label: null },   // Areas
      people:   { hidden: false, label: null },   // People
      projects: { hidden: false, label: null },   // Projects
      sections: { hidden: false, label: null },   // Sections
      contexts: { hidden: false, label: null },   // Contexts
    },
  },

  hideDeleted: true,                     // hide tasks with deletedAt (default)
  hideArchived: false,                   // hide tasks with archivedAt
};

export default config;
```

- An **empty or partial** file works: missing values fall back to the internal defaults (`lib/defaults.ts`) — `const config: UserConfig = {}; export default config;` is enough.
- Saving is enough: the file is re-read **on every request** (native import with `?v=mtime`, no cache), with no restart and no recompile.
- **Languages and themes are no longer declared here**: they are discovered in their dedicated folders (see below). This file only picks the defaults.
- The language and theme chosen in the UI are remembered in the browser (`localStorage`) and override `config.ts`.
- `label` accepts a **fixed string** (`"…"`) or a **per-language map** (`{ fr: "…", en: "…" }`); `null` keeps the translated label from the language files.

### Example: rename + hide

```ts
// data/config.ts (excerpt)
import type { UserConfig } from "@lib/types";

const config: UserConfig = {
  references: {
    label: { fr: "Bibliothèque", en: "Library" },   // tab name
    hideEmpty: true,                                // nothing shown at 0
    groups: {
      people:   { hidden: true },                   // group hidden
      projects: { label: { fr: "Game projects" } }  // group renamed
    }
  }
};

export default config;
```

Each group `label` follows the same rule as the tab: `null` → translated label (`refAreas`, `refPeople`, …).

## References tab

Six groups coming from `data/tasks.json`, with task count and progress:

| group | config id | source | counted by |
| --- | --- | --- | --- |
| **Reference tasks** | `tasks` | tasks with status `reference` | click → task modal |
| **Contexts** | `contexts` | `settings.taxonomy.contexts` ∪ contexts used by tasks | click → global filter |
| **Areas** | `areas` | `areas[]` | `task.areaId`, or its project's `project.areaId` |
| **People** | `people` | `people[]` | `task.assignedTo` (same name) |
| **Projects** | `projects` | `projects[]` | `task.projectId` — each project lists its sections |
| **Sections** | `sections` | `sections[]` | `task.sectionId`, grouped by project |

Two visibility rules, configurable in `references`:

- **`groups.<id>.hidden: true`** → the whole group disappears.
- **`hideEmpty: true`** → an **empty group** disappears, and within each group an **entry with 0 tasks** disappears too (a project without tasks, an unused context…). A project left with only empty sections disappears as well.

## Context filter

The **Context** selector in the header (next to the theme) filters **every view**: board, calendar, roadmap, tasks and references. The choice is remembered in the browser.

From the References tab, clicking a context chip toggles the same filter (click again to clear it).

## Task modal, Markdown, attachments

- **Modal**: every task is clickable (board cards, task rows, roadmap bars, "Reference tasks" entries) and opens in a modal window — `Esc`, the ✕ button or clicking outside closes it.
- **Markdown**: the `description` is interpreted by a custom renderer (`components/Markdown.tsx`, no `dangerouslySetInnerHTML`) — headings, tables, nested lists, quotes, code, links, images and YAML front-matter.
- **Attachments**: files declared in `tasks.json` are served from **`public/`** (`cloudKey` → `/attachments/…`, external `uri`s as-is). Images get a preview, PDFs a badge; a file missing from `public/` shows a "missing" badge instead of a broken image. Copy your files into `public/attachments/` — they show up without a restart.

## Deleted / archived tasks

- **`hideDeleted: true`** (default): tasks with `deletedAt` do not appear in **any** view. Set it to `false` to show them anyway.
- **`hideArchived: false`** (default): same for `archivedAt` if you enable this option.

## Adding a language — `lib/i18n/*.ts`

**Create a file, that's it.** No index to update: the server re-reads the folder on every request and the new file appears in the language selector on the next refresh.

> Both folders are read **on every request**, never cached: creating a file, deleting one, or **editing the contents of an existing file** (a color, a translation…) is picked up without restarting or recompiling.

```ts
// lib/i18n/de.ts
import type { Locale } from "@lib/i18n/locale";

const de: Locale = {
  code: "de",            // must match the file name
  name: "Deutsch",       // shown in the selector
  intl: "de-DE",         // date/number formatting (default: code)
  weekStart: 1,          // 0 = Sunday, 1 = Monday (default: 1)
  dict: {
    tabBoard: "Board",
    tabCalendar: "Kalender",
    // … a subset is enough
  },
};

export default de;
```

- Missing keys **fall back to English automatically**: a file can start with 3 strings.
- The list of keys is in `lib/i18n/dictionary.ts`. For a new UI string: add the key there, then its translation in each language file.
- `lib/i18n/{index,locale,dictionary}.ts` are infrastructure and ignored by discovery.

## Adding a theme — `lib/themes/*.ts`

Same principle: **create the file, that's it.**

```ts
// lib/themes/neon.ts
import type { ThemeInput } from "@lib/types";

const neon: ThemeInput = {
  name: { fr: "Néon", en: "Neon" },   // a plain string works too
  mode: "dark",                        // "light" | "dark"
  colors: { bg: "#05050a", accent: "#22d3ee" }, // partial: the rest takes the default theme
};

export default neon;
```

- Only `colors` is required. The `id` is the file name, `mode` defaults to `"light"`.
- Missing colors are filled in from a fallback palette: a 2-line file is enough.
- Available tokens: `bg`, `surface`, `surface2`, `border`, `text`, `textMuted`, `accent`, `accentText`, `accentSoft`, `success`, `warning`, `danger`, `info`, `shadow` → CSS variables `--c-bg`, `--c-text-muted`, …

### Bundled themes

| file | name |
| --- | --- |
| `moderne.ts` | Modern & minimalist (**default**, light) |
| `minuit.ts` | Midnight (dark) |
| `aurore.ts` | Aurora (soft, terracotta accent) |

### Bundled languages

| file | name |
| --- | --- |
| `fr.ts` | French (**default**) |
| `en.ts` | English (fallback for all other languages) |

## Structure

```
app/
  page.tsx            # blocking render: reads data/tasks.json + data/config.ts → <Viewer />
  layout.tsx          # Geist fonts + metadata
  globals.css         # color variables driven by the theme
  api/data/route.ts   # re-reads data/tasks.json + data/config.ts (never cached)
components/
  Viewer.tsx          # header, tabs, theme, language, context filter, auto refresh, task modal
  BoardView.tsx       # kanban by status + progress per column
  CalendarView.tsx    # full month, tasks per day, side panel
  RoadmapView.tsx     # horizontal timeline (bars from creation → update)
  TasksView.tsx       # filterable list (search, status, tags)
  ReferencesView.tsx  # references, areas, people, projects, sections, contexts
  TaskModal.tsx       # task modal (Esc / ✕ / click outside)
  Markdown.tsx        # Markdown rendering (headings, tables, lists, links…)
  ui.tsx              # progress bars, chips, cards, details, attachments
data/
  config.ts           # typed configuration (UserConfig) — hot-editable
  tasks.json          # the data (tolerant format)
lib/
  data.ts             # disk reading of data/ + language/theme discovery
  discover.ts         # scan of lib/i18n/ and lib/themes/ (new file = new entry)
  derive.ts           # task normalization, statuses, dates, filters, aggregates
  references.ts       # extraction of areas/people/projects/sections/contexts
  defaults.ts         # default config + merge with data/config.ts
  prefs.ts            # remembered language / theme / view / context (localStorage)
  types.ts            # shared types (ThemeInput, DataSet, ReferenceData, …)
  i18n/
    dictionary.ts     # all UI text keys
    locale.ts         # Locale / ResolvedLocale types
    index.ts          # formatDate, formatMonth, statusLabel, fmt, resolveDict…
    fr.ts             # French (default)
    en.ts             # English (fallback)
  themes/
    moderne.ts        # default theme
    minuit.ts         # dark
    aurore.ts         # soft
```

## Roadmap view

Since `tasks.json` has no due dates, each bar covers **`createdAt` → `updatedAt`**, its color comes from the status and its **fill = checklist progress**. The lanes are the statuses, with an average progress per status and a "today" marker.
