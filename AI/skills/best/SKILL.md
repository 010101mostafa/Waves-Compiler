---
name: best
description: Researches the recommended way to do a task before doing it, then saves the findings as a Markdown note in the Best-practice folder and does the task that way. Use when the user says "best practice", "the right way", "the recommended way", "how should this be done", or wants a decision that later agents can reuse. Not for quick factual questions (use /chat) or tasks the user already knows how to do.
argument-hint: "[task]"
---

# Best

Task: $ARGUMENTS (if blank, use the request from the conversation)

Find out the **real-world** best way to do this task before doing it — what the industry does, not what the user or this project already has. Write it to a Markdown note so the user and later agents can reuse it. The note is the main deliverable; the task itself comes second.

The user's command decides **what** gets done, never **what the research may find**. Their current setup and earlier choices are compared with the best practice afterwards, not used as its starting point.

`WD/` is the session working folder.

## Progress checklist

Copy this into your first reply and tick items as you go:

```
Best-practice progress:
- [ ] 1. Research question written generally (no project names), advisor checked it
- [ ] 2. Web sources found, each with a URL
- [ ] 3. Best practice and common practice written down
- [ ] 4. Competitors table filled, each row with a source
- [ ] 5. Local sources checked (what we have now)
- [ ] 6. Conflicts table filled (or marked none)
- [ ] 7. Note written or updated in WD/Best-practice/
- [ ] 8. Task done the real-world way (unless research only)
- [ ] 9. Advisor checked the recommendation isn't just the starting design
```

## Steps

1. **Write the research question generally.** Restate the task as a question any team could ask, with no project names, file names, or the user's current design — e.g. "how do teams keep N parallel LLM agent runs going with a delay and a timeout?", not "best way to build my loop-task skill". Call `advisor` to check it is general (no `advisor` → `Plan` agent or the user). Nobody predicts the answer yet.
2. **Search online first.** Use `WebSearch` and `WebFetch` (load with `ToolSearch` `select:WebSearch,WebFetch` if deferred). Official docs first, then trusted guides. Keep the URL of every source you use.
3. **Decide the best practice from the sources.** Match it to this language, framework and version. Note the reasons and what to avoid. Every point cites a source — your own tests go under "Verified locally", not here.
4. **Note how most people do it.** Popular libraries, usual patterns, typical setups. Say where this differs from the best practice and why.
5. **Check competitors.** Look at what 2–3 similar products or top projects chose. For each one, record the company, what they use, and their users or rating, with a source link.
6. **Only now check local sources:** skills, repo docs, MCP tools, existing `WD/Best-practice/` notes, and the user's prompt. They show what we have and what the user asked for — not what is best.
7. **Fill the conflicts table.** Every difference between what the user asked for or already has and the real-world best gets a row. No differences → write "none".
8. **Write the note** (see below).
9. **Do the task the real-world way,** unless the user asked only for the research. If a conflict contradicts an **explicit instruction** in the user's command, ask once with `AskUserQuestion` (real-world option first, marked Recommended) before you do it. Everything the user didn't explicitly demand: do it the researched way and record the change in Decision.
10. **Check the note, then ask the advisor again** before you say the task is done: is the recommendation just the starting design with sources added? Every web claim and competitor row has a source link; the Decision section says what was chosen and what was left out.

## The note

- Folder: `WD/Best-practice/`. Create it if missing.
- File name: short kebab-case name of the task, e.g. `WD/Best-practice/jwt-refresh-tokens.md`.
- If a note on the same topic exists, read it and update it. Do not create a duplicate.

Use the layout in [note-template.md](note-template.md).

## Rules

- Keep the note short and clear. Simple English. No filler.
- Every claim from the web needs a source link, so a later reader can check it.
- If sources disagree, say so and pick one with a reason.
- Never let the user's current design, or an existing note, set the answer. An existing note written under the old rules gets its research redone, not copied.
- Tell the user the note's path when you finish.
