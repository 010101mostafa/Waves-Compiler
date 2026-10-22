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
2. **Always write `plan.yml`** from session memory when `/do` starts, overwriting the file even if it already holds the plan.
   Write every task, with all its details, into `WD/plan.yml`. Set `active` to the first wave that has `todo` tasks. From here,
   run only what `plan.yml` says.
3. **Run the `todo` waves in wave order**: for each wave, run all its `todo` tasks in parallel, one subagent per task.
4. **Mark each task `running`** with `ai-task <index> --status running`.
5. **Launch the whole wave at once**: one background subagent per task, in parallel. See
   [Briefing a subagent](#briefing-a-subagent).
6. **Return right away.** Don't wait or block. Each subagent reports back on its own, and that
   notification moves the run forward.
7. **On each report**, check the task's status. If it is still `running` (its `ai-task` call
   failed), set it yourself from the report.
8. **When the wave is done**, point `active` at the next wave and go to next wave. Don't ask the user and don't wait for another `/do` **never stop**.


## Briefing a subagent

- **Never do a task yourself.** Every task goes to a subagent.
- **Mode:** use the task's `agent`; otherwise pick one from [Modes](#modes). That mode's skill is the
  subagent's rulebook.
- **Model:** use the task's `model` (set by `/plan`). No `model` → small. **Do not inherit the current session's model.**
  Map it to the provider's model sizes:

  | `model` | Size | e.g. Claude |
  |---|---|---|
  | `small` | Small, fast model | Haiku |
  | `mid` | Mid-size model | Sonnet |
  | `large` | Largest model | Opus |
- **Effort:** set `effort` to high to indicate a high-effort task.
- **Required:** the task index (1-based position in the active wave, e.g. `2`) and the `WD/` path.
  Without them it cannot report its status.
- **Full brief:** the subagent has no memory. Pass the task's full `description`, the mode, the
  `.env` values it needs, and anything else the description leaves out.

## Rules

- **Tasks come from `/plan`** with `name`, `description`, `agent` and `status`. Write them yourself
  only if the wave has none, in the same format (`name` max 15 words, all details in `description`).
- **Report briefly:** 1-2 sentences, no internal narration. Say which wave you moved on to.
- **Ask the user only when a task needs a login, a password, or an approval** that only the user can give.
  Answer a subagent's question yourself from the plan, the code, or the goal.

## Modes

| `agent` | Mode | Use for |
|---|---|---|
| `scripter` | [code-mode](../code-mode/SKILL.md) | Mechanical, repeatable — renames, codemods, bulk edits |
| `ai` | [agent-mode](../agent-mode/SKILL.md) | Thinking — research, review, design, root cause |
| `user-task` | [user-mode](../user-mode/SKILL.md) | Things only a human can do |

These are the only three values `/plan` writes. Treat any other value (e.g. old `super`, `Reviewer`) as `ai`.

## Status

- Never hand-edit task status — use `ai-task <index|task-id> --status <todo|running|completed|failed>`.
  The wave status rolls up on its own.
- The subagent marks itself `completed` or `failed` at the end.
- **Never skip a task and never use a skipped status.** Every task runs.
- Waves are ordered newest first in `plan.yml` — wave 3, then 2, then 1. A new wave goes on top.
- Never delete a finished wave.
