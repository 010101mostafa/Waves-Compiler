
import { spawn } from 'node:child_process';
import { appendFileSync, closeSync, mkdirSync, openSync } from 'node:fs';

import { Json } from "./json.js"
export function addChild(pid: string, info: any = {}) {
  const file = Json.read("./child_processes.json");

  file[pid] = {
    ...info,
    pid,
    parent: process.pid,

  };
}
/**
 * Runs a command in the background detached from the current process.
 *
 * @param command - Executable binary to spawn
 * @param args - Arguments array for the command
 * @param title - Process alias (argv0) and log filename base
 */
export function run(command: string, args: string[], title: string) {
  mkdirSync("./.logs", { recursive: true });
  const ts = new Date().toJSON().replace("T", " ");
  const logfile = `./.logs/${title}-${ts}.log`
  const log = openSync(logfile, 'a');
  try {
    const child = spawn(command,args, {
      argv0: title,
      detached: true,
      stdio: ['ignore', log, log],
    });
    child.unref();
    appendFileSync("./child_processes.md", `| ${child.pid} | ${title} | [logs](${encodeURI(logfile)}) |\n`);
    return {
      pid: child.pid,
      title,
      logfile,
    }
  } finally {
    closeSync(log); // Safe: Parent handle closed, Child handle stays open in background
  }
}
