#!/usr/bin/env node
// ai-cron: one cron line per .sh file, "<schedule> <script> # by ai-cron"; the script path is its id.
// The script sets its own PATH and writes its own log, so the line holds nothing else.
//   ai-cron <script.sh> "<schedule>"   add or update its line
//   ai-cron <script.sh> --remove       remove its line
//   ai-cron ls                         list every ai-cron line
import * as fs from "node:fs";
import * as path from "node:path";
import { Command } from "commander";
import pkg from "../../package.json" with { type: "json" };
import { commandTag, Crontab, isSchedule, quote } from "../cronTab/crontab.js";
import { CrontabDeps } from "../cronTab/CrontabDeps.js";

/** The argument that lists the lines instead of naming a script. */
const LIST = "ls";

const fail = (message: string): never => {
    console.error(`ai-cron: ${message}`);
    process.exit(1);
};

const cronTab = new Crontab(new CrontabDeps(), quote, commandTag("# by ai-cron"));

function list(): void {
    const jobs = cronTab.list();
    if (!jobs.length) console.log("no ai-cron lines");
    for (const job of jobs) console.log(`${job.schedule.padEnd(16)} ${job.file}`);
}

function remove(script: string): void {
    console.log(cronTab.remove(script) ? "cron line removed" : "no cron line for this script");
}

function set(script: string, schedule: string | undefined): void {
    if (!fs.existsSync(script)) fail(`no such file: ${script}`);
    if (schedule === undefined || !isSchedule(schedule)) {
        return fail(`schedule needs 5 fields, e.g. "* * * * *" (got "${schedule ?? ""}")`);
    }
    // Cron runs the script itself (no `sh` in the line), so it must be executable.
    fs.chmodSync(script, fs.statSync(script).mode | 0o111);
    cronTab.ensure(script, schedule);
    console.log(cronTab.find(script));
}

const program = new Command();
program
    .name("ai-cron")
    .description("add, update or remove the cron line of a .sh file")
    .version(pkg.version)
    .argument("<script>", `the .sh file cron runs; its path is the line's id (\`${LIST}\` = list every ai-cron line)`)
    .argument("[schedule]", "cron schedule, 5 fields, e.g. \"*/5 * * * *\"")
    .option("-r, --remove", "remove the script's cron line")
    .action((script: string, schedule: string | undefined, opts: { remove?: boolean }) => {
        if (script === LIST) return list();
        const abs = path.resolve(script);
        if (opts.remove) return remove(abs);
        set(abs, schedule);
    });
// TODO: test the CLI: `ls` with and without lines, --remove of a missing line, a missing file, a bad schedule.

program.parse();
