import { normalize } from "./command-filter.ts";
import { parseApiDate } from "./format.ts";

export function matchesQuery(fields: (string | null | undefined | false)[], query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalize(fields.filter(Boolean).join(" "));
  return terms.every((t) => haystack.includes(t));
}

type Dated = { created_at?: string | null };
const time = (item: Dated) => parseApiDate(item.created_at)?.getTime();

/** Plus récent d'abord ; les éléments sans date passent en dernier. */
function compareRecent(a: Dated, b: Dated): number {
  const ta = time(a);
  const tb = time(b);
  if (ta === undefined && tb === undefined) return 0;
  if (ta === undefined) return 1;
  if (tb === undefined) return -1;
  return tb - ta;
}

export type DocSort = "recent" | "oldest" | "title";

export function filterDocs<T extends { title: string; tech?: string | null; content?: string | null }>(
  docs: T[],
  { query = "", tech = "" }: { query?: string; tech?: string },
): T[] {
  return docs.filter(
    (d) => (!tech || (d.tech ?? "").trim().toLowerCase() === tech) && matchesQuery([d.title, d.tech, d.content], query),
  );
}

export function sortDocs<T extends Dated & { title: string }>(docs: T[], sort: DocSort): T[] {
  const list = [...docs];
  if (sort === "title") return list.sort((a, b) => a.title.localeCompare(b.title, "fr", { sensitivity: "base" }));
  // Sans date : en dernier pour « récents », en premier pour « anciens »
  return list.sort((a, b) => (sort === "recent" ? compareRecent(a, b) : compareRecent(b, a)));
}

export type NoteItem = {
  id: string;
  content?: string | null;
  doc_id?: string | null;
  user_id?: string | null;
  is_pinned?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

/** Épinglées d'abord, puis les plus récentes. */
export function filterNotes<T extends NoteItem>(
  notes: T[],
  { query = "", pinnedOnly = false, docId = "" }: { query?: string; pinnedOnly?: boolean; docId?: string },
  docTitle?: (id: string) => string | undefined,
): T[] {
  return notes
    .filter(
      (n) =>
        (!pinnedOnly || n.is_pinned) &&
        (!docId || n.doc_id === docId) &&
        matchesQuery([n.content, n.doc_id ? docTitle?.(n.doc_id) : undefined], query),
    )
    .sort((a, b) => Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned)) || compareRecent(a, b));
}
