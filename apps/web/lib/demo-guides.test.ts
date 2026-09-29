import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { parseFrontMatter } from "./front-matter.ts";

const dir = new URL("../scripts/demo/docs/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
const guides = files.map((file) => ({ file, ...parseFrontMatter(readFileSync(new URL(file, dir), "utf8")) }));

test("there are exactly 10 demo guides", () => {
  assert.equal(guides.length, 10, files.join(", "));
});

test("every guide has a title, a kebab-case slug and a lowercase tech", () => {
  for (const g of guides) {
    assert.ok(g.data.title, `${g.file}: title`);
    assert.match(g.data.slug ?? "", /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${g.file}: slug`);
    assert.match(g.data.tech ?? "", /^[a-z0-9]+$/, `${g.file}: tech`);
  }
});

test("slugs are unique", () => {
  const slugs = guides.map((g) => g.data.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every guide is substantial and has at least two ## sections", () => {
  for (const g of guides) {
    const lines = g.body.split("\n").length;
    assert.ok(lines >= 60 && lines <= 160, `${g.file}: ${lines} lines`);
    assert.ok((g.body.match(/^## /gm) ?? []).length >= 2, `${g.file}: ## sections`);
  }
});

test("the guides cover the planned technos", () => {
  const techs = new Set(guides.map((g) => g.data.tech));
  for (const t of ["docker", "nginx", "postgres", "git", "python", "linux", "http"]) assert.ok(techs.has(t), t);
});

test("the hero guide exists and has a table and several code blocks", () => {
  const g = guides.find((x) => x.data.slug === "reverse-proxy-tls-lets-encrypt");
  assert.ok(g, "hero guide missing");
  assert.ok(/^\|.*\|\s*$/m.test(g.body), "table");
  assert.ok((g.body.match(/^```/gm) ?? []).length >= 6, "code blocks");
});
