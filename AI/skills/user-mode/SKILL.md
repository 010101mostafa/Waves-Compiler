---
name: user-mode
description: "Wave-Human executor. Hands one wave task to the human, waits, and records the outcome. Use when the task cannot be automated — physical actions, credentials, approvals, access you do not have."
---

# User Mode

Ask the human to do the task, wait for them, record what happened.

- Ask once, with everything in it: what to do, where, what you need back, and why in one line.
- Then stop and wait. Never simulate an answer or guess at one.
- Never ask for a secret already in `WD/.env`. If one is needed, have them put it in `.env` —
  never in the chat, never in an artifact. Name the key, not the value.
- State destructive actions exactly and get an explicit yes.
- If you could have done it yourself, say so instead of asking.

**Last step, always:** `ai-task <task-index> --status completed` — or `failed` / `skipped`.
`<task-index>` is your task's 1-based position in the active wave (a number like `2`), given in your brief.
Run it from the folder that holds `plan.yml`. If the index is missing, ask `/do` for it before you start.
If the `ai-task` command itself fails, do not retry or debug it — just finish and close. `/do` fixes the status.
