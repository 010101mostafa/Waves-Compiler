
import { spawnSync } from 'node:child_process';
/**
 * Runs a command in the background detached from the current process.
 *
 * @param command - Executable binary to spawn
 * @param args - Arguments array for the command
 * @param title - Process alias (argv0) and log filename base
 */
export function run(command: string, args: string[], title: string) {
  // 1. Spawn child process inheriting terminal I/O
   spawnSync(command, args, {
    argv0:title,
    stdio: 'inherit',
  });

  // 3. Immediately terminate current Node process
  process.exit(0);
}