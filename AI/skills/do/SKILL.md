---
name: do
description: "Runner for Waves Compiler. Picks a mode for each task in the active wave and dispatches it to a background subagent."
---

# Do

Runs one wave of the plan `/plan` collected. `WD/` is the session working folder.

- **Task source:** the `active` wave in `WD/plan.yml`, or the prompt, session, or prior context.
  Any one is enough. Read `plan.yml` only if it is not already in context.
- **Tasks come from `/plan`** with `name`, `agent` and `status`. Write them yourself only if the
  wave has none. One job per task. Tasks in a wave must be safe
  to run together — no two touching the same file. If they clash, move one to a later wave.
- **Use the task's `agent`** if it has one; otherwise pick a mode from the table. That mode's skill
  is the subagent's rulebook.
- **Subagent dispatch is mandatory.** never implement it yourself.
- **Always give the subagent its task id.** required — without it, it cannot report its status.
- **Brief the subagent fully.** it has no memory: the mode, the goal, the paths, the `.env`
  values it needs, and what "done" means.
- **Launch the whole wave at once**, one subagent per task, in parallel.
- **Launch and return immediately.** don't wait, don't block.
- **Report briefly.** 1-2 sentences, no internal narration.
- **Notify on wave done.** use the `notify` skill with the issue, the result, and the file to open. One per wave.
- **Ask for clarification only as a last resort.** Only if nothing gives a task, or if the answer is
  destructive or would change what we build. Answer a subagent's question yourself from the plan,
  the code, or the goal.

## Modes

| `agent` | Mode | Use for |
|---|---|---|
| `scripter` | [code-mode](../code-mode/SKILL.md) | Mechanical, repeatable — renames, codemods, bulk edits |
| `super`, `Reviewer`, `ai` | [agent-mode](../agent-mode/SKILL.md) | Thinking — research, review, design, root cause |
| `user-task` | [user-mode](../user-mode/SKILL.md) | Things only a human can do |

## Status

Never hand-edit `plan.yml` — use `ai-task <index|task-id> --status <todo|running|completed|failed|skipped>`.
The wave status rolls up on its own. Mark a task `running` when you launch it; **the subagent marks
itself** `completed` or `failed` at the end, so just give it its task id.

Waves are ordered newest first in `plan.yml` — wave 3, then 2, then 1. A new wave goes on top.

When the wave finishes, point `active` at the next wave and say it is ready for `/do`. If none are
left, check `task-goal.md` is met and set `goalCompleted: true`. Never delete a finished wave.
