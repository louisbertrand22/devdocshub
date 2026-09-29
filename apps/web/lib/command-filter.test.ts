import { test } from "node:test";
import assert from "node:assert/strict";
import { filterCommands, isCommandPaletteShortcut, type Command } from "./command-filter.ts";

const cmd = (id: string, label: string, keywords?: string): Command => ({
  id, label, href: `/${id}`, group: "Docs", keywords,
});

const items = [
  cmd("a", "Installer Nginx", "nginx"),
  cmd("b", "Docker Compose", "docker"),
  cmd("c", "Créer une note"),
  cmd("d", "Compose avancé", "docker"),
];

test("empty or blank query returns every item in original order", () => {
  assert.deepEqual(filterCommands(items, "").map((c) => c.id), ["a", "b", "c", "d"]);
  assert.deepEqual(filterCommands(items, "   ").map((c) => c.id), ["a", "b", "c", "d"]);
});

test("matching is case- and accent-insensitive", () => {
  assert.deepEqual(filterCommands(items, "CREER").map((c) => c.id), ["c"]);
  assert.deepEqual(filterCommands(items, "avance").map((c) => c.id), ["d"]);
});

test("every term must match (label or keywords)", () => {
  assert.deepEqual(filterCommands(items, "docker compose").map((c) => c.id), ["b", "d"]);
  assert.deepEqual(filterCommands(items, "docker nginx").map((c) => c.id), []);
});

test("keywords are searchable", () => {
  assert.deepEqual(filterCommands(items, "nginx").map((c) => c.id), ["a"]);
});

test("label prefix ranks before label substring, ties keep original order", () => {
  assert.deepEqual(filterCommands(items, "compose").map((c) => c.id), ["d", "b"]);
});

test("isCommandPaletteShortcut: Cmd+K or Ctrl+K only", () => {
  const e = (key: string, mods: Partial<Record<"metaKey" | "ctrlKey" | "altKey" | "shiftKey", boolean>> = {}) => ({
    key, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...mods,
  });
  assert.equal(isCommandPaletteShortcut(e("k", { metaKey: true })), true);
  assert.equal(isCommandPaletteShortcut(e("K", { ctrlKey: true })), true);
  assert.equal(isCommandPaletteShortcut(e("k")), false);
  assert.equal(isCommandPaletteShortcut(e("k", { metaKey: true, altKey: true })), false);
  assert.equal(isCommandPaletteShortcut(e("k", { ctrlKey: true, shiftKey: true })), false);
  assert.equal(isCommandPaletteShortcut(e("j", { metaKey: true })), false);
});
