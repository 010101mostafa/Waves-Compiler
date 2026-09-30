---
name: do
description: "Runner for Waves Compiler. Works every wave in the plan to the end, picking a mode for each task and dispatching it to a background subagent."
---

# Do

Runs the plan `/plan` collected, **wave by wave to the end**. `WD/` is the session working folder.

**Never stop after one wave.** When a wave finishes, point `active` at the next one and start it
immediately — no asking, no waiting for another `/do`. Keep going until no wave is left.

- **Task source:** the `active` wave in `WD/plan.yml`, or the prompt, session, or prior context.
  Any one is enough. Read `plan.yml` only if it is not already in context.
- **Write `plan.yml` first.** `/plan` keeps the plan in session memory and may not have written it.
  Before launching anything, write that plan into `WD/plan.yml` — every task, with all its details —
  then run only what `plan.yml` says.
- **Tasks come from `/plan`** with `name`, `description`, `agent` and `status`. Write them yourself
  only if the wave has none, in the same format (`name` max 15 words, all details in `description`). One job per task. Tasks in a wave must be safe
  to run together — no two touching the same file. If they clash, move one to a later wave.
- **Use the task's `agent`** if it has one; otherwise pick a mode from the table. That mode's skill
  is the subagent's rulebook.
- **Subagent dispatch is mandatory.** never implement it yourself.
- **Always give the subagent its task id.** required — without it, it cannot report its status.
- **Brief the subagent fully.** it has no memory: pass the task's full `description`, plus the
  mode, the `.env` values it needs, and anything else the description leaves out.
- **Launch the whole wave at once**, one subagent per task, in parallel.
- **Launch the wave and return immediately.** don't wait, don't block. The wave's subagents report
  back on their own; that notification is what starts the next wave.
- **When a wave completes, start the next one straight away.** Only stop early if a task fails in a
  way that makes the next wave meaningless, or if the user interrupts. Say which wave you moved on to.
- **Report briefly.** 1-2 sentences, no internal narration.
- **Notify when the whole plan is done**, not after each wave — the run is continuous, so one
  notification at the end. Use the `notify` skill with the issue, the result, and the file to open.
- **Ask for clarification only as a last resort.** Only if nothing gives a task, or if the answer is
  destructive or would change what we build. Answer a subagent's question yourself from the plan,
  the code, or the goal.

## Modes

| `agent` | Mode | Use for |
|---|---|---|
| `scripter` | [code-mode](../code-mode/SKILL.md) | Mechanical, repeatable — renames, codemods, bulk edits |
| `ai` | [agent-mode](../agent-mode/SKILL.md) | Thinking — research, review, design, root cause |
| `user-task` | [user-mode](../user-mode/SKILL.md) | Things only a human can do |

These are the only three values `/plan` writes. Treat any other value (e.g. old `super`, `Reviewer`) as `ai`.

## Status

Never hand-edit `plan.yml` — use `ai-task <index|task-id> --status <todo|running|completed|failed|skipped>`.
The wave status rolls up on its own. Mark a task `running` when you launch it; **the subagent marks
itself** `completed` or `failed` at the end, so just give it its task id.

Waves are ordered newest first in `plan.yml` — wave 3, then 2, then 1. A new wave goes on top.

When a wave finishes, point `active` at the next wave and **run it** — do not hand back to the user.
When no wave is left, check `task-goal.md` is met and set `goalCompleted: true`. Never delete a
finished wave.
