
import { spawn } from 'node:child_process';
import { appendFileSync, closeSync, mkdirSync, openSync } from 'node:fs';
/**
 * Runs a command in the background detached from the current process.
 *
 * @param command - Executable binary to spawn
 * @param args - Arguments array for the command
 * @param title - Process alias (argv0) and log filename base
 */
export function run(command: string, args: string[], title: string, {
  replace=false
}) {
  if (replace) {
    return replaceSelf(command, args, title);
  }
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
    const Q = "```"
    appendFileSync("./child_processes.md", `| ${child.pid} | ${title} | [logs](${encodeURI(logfile)}) | ${Q} kill -9 ${child.pid} ${Q}|\n`);
    return {
      pid: child.pid,
      title,
      logfile,
      tokill:"kill -9 "+child.pid
    }
  } finally {
    closeSync(log); // Safe: Parent handle closed, Child handle stays open in background
  }
}

function replaceSelf(command:string, args:any[] = [],title: string) {
  // 1. Spawn child process inheriting terminal I/O
  const child = spawn(command, args, {
    argv0:title,
    stdio: 'inherit',
    detached: true, // Allows child to run independently
  });

  // 2. Disown child process from Node's event loop
  child.unref();

  // 3. Immediately terminate current Node process
  process.exit(0);
}
