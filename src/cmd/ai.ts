#!/usr/bin/env node
import { Command, Option } from "commander";
import pkg from "../../package.json" with { type: "json" };
import {start} from "../start.js"
import { log, run } from "../cmd-helpers.js";
const program = new Command();
program
    .name("ai")
    .description("use ai in cli by Waves Compiler.")
    .version(pkg.version)
    .action(log(start));
run(program);
