export type Heading = { depth: 2 | 3; text: string; id: string };

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyHeading(text: string): string {
  return slugify(text) || "section";
}

/** Ids uniques dans l'ordre d'apparition (usage, usage-2, usage-3…). */
export function createSlugger() {
  const seen = new Map<string, number>();
  return {
    slug(text: string): string {
      const base = slugifyHeading(text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return count === 0 ? base : `${base}-${count + 1}`;
    },
  };
}

function inlineMarkdownToText(s: string): string {
  return s
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|~~|\*|_)(.+?)\1/g, "$2")
    .trim();
}

/** Titres h2/h3 hors blocs de code, avec les mêmes ids que le rendu. */
export function extractHeadings(markdown: string): Heading[] {
  const slugger = createSlugger();
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = inlineMarkdownToText(match[2]);
    headings.push({ depth: match[1].length as 2 | 3, text, id: slugger.slug(text) });
  }
  return headings;
}

/** Texte d'un arbre React (children de react-markdown). */
export function nodeText(node: unknown): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (typeof node === "object" && "props" in node) {
    return nodeText((node as { props?: { children?: unknown } }).props?.children);
  }
  return "";
}

export function languageFromClassName(className?: string): string | null {
  const match = /language-([\w+#-]+)/.exec(className ?? "");
  return match ? match[1] : null;
}
