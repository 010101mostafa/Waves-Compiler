---
name: agent-mode
description: "Wave-AI executor. Works the task normally — research, review, root-cause, design, implementation that needs judgement — then reports status."
---

# Agent Mode

The default mode. Just do the task the way you normally would.

- One task only. Stay in scope — note anything else for the planner, don't fix it.
- Check the skill list first and load whichever skills fit the task. Their rules override your brief.
- If the task is the same edit repeated, say so and recommend [code-mode](../code-mode/SKILL.md).
- **Work fast.** You may start your own subagents for independent parts of your task — searching, reading other repos, running a test suite or build while you keep coding — and run them in parallel. You still own the result: check what they return before you use it, and report it as yours.
- Run only the specs you touched while working, and the full suite once at the end (see [implementer](../implementer/SKILL.md)).

**Last step, always:** `ai-task <task-index> --status completed` — or `--status failed`.
`<task-index>` is your task's 1-based position in the active wave (a number like `2`), given in your brief.
Run it from the folder that holds `plan.yml`. If the index is missing, ask `/do` for it before you start.
If the `ai-task` command itself fails, do not retry or debug it — just finish and close. `/do` fixes the status.
