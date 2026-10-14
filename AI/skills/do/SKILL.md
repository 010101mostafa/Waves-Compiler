---
name: do
description: "Runner for Waves Compiler. Works every wave in the plan to the end, picking a mode for each task and dispatching it to a background subagent."
---

# Do

Runs the plan `/plan` collected, **wave by wave to the end**. `WD/` is the session working folder.

## Workflow steps

1. **Find the plan**, in this order:
   1. `WD/plan.yml` — its `active` wave, if that wave still has unfinished tasks. Read the file only
      if it is not already in context.
   2. Session memory saved by `/plan`.
   3. Neither one? Run `/plan` first, then come back here.
2. **Write `plan.yml`** if the plan came from session memory. Write every task, with all its details,
   into `WD/plan.yml` as a new wave on top. Keep old waves. Set `active` to the new wave. From here,
   run only what `plan.yml` says.
3. **Check the wave.** One job per task. No two tasks in a wave touch the same file; if they clash,
   move one to a later wave.
4. **Mark each task `running`** with `ai-task <index> --status running`.
5. **Launch the whole wave at once**: one background subagent per task, in parallel. See
   [Briefing a subagent](#briefing-a-subagent).
6. **Return right away.** Don't wait or block. Each subagent reports back on its own, and that
   notification moves the run forward.
7. **On each report**, check the task's status. If it is still `running` (its `ai-task` call
   failed), set it yourself from the report.
8. **When the wave is done**, point `active` at the next wave and go to step 3. Don't ask the user
   and don't wait for another `/do`.
9. **When no wave is left**, check that `task-goal.md` is met and set `goalCompleted: true`.
   Then send one notification with the `notify` skill: the issue, the result, and the file to open.

**Never stop after one wave.** Stop early only if a failed task makes the next wave meaningless, or
the user interrupts.

## Briefing a subagent

- **Never do a task yourself.** Every task goes to a subagent.
- **Mode:** use the task's `agent`; otherwise pick one from [Modes](#modes). That mode's skill is the
  subagent's rulebook.
- **Model and effort:** pick what fits the task. **Do not inherit the current session's model.**
- **Required:** the task index (1-based position in the active wave, e.g. `2`) and the `WD/` path.
  Without them it cannot report its status.
- **Full brief:** the subagent has no memory. Pass the task's full `description`, the mode, the
  `.env` values it needs, and anything else the description leaves out.

## Rules

- **Tasks come from `/plan`** with `name`, `description`, `agent` and `status`. Write them yourself
  only if the wave has none, in the same format (`name` max 15 words, all details in `description`).
- **Report briefly:** 1-2 sentences, no internal narration. Say which wave you moved on to.
- **Ask the user only as a last resort:** when nothing gives a task, or the answer is destructive or
  would change what we build. Answer a subagent's question yourself from the plan, the code, or the
  goal.

## Modes

| `agent` | Mode | Use for |
|---|---|---|
| `scripter` | [code-mode](../code-mode/SKILL.md) | Mechanical, repeatable — renames, codemods, bulk edits |
| `ai` | [agent-mode](../agent-mode/SKILL.md) | Thinking — research, review, design, root cause |
| `user-task` | [user-mode](../user-mode/SKILL.md) | Things only a human can do |

These are the only three values `/plan` writes. Treat any other value (e.g. old `super`, `Reviewer`) as `ai`.

## Status

- Never hand-edit task status — use `ai-task <index|task-id> --status <todo|running|completed|failed|skipped>`.
  The wave status rolls up on its own.
- The subagent marks itself `completed` or `failed` at the end.
- Waves are ordered newest first in `plan.yml` — wave 3, then 2, then 1. A new wave goes on top.
- Never delete a finished wave.
