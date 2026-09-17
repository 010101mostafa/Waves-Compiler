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
- Verify where you can, then write it to `WD/wave-N-task-M.md`. A `declined` is a real result.
- If you could have done it yourself, say so instead of asking.

**Last step, always:** `ai-task <your-task-id> --status completed` — or `failed` / `skipped`.
Your task id is in your brief. If it is missing, ask the planner for it before you start.
