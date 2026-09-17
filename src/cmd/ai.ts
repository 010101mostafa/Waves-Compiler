#!/usr/bin/env node
import { Command } from "commander";
import pkg from "../../package.json" with { type: "json" };
import {start} from "../start.js"
import { log, run } from "../cmd-helpers.js";
const program = new Command();
program
    .name("ai")
    .description("use ai in cli by Waves Compiler.")
    .version(pkg.version)
    .option("--use-pi -p", "use pi as the ai tool")
    .option("--use-claude -c", "use claude as the ai tool")
    .option("--use-opencode -o", "use opencode as the ai tool")
    .action(log(start));

run(program);
