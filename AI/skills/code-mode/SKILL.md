---
name: code-mode
description: "Wave-Code executor. Turns one wave task into the smallest possible script, runs it, and reports its own status from inside the script. Use for mechanical, repeatable work — renames, codemods, bulk edits, data extraction, file generation."
---

# Code Mode

Do the task by writing a script, not by repeating edits by hand.

- Put the script in `WD/.logs/task-<task-index>.<ext>`. Add no dependencies. Print one line per change.
- Dry run first if it writes, deletes, or moves anything. Never run a destructive script blind.
- Verify the change landed — re-grep, count files, run the build. A green script with a red build
  is a failed task.
- If the task needs judgement per case, say so and recommend [agent-mode](../agent-mode/SKILL.md).

**Report from inside the script — do not shell out to `ai-task`.** `waves-compiler` is already
linked in the root, so end the script with:

```js
import { setTaskStatus } from "waves-compiler";
setTaskStatus("<task-index>", "completed"); // or "failed" in the catch
```

`<task-index>` is your task's 1-based position in the active wave (a string like `"2"`), given in your brief.
Run the script from the folder that holds `plan.yml`. If the index is missing, ask `/do` for it before you start.
If `setTaskStatus` itself throws, do not retry or debug it — just finish and close. `/do` fixes the status.
