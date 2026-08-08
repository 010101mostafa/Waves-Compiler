import type { Command } from "commander";

export function log(fn:Function) {
    return async (...args:any[]) => {
        console.log(JSON.stringify(await fn.call(null, ...args), null, 2));
    }
}
export async function run(program:Command) {
    process.env.IS_CLI = "true";
    try {
      await program.parseAsync();
      process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
