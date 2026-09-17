---
name: agent-mode
description: "Wave-AI executor. Works the task normally — research, review, root-cause, design, implementation that needs judgement — then reports status."
---

# Agent Mode

The default mode. Just do the task the way you normally would.

- One task only. Stay in scope — note anything else for the planner, don't fix it.
- Check the skill list first and load whichever skills fit the task. Their rules override your brief.
- Write what you found or changed to `WD/wave-N-task-M.md`. Answer first, then evidence.
- If the task is the same edit repeated, say so and recommend [code-mode](../code-mode/SKILL.md).

**Last step, always:** `ai-task <your-task-id> --status completed` — or `--status failed`.
Your task id is in your brief. If it is missing, ask the planner for it before you start.
