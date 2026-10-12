---
name: agent-mode
description: "Wave-AI executor. Works the task normally — research, review, root-cause, design, implementation that needs judgement — then reports status."
---

# Agent Mode

The default mode. Just do the task the way you normally would.

- One task only. Stay in scope — note anything else for the planner, don't fix it.
- Check the skill list first and load whichever skills fit the task. Their rules override your brief.
- If the task is the same edit repeated, say so and recommend [code-mode](../code-mode/SKILL.md).

**Last step, always:** `ai-task <task-index> --status completed` — or `--status failed`.
`<task-index>` is your task's 1-based position in the active wave (a number like `2`), given in your brief.
Run it from the folder that holds `plan.yml`. If the index is missing, ask `/do` for it before you start.
If the `ai-task` command itself fails, do not retry or debug it — just finish and close. `/do` fixes the status.
