import { test } from "node:test";
import assert from "node:assert/strict";
import { excerpt, formatDate, formatRelative, parseApiDate } from "./format.ts";

const NOW = Date.parse("2026-09-29T12:00:00Z");

test("parseApiDate treats timezone-less API dates as UTC", () => {
  assert.equal(parseApiDate("2026-09-28T22:15:40.125917")?.toISOString(), "2026-09-28T22:15:40.125Z");
  assert.equal(parseApiDate("2026-09-28T22:15:40Z")?.toISOString(), "2026-09-28T22:15:40.000Z");
  assert.equal(parseApiDate("2026-09-28T22:15:40+02:00")?.toISOString(), "2026-09-28T20:15:40.000Z");
});

test("parseApiDate returns null for empty or invalid values", () => {
  assert.equal(parseApiDate(null), null);
  assert.equal(parseApiDate(""), null);
  assert.equal(parseApiDate("not a date"), null);
});

test("formatRelative buckets", () => {
  assert.equal(formatRelative("2026-09-29T11:59:30", NOW), "à l'instant");
  assert.equal(formatRelative("2026-09-29T11:45:00", NOW), "il y a 15 min");
  assert.equal(formatRelative("2026-09-29T09:00:00", NOW), "il y a 3 h");
  assert.equal(formatRelative("2026-09-28T09:00:00", NOW), "hier");
  assert.equal(formatRelative("2026-09-20T12:00:00", NOW), "il y a 9 j");
  assert.equal(formatRelative("2026-06-01T12:00:00", NOW), "1 juin 2026");
});

test("formatRelative: future dates read as now, missing dates as a dash", () => {
  assert.equal(formatRelative("2026-09-30T12:00:00", NOW), "à l'instant");
  assert.equal(formatRelative(undefined, NOW), "—");
});

test("formatDate uses a short French date", () => {
  assert.equal(formatDate("2026-09-12T10:00:00"), "12 sept. 2026");
  assert.equal(formatDate(null), "—");
});

test("excerpt strips markdown and collapses whitespace", () => {
  assert.equal(excerpt("## Intro\n\nUse `docker` **now**, see [docs](http://x).\n\n```bash\nrm -rf /\n```"), "Intro Use docker now, see docs.");
  assert.equal(excerpt(null), "");
});

test("excerpt truncates on a word boundary with an ellipsis", () => {
  assert.equal(excerpt("alpha beta gamma delta", 12), "alpha beta…");
});

test("excerpt flattens markdown tables", () => {
  assert.equal(excerpt("Intro\n\n| Clé | Valeur |\n|---|:---:|\n| a | b |"), "Intro Clé Valeur a b");
});
