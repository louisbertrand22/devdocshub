import { test } from "node:test";
import assert from "node:assert/strict";
import { MAIN_NAV, isActivePath, isSectionPath } from "./nav.ts";

test("MAIN_NAV lists the four sections in order", () => {
  assert.deepEqual(MAIN_NAV.map((i) => i.href), ["/dashboard", "/docs", "/notes", "/collections"]);
});

test("isActivePath matches the route and its children only", () => {
  assert.equal(isActivePath("/docs", "/docs"), true);
  assert.equal(isActivePath("/docs/abc-123", "/docs"), true);
  assert.equal(isActivePath("/docsearch", "/docs"), false);
  assert.equal(isActivePath("/", "/docs"), false);
  assert.equal(isActivePath(null, "/docs"), false);
});

test("isSectionPath is true only under docs, notes, collections", () => {
  assert.equal(isSectionPath("/docs"), true);
  assert.equal(isSectionPath("/notes/new"), true);
  assert.equal(isSectionPath("/collections/add"), true);
  assert.equal(isSectionPath("/dashboard"), false);
  assert.equal(isSectionPath("/documents"), false);
  assert.equal(isSectionPath(null), false);
});
