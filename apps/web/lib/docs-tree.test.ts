import { test } from "node:test";
import assert from "node:assert/strict";
import { groupDocsByTech, type DocSummary } from "./docs-tree.ts";

const doc = (id: string, title: string, tech: string): DocSummary => ({ id, title, tech });

test("groups by tech, groups sorted alphabetically, docs sorted by title", () => {
  const groups = groupDocsByTech([
    doc("1", "Volumes", "docker"),
    doc("2", "SSL", "nginx"),
    doc("3", "Compose", "docker"),
  ]);
  assert.deepEqual(
    groups.map((g) => [g.tech, g.docs.map((d) => d.title)]),
    [["docker", ["Compose", "Volumes"]], ["nginx", ["SSL"]]],
  );
});

test("normalises tech case and whitespace into one group", () => {
  const groups = groupDocsByTech([doc("1", "A", "Docker"), doc("2", "B", " docker ")]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].tech, "docker");
  assert.equal(groups[0].docs.length, 2);
});

test("docs without tech go to an 'autre' group", () => {
  const groups = groupDocsByTech([doc("1", "A", ""), doc("2", "B", "   ")]);
  assert.deepEqual(groups.map((g) => g.tech), ["autre"]);
});

test("title sort ignores case and accents", () => {
  const groups = groupDocsByTech([doc("1", "zsh", "shell"), doc("2", "Éditeur", "shell"), doc("3", "bash", "shell")]);
  assert.deepEqual(groups[0].docs.map((d) => d.title), ["bash", "Éditeur", "zsh"]);
});

test("empty input gives no groups and input is not mutated", () => {
  assert.deepEqual(groupDocsByTech([]), []);
  const input = [doc("1", "B", "x"), doc("2", "A", "x")];
  groupDocsByTech(input);
  assert.deepEqual(input.map((d) => d.id), ["1", "2"]);
});
