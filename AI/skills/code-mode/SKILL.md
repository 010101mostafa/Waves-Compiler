---
name: code-mode
description: "Wave-Code executor. Turns one wave task into the smallest possible script, runs it, and reports its own status from inside the script. Use for mechanical, repeatable work — renames, codemods, bulk edits, data extraction, file generation."
---

# Code Mode

Do the task by writing a script, not by repeating edits by hand.

- Put the script in `WD/.logs/<task-id>.<ext>`. Add no dependencies. Print one line per change.
- Dry run first if it writes, deletes, or moves anything. Never run a destructive script blind.
- Verify the change landed — re-grep, count files, run the build. A green script with a red build
  is a failed task.
- Write what changed to `WD/wave-N-task-M.md`. Counts and the script path, not a transcript.
- If the task needs judgement per case, say so and recommend [agent-mode](../agent-mode/SKILL.md).

**Report from inside the script — do not shell out to `ai-task`.** `waves-compiler` is already
linked in the root, so end the script with:

```js
import { setTaskStatus } from "waves-compiler";
setTaskStatus("<your-task-id>", "completed"); // or "failed" in the catch
```

Your task id is in your brief. If it is missing, ask the planner for it before you start.
