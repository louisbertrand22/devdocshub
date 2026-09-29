import { test } from "node:test";
import assert from "node:assert/strict";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { createSlugger, extractHeadings, languageFromClassName, nodeText, remarkHeadingIds, slugify, slugifyHeading } from "./markdown.ts";

test("slugify lowercases, strips accents and punctuation", () => {
  assert.equal(slugify("Détails & Options (v2)"), "details-options-v2");
  assert.equal(slugify("  --Hello   World--  "), "hello-world");
  assert.equal(slugify("!!!"), "");
});

test("slugifyHeading never returns an empty id", () => {
  assert.equal(slugifyHeading("!!!"), "section");
});

test("createSlugger dedupes in order", () => {
  const s = createSlugger();
  assert.deepEqual([s.slug("Usage"), s.slug("Usage"), s.slug("Usage")], ["usage", "usage-2", "usage-3"]);
});

test("extractHeadings keeps h2/h3, strips inline markdown, ignores code fences", () => {
  const md = [
    "# Titre",
    "## Installation",
    "### Avec `docker`",
    "```bash",
    "## pas un titre",
    "```",
    "## **Détails** [lien](http://x)",
    "#### trop profond",
    "## Installation",
  ].join("\n");
  assert.deepEqual(extractHeadings(md), [
    { depth: 2, text: "Installation", id: "installation" },
    { depth: 3, text: "Avec docker", id: "avec-docker" },
    { depth: 2, text: "Détails lien", id: "details-lien" },
    { depth: 2, text: "Installation", id: "installation-2" },
  ]);
});

test("nodeText flattens strings, numbers, arrays and element-like children", () => {
  const el = (children: unknown) => ({ props: { children } });
  assert.equal(nodeText(["Avec ", el("docker"), " ", 2, null, false]), "Avec docker 2");
  assert.equal(nodeText(el([el("a"), el(el("b"))])), "ab");
});

test("the heading text seen by the renderer produces the same ids as extractHeadings", () => {
  const s = createSlugger();
  const rendered = [nodeText(["Avec ", { props: { children: "docker" } }])].map((t) => s.slug(t));
  assert.deepEqual(rendered, [extractHeadings("## Avec `docker`")[0].id]);
});

test("languageFromClassName reads language-xxx", () => {
  assert.equal(languageFromClassName("language-bash"), "bash");
  assert.equal(languageFromClassName("hljs language-c++"), "c++");
  assert.equal(languageFromClassName(undefined), null);
});

test("extractHeadings decodes entities like the renderer (A &amp; B → a-b)", () => {
  assert.deepEqual(extractHeadings("## A &amp; B"), [{ depth: 2, text: "A & B", id: "a-b" }]);
});

test("extractHeadings sees blockquote and setext headings, in document order", () => {
  const md = "> ## Cité\n\nSetext\n------\n\n## Cité";
  assert.deepEqual(extractHeadings(md).map((h) => h.id), ["cite", "setext", "cite-2"]);
});

test("a ``` line inside a ~~~ fence does not end the fence", () => {
  assert.deepEqual(extractHeadings("~~~\n```\n## pas un titre\n```\n~~~\n\n## Vrai").map((h) => h.text), ["Vrai"]);
});

test("ids written into the tree by remarkHeadingIds equal the TOC ids", () => {
  const md = "## Usage\n\n### Avec `docker`\n\n> ## Usage\n\n## A &amp; B";
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkHeadingIds).runSync(unified().use(remarkParse).parse(md));
  const ids: string[] = [];
  visit(tree, "heading", (node: any) => { if (node.data?.hProperties?.id) ids.push(node.data.hProperties.id); });
  assert.deepEqual(ids, extractHeadings(md).map((h) => h.id));
});
