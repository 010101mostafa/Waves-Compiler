import * as fs from "node:fs";
import * as path from "node:path";

export type ToolType = "pi" | "claude" | "opencode";

/** Package root — where .env lives. */
export const root = path.join(import.meta.dirname, "../");

const envFile = path.join(root, ".env");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const defaults = {
  env: "dev",
  /** Which CLI to drive. */
  tool: (process.env["AI_TOOL"]?.trim() || "claude") as ToolType,
  /** Agent definitions. Override with AGENTS_DIR. */
  skillsDir: process.env["SKILL_DIR"]?.trim() || path.resolve(root,"./.env4"),
};

export const config = {} as typeof defaults;

export function load(configToLoad: Partial<typeof defaults>) {
  Object.assign(config, configToLoad);
}
load(defaults);
