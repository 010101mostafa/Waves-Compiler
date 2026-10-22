import { test } from "node:test";
import * as assert from "node:assert/strict";
import { commandTag, Crontab, isSchedule, pathTag, quote, schedule, unquote } from "./crontab.js";

const FILE = "/wd/team.json";
const OTHER = "0 3 * * * backup.sh";

function setup(lines: string[] = []) {
  const state = { lines, writes: 0 };
  const crontab = new Crontab({
    read: () => state.lines,
    write: l => { state.lines = l; state.writes++; },
  }, file => `node population tick ${file}`, pathTag("# population:"));
  return { state, crontab };
}

test("line: every minute is * * * * *, every N minutes is */N, ends with the marker", () => {
  const { crontab } = setup();
  assert.equal(crontab.line(FILE, 1), `* * * * * node population tick ${FILE} # population:${FILE}`);
  assert.equal(crontab.line(FILE, 15), `*/15 * * * * node population tick ${FILE} # population:${FILE}`);
});

test("line: % is escaped (cron reads it as a new line)", () => {
  const { crontab } = setup();
  assert.match(crontab.line("/wd/100%.json", 1), /tick \/wd\/100\\%\.json/);
});

test("ensure: adds the line once, keeps the user's other lines", () => {
  const { state, crontab } = setup([OTHER]);
  assert.equal(crontab.ensure(FILE, 1), true);
  assert.deepEqual(state.lines, [OTHER, crontab.line(FILE, 1)]);
  assert.equal(crontab.ensure(FILE, 1), false);
  assert.equal(state.writes, 1);
});

test("ensure: a changed tick replaces the line", () => {
  const { state, crontab } = setup();
  crontab.ensure(FILE, 1);
  assert.equal(crontab.ensure(FILE, 5), true);
  assert.deepEqual(state.lines, [crontab.line(FILE, 5)]);
  assert.equal(crontab.find(FILE), crontab.line(FILE, 5));
});

test("ensure: two lines for the same file (edited by hand) become one", () => {
  const { crontab } = setup();
  const line = crontab.line(FILE, 1);
  const s = setup([line, line]);
  assert.equal(s.crontab.ensure(FILE, 1), true);
  assert.deepEqual(s.state.lines, [line]);
});

test("remove: only the line of this file; nothing to remove -> false, no write", () => {
  const { state, crontab } = setup([OTHER]);
  crontab.ensure(FILE, 1);
  crontab.ensure("/wd/qa.json", 1);
  assert.equal(crontab.remove(FILE), true);
  assert.equal(crontab.find(FILE), null);
  assert.notEqual(crontab.find("/wd/qa.json"), null);
  assert.equal(state.lines[0], OTHER);
  const writes = state.writes;
  assert.equal(crontab.remove(FILE), false);
  assert.equal(state.writes, writes);
});

test("remove: the last line leaves an empty crontab", () => {
  const { state, crontab } = setup();
  crontab.ensure(FILE, 1);
  crontab.remove(FILE);
  assert.deepEqual(state.lines, []);
});

test("a cron schedule string and a custom tag: line, update and remove by that tag only", () => {
  const { state } = setup([OTHER]);
  const crontab = new Crontab({ read: () => state.lines, write: l => { state.lines = l; } }, quote, commandTag("# by ai-cron"));
  assert.equal(crontab.line("/wd/a.sh", "0 2 * * *"), "0 2 * * * /wd/a.sh # by ai-cron");
  crontab.ensure("/wd/a.sh", "0 2 * * *");
  crontab.ensure("/wd/b.sh", "0 2 * * *");
  crontab.ensure("/wd/a.sh", "*/5 * * * *");
  assert.deepEqual(state.lines, [OTHER, "0 2 * * * /wd/b.sh # by ai-cron", "*/5 * * * * /wd/a.sh # by ai-cron"]);
  crontab.remove("/wd/b.sh");
  assert.equal(crontab.remove("/wd/a.sh"), true);
  assert.deepEqual(state.lines, [OTHER]);
});

test("list: only the lines with this mark, as file and schedule", () => {
  const { state, crontab } = setup([OTHER]);
  crontab.ensure(FILE, 15);
  assert.deepEqual(crontab.list(), [{ file: FILE, schedule: "*/15 * * * *" }]);
  state.lines = [OTHER];
  assert.deepEqual(crontab.list(), []);
});

test("quote: plain paths stay plain, others are sh-quoted; unquote undoes it", () => {
  assert.equal(quote("/wd/a.sh"), "/wd/a.sh");
  assert.equal(quote("/wd/my job.sh"), "'/wd/my job.sh'");
  for (const p of ["/wd/a.sh", "/wd/my job.sh", "/wd/it's.sh"]) assert.equal(unquote(quote(p)), p);
});

test("commandTag: finds quoted paths, ignores other tags", () => {
  const tag = commandTag("# by ai-cron");
  assert.equal(tag.fileOf("* * * * * '/wd/my job.sh' # by ai-cron"), "/wd/my job.sh");
  assert.equal(tag.fileOf("* * * * * /wd/a.sh # population:/wd/a.sh"), null);
});

test("schedule: extra spaces are collapsed; isSchedule needs exactly 5 fields", () => {
  assert.equal(schedule("  */5  *  * * * "), "*/5 * * * *");
  assert.equal(isSchedule("* * * * *"), true);
  assert.equal(isSchedule("* * * *"), false);
  assert.equal(isSchedule("* * * * * *"), false);
});
