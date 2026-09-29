import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontMatter } from "./front-matter.ts";

test("parses key: value pairs and returns the body without the header", () => {
  const { data, body } = parseFrontMatter("---\ntitle: Docker Compose\nslug: docker-compose\ntech: docker\n---\n\n## Intro\ntexte");
  assert.deepEqual(data, { title: "Docker Compose", slug: "docker-compose", tech: "docker" });
  assert.equal(body, "## Intro\ntexte");
});

test("keeps colons inside values", () => {
  const { data } = parseFrontMatter("---\ntitle: Nginx : reverse proxy\n---\nx");
  assert.equal(data.title, "Nginx : reverse proxy");
});

test("throws a clear error when the header is missing or unterminated", () => {
  assert.throws(() => parseFrontMatter("## pas d'en-tête"), /front matter/i);
  assert.throws(() => parseFrontMatter("---\ntitle: x\n## pas de fin"), /front matter/i);
});
