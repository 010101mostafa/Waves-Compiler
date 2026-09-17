import * as fs from "node:fs";
import * as path from "node:path";
import YAML from "yaml";

export const STATUSES = ["todo", "running", "completed", "failed", "skipped"] as const;
export type Status = (typeof STATUSES)[number];

export type Task = {
  id?: string;
  name?: string;
  agent?: string;
  model?: string;
  prompt?: string;
  status?: string;
};

export type Wave = {
  id?: string;
  name?: string;
  goal?: string;
  status?: string;
  tasks?: Task[];
};

export type Plan = {
  active?: string;
  goalCompleted?: boolean;
  waves?: Wave[];
  [key: string]: unknown;
};

export function planPath(cwd = process.cwd()) {
  return path.join(cwd, "plan.yml");
}

export function readPlan(cwd = process.cwd()): Plan {
  const file = planPath(cwd);
  if (!fs.existsSync(file)) {
    throw new Error(`no plan.yml in ${cwd} — run /plan first`);
  }
  return (YAML.parse(fs.readFileSync(file, "utf-8")) ?? {}) as Plan;
}

export function writePlan(plan: Plan, cwd = process.cwd()) {
  fs.writeFileSync(planPath(cwd), YAML.stringify(plan), "utf-8");
}

/**
 * plan.yml comes in two shapes: a `waves:` list, or top-level wave keys
 * ("wave 1": { ... }). Normalize to a list without losing the original object.
 */
export function waves(plan: Plan): Wave[] {
  if (Array.isArray(plan.waves)) return plan.waves;
  return Object.entries(plan)
    .filter(([k, v]) => /^wave/i.test(k) && v && typeof v === "object")
    .map(([k, v]) => {
      const wave = v as Wave;
      // return the live object, not a copy, so status updates land in the file
      if (!wave.id) wave.id = k;
      return wave;
    });
}

export function activeWave(plan: Plan): Wave {
  const list = waves(plan);
  if (!list.length) throw new Error("plan.yml has no waves");
  const found = plan.active ? list.find((w) => w.id === plan.active) : undefined;
  return found ?? list.find((w) => w.status !== "completed") ?? list[0]!;
}

/**
 * Find a task by 1-based index inside the active wave, or by its id
 * ("task-1-2" / "1-2"), which may live in any wave.
 */
export function findTask(plan: Plan, ref: string): { wave: Wave; task: Task } {
  const n = Number(ref);
  if (Number.isInteger(n) && n > 0) {
    const wave = activeWave(plan);
    const task = wave.tasks?.[n - 1];
    if (!task) throw new Error(`wave ${wave.id} has no task #${n}`);
    return { wave, task };
  }
  const id = ref.startsWith("task-") ? ref : `task-${ref}`;
  for (const wave of waves(plan)) {
    const task = wave.tasks?.find((t) => t.id === id || t.id === ref || t.name === ref);
    if (task) return { wave, task };
  }
  throw new Error(`no task "${ref}" in plan.yml`);
}

/** Roll the wave status up from its tasks. */
function rollUp(wave: Wave) {
  const tasks = wave.tasks ?? [];
  if (!tasks.length) return;
  if (tasks.some((t) => t.status === "failed")) wave.status = "failed";
  else if (tasks.every((t) => t.status === "completed" || t.status === "skipped"))
    wave.status = "completed";
  else if (tasks.some((t) => t.status === "running")) wave.status = "running";
}

export function setTaskStatus(ref: string, status: Status, opts: { cwd?: string } = {}) {
  const cwd = opts.cwd ?? process.cwd();
  if (!STATUSES.includes(status)) {
    throw new Error(`bad status "${status}" — use one of: ${STATUSES.join(", ")}`);
  }
  const plan = readPlan(cwd);
  const { wave, task } = findTask(plan, ref);
  const was = task.status;
  task.status = status;
  rollUp(wave);
  writePlan(plan, cwd);
  return {
    wave: wave.id ?? wave.name,
    task: task.id ?? task.name,
    from: was,
    to: status,
    waveStatus: wave.status,
  };
}
