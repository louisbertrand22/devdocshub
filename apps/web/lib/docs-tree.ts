export type DocSummary = {
  id: string;
  title: string;
  tech: string;
  slug?: string;
  content?: string;
  created_at?: string;
};

export type TechGroup = { tech: string; docs: DocSummary[] };

const FALLBACK_TECH = "autre";

export function groupDocsByTech(docs: DocSummary[]): TechGroup[] {
  const groups = new Map<string, DocSummary[]>();
  for (const doc of docs) {
    const tech = (doc.tech ?? "").trim().toLowerCase() || FALLBACK_TECH;
    const list = groups.get(tech);
    if (list) list.push(doc);
    else groups.set(tech, [doc]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([tech, list]) => ({
      tech,
      docs: [...list].sort((x, y) => x.title.localeCompare(y.title, "fr", { sensitivity: "base" })),
    }));
}
