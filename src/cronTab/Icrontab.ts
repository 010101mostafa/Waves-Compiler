// Crontab: one cron line per file (a script or a config), kept in the user's crontab.
// Each line ends with a tag comment, so it is found, updated and removed by its
// file path without touching the user's other cron lines.

/** How a Crontab marks its own lines and finds the file of a line. */
export interface ICronTag {
  /** The comment at the end of the line of `file`. */
  mark(file: string): string;
  /** The file of a line with this tag, or null when the line is not one of ours. */
  fileOf(line: string): string | null;
}

/** Dependencies for the Crontab constructor (inject fakes in tests). */
export interface ICrontabDeps {
  /** The current crontab lines ([] when the user has none). */
  read(): string[];
  /** Replace the whole crontab with these lines. */
  write(lines: string[]): void;
}

/** One tagged line, as `list()` returns it. */
export interface ICronJob {
  /** The file the line belongs to (its id). */
  file: string;
  /** The 5 cron schedule fields, e.g. "*\/5 * * * *". */
  schedule: string;
}

/** The lines of one tag in the user's crontab, keyed by file path. */
export interface ICrontab {
  /** The full cron line for `file`: every `when` minutes, or on the cron schedule `when` ("0 2 * * *"). */
  line(file: string, when: number | string): string;
  /** Add the line, or replace it when it differs. Returns true if the crontab was written. */
  ensure(file: string, when: number | string): boolean;
  /** Remove the line of `file`. Returns true if one was removed. */
  remove(file: string): boolean;
  /** Every line with this tag. */
  list(): ICronJob[];
  /** The current line of `file`, or null. */
  find(file: string): string | null;
}
