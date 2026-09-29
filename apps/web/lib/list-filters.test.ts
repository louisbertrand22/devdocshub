import { test } from "node:test";
import assert from "node:assert/strict";
import { filterDocs, filterNotes, matchesQuery, sortDocs, type NoteItem } from "./list-filters.ts";

test("matchesQuery: every term, accent- and case-insensitive, over all fields", () => {
  assert.equal(matchesQuery(["Déployer Nginx", "nginx"], "deployer NGINX"), true);
  assert.equal(matchesQuery(["Déployer Nginx", null], "docker"), false);
  assert.equal(matchesQuery(["x"], "   "), true);
});

const docs = [
  { id: "1", title: "Volumes", tech: "Docker", content: "persist data", created_at: "2026-09-01T00:00:00" },
  { id: "2", title: "SSL", tech: "nginx", content: "certbot", created_at: "2026-09-10T00:00:00" },
  { id: "3", title: "compose", tech: " docker ", content: "services", created_at: null },
];

test("filterDocs by normalised tech and by query", () => {
  assert.deepEqual(filterDocs(docs, { tech: "docker" }).map((d) => d.id), ["1", "3"]);
  assert.deepEqual(filterDocs(docs, { query: "certbot" }).map((d) => d.id), ["2"]);
  assert.deepEqual(filterDocs(docs, {}).map((d) => d.id), ["1", "2", "3"]);
});

test("sortDocs recent / oldest / title (missing dates last for recent)", () => {
  assert.deepEqual(sortDocs(docs, "recent").map((d) => d.id), ["2", "1", "3"]);
  assert.deepEqual(sortDocs(docs, "oldest").map((d) => d.id), ["3", "1", "2"]);
  assert.deepEqual(sortDocs(docs, "title").map((d) => d.id), ["3", "2", "1"]);
  assert.deepEqual(docs.map((d) => d.id), ["1", "2", "3"], "input not mutated");
});

const notes: NoteItem[] = [
  { id: "a", content: "old pinned", doc_id: "d1", is_pinned: true, created_at: "2026-09-01T00:00:00" },
  { id: "b", content: "recent", doc_id: "d2", is_pinned: false, created_at: "2026-09-20T00:00:00" },
  { id: "c", content: "older", doc_id: "d1", is_pinned: false, created_at: "2026-09-05T00:00:00" },
];

test("filterNotes: pinned first, then most recent", () => {
  assert.deepEqual(filterNotes(notes, {}).map((n) => n.id), ["a", "b", "c"]);
});

test("filterNotes by pinned, by doc, and by doc title through the lookup", () => {
  assert.deepEqual(filterNotes(notes, { pinnedOnly: true }).map((n) => n.id), ["a"]);
  assert.deepEqual(filterNotes(notes, { docId: "d1" }).map((n) => n.id), ["a", "c"]);
  const title = (id: string) => ({ d1: "Docker Compose", d2: "Nginx" } as Record<string, string>)[id];
  assert.deepEqual(filterNotes(notes, { query: "nginx" }, title).map((n) => n.id), ["b"]);
});
