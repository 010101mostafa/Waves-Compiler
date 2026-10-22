// Crontab: one tagged cron line per file in the user's crontab (see Icrontab.ts).
import type { ICronJob, ICrontab, ICrontabDeps, ICronTag } from "./Icrontab.js";

/** Number of schedule fields at the start of a cron line ("m h dom mon dow"). */
const SCHEDULE_FIELDS = 5;

/**
 * Cron's schedule fields: "every `when` minutes", or `when` itself when it is already a cron schedule.
 * Extra spaces in a schedule string are collapsed, so the same schedule always gives the same line.
 */
export function schedule(when: number | string): string {
  if (typeof when === "string") return fields(when).join(" ");
  return when === 1 ? "* * * * *" : `*/${when} * * * *`;
}

/** True when `when` has exactly the 5 cron schedule fields. */
export function isSchedule(when: string): boolean {
  return fields(when).length === SCHEDULE_FIELDS;
}

/** Quote `s` for sh. */
export const shQuote = (s: string): string => `'${s.replaceAll("'", `'\\''`)}'`;

/** A path as cron sees it: plain, or sh-quoted only when it has to be. */
export const quote = (file: string): string => /^[\w./-]+$/.test(file) ? file : shQuote(file);

/** Undo `quote`. */
export const unquote = (s: string): string => s.startsWith("'") ? s.slice(1, -1).replaceAll(`'\\''`, "'") : s;

/** Tag "<mark><file>": the file is written in the comment (e.g. "# population:/wd/team.json"). */
export function pathTag(mark: string): ICronTag {
  return {
    mark: file => `${mark}${file}`,
    fileOf: line => line.includes(mark) ? line.slice(line.lastIndexOf(mark) + mark.length) : null,
  };
}

/**
 * Tag "<schedule> <file> <mark>": the command is the file itself and the comment is only `mark`
 * (e.g. "* * * * * /wd/a.sh # by ai-cron"). Use it with `quote` as the Crontab command.
 */
export function commandTag(mark: string): ICronTag {
  const suffix = ` ${mark}`;
  return {
    mark: () => mark,
    fileOf: line => line.endsWith(suffix) ? unquote(commandOf(line.slice(0, -suffix.length))) : null,
  };
}

/** The tagged lines of one tool in the user's crontab, keyed by file path. */
export class Crontab implements ICrontab {
  /**
   * @param deps reads and writes the crontab (CrontabDeps, or a fake in tests)
   * @param command the shell command cron runs for a file
   * @param tag the comment that marks this tool's lines
   */
  constructor(
    private readonly deps: ICrontabDeps,
    private readonly command: (file: string) => string,
    private readonly tag: ICronTag,
  ) {}

  line(file: string, when: number | string): string {
    // `%` means "new line" to cron; escape it so a path with % still works.
    return `${schedule(when)} ${this.command(file).replaceAll("%", "\\%")} ${this.tag.mark(file)}`;
  }

  find(file: string): string | null {
    return this.deps.read().find(l => this.isLineOf(l, file)) ?? null;
  }

  list(): ICronJob[] {
    return this.deps.read().flatMap(l => {
      const file = this.tag.fileOf(l);
      return file === null ? [] : [{ file, schedule: scheduleOf(l) }];
    });
  }

  ensure(file: string, when: number | string): boolean {
    const want = this.line(file, when);
    const lines = this.deps.read();
    // Already right: exactly one line for this file, and it is the wanted one.
    if (lines.includes(want) && lines.filter(l => this.isLineOf(l, file)).length === 1) return false;
    this.deps.write([...lines.filter(l => !this.isLineOf(l, file)), want]);
    return true;
  }

  remove(file: string): boolean {
    const lines = this.deps.read();
    const kept = lines.filter(l => !this.isLineOf(l, file));
    if (kept.length === lines.length) return false;
    this.deps.write(kept);
    return true;
  }

  private isLineOf(line: string, file: string): boolean {
    return this.tag.fileOf(line) === file;
  }
}

function fields(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

/** The schedule part of a cron line. */
function scheduleOf(line: string): string {
  return fields(line).slice(0, SCHEDULE_FIELDS).join(" ");
}

/** The command part of a cron line (everything after the schedule). */
function commandOf(line: string): string {
  return fields(line).slice(SCHEDULE_FIELDS).join(" ");
}
