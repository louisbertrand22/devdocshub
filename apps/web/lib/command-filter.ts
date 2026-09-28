export type Command = {
  id: string;
  label: string;
  href: string;
  group: "Pages" | "Docs";
  keywords?: string;
};

export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function filterCommands(items: Command[], query: string): Command[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return items;

  const matches: { item: Command; score: number; index: number }[] = [];
  items.forEach((item, index) => {
    const label = normalize(item.label);
    const haystack = `${label} ${normalize(item.keywords ?? "")}`;
    if (!terms.every((t) => haystack.includes(t))) return;
    const score = label.startsWith(terms[0]) ? 0 : label.includes(terms[0]) ? 1 : 2;
    matches.push({ item, score, index });
  });

  return matches.sort((a, b) => a.score - b.score || a.index - b.index).map((m) => m.item);
}

export function isCommandPaletteShortcut(e: {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}): boolean {
  return (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k";
}
