// CrontabDeps: the real ICrontabDeps, reading and writing the user's crontab with `crontab`.
import { execFileSync } from "node:child_process";
import type { ICrontabDeps } from "./Icrontab.js";

/** Reads and writes the current user's crontab with the `crontab` command. */
export class CrontabDeps implements ICrontabDeps {
  /** The crontab lines; [] when the user has no crontab. Throws on any other `crontab -l` error. */
  // TODO: test read with no crontab, an empty crontab, and a crontab error.
  read(): string[] {
    try {
      const text = execFileSync("crontab", ["-l"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      return text.split("\n").filter(l => l !== "");
    } catch (e) {
      if (/no crontab/i.test(String((e as { stderr?: unknown }).stderr ?? ""))) return [];
      throw e;
    }
  }

  /** Replace the whole crontab. An empty list leaves an empty crontab (it does not delete it). */
  write(lines: string[]): void {
    execFileSync("crontab", ["-"], { input: lines.length ? lines.join("\n") + "\n" : "" });
  }
}
