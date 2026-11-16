/**
 * Every user-visible string of the site lives here.
 *
 * To add a string: add its key here, then provide a value in every file under
 * `lib/i18n/`. A locale that does not know a key yet falls back to the
 * fallback locale (English by default).
 */
export interface Dictionary {
  /* header / navigation */
  appSubtitle: string;
  view: string;
  tabBoard: string;
  tabCalendar: string;
  tabRoadmap: string;
  tabTasks: string;

  /* stats */
  overallProgress: string;
  totalTasks: string;
  completedTasks: string;
  focusedToday: string;
  lastUpdate: string;
  refresh: string;
  refreshing: string;
  autoRefresh: string;
  language: string;
  theme: string;
  loading: string;
  errorTitle: string;
  errorHint: string;

  /* task list & filters */
  search: string;
  status: string;
  allStatuses: string;
  tags: string;
  allTags: string;
  noResults: string;
  clearFilters: string;
  showing: string;
  of: string;
  noTasks: string;
  noTasksHint: string;

  /* task details */
  checklist: string;
  noChecklist: string;
  subItems: string;
  description: string;
  attachments: string;
  created: string;
  updated: string;
  project: string;
  open: string;
  expand: string;
  collapse: string;

  /* calendar */
  prevMonth: string;
  nextMonth: string;
  goToday: string;
  dateField: string;
  dateCreatedAt: string;
  dateUpdatedAt: string;
  tasksOn: string;
  noTasksThisDay: string;
  selectDay: string;

  /* roadmap */
  roadmapHint: string;
  legend: string;
  laneProgress: string;
  from: string;
  to: string;
  span: string;
  days: string;
  today: string;
  noDates: string;

  /* board */
  boardEmpty: string;
  statusColumn: string;

  /* task statuses — key = `status_` + normalised status id */
  status_today: string;
  status_in_progress: string;
  status_next: string;
  status_waiting: string;
  status_inbox: string;
  status_backlog: string;
  status_someday: string;
  status_done: string;
  status_cancelled: string;
  status_archived: string;
  status_maybe: string;
}
