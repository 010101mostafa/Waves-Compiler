#!/usr/bin/env node
import { Command, Option } from "commander";
import pkg from "../../package.json" with { type: "json" };
import { log, run } from "../cmd-helpers.js";
import { setTaskStatus, STATUSES, type Status } from "../plan.js";

const program = new Command();
program
    .name("ai-task")
    .description(" update a task's status in plan.yml ")
    .version(pkg.version)
    .argument("<task>", "task index in the active wave (1-based), or a task id like task-1-2")
    .addOption(new Option("-s, --status <status>", "new status").choices(STATUSES).makeOptionMandatory())
    .action(log((task: string, opts: { status: Status }) =>
        setTaskStatus(task, opts.status)));

run(program);
