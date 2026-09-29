import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

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

type TreeNode = { type: string; depth?: number; data?: { hProperties?: Record<string, unknown> } };

/** Parcourt les h2/h3 dans l'ordre du document (y compris dans les citations). */
function forEachTocHeading(tree: unknown, fn: (node: TreeNode, heading: Heading) => void) {
  const slugger = createSlugger();
  visit(tree as Parameters<typeof visit>[0], "heading", (node) => {
    const heading = node as unknown as TreeNode;
    if (heading.depth !== 2 && heading.depth !== 3) return;
    const text = toString(node).trim();
    fn(heading, { depth: heading.depth, text, id: slugger.slug(text) });
  });
}

/**
 * Plugin remark : écrit l'id des h2/h3 dans l'arbre. Le rendu reste pur (StrictMode,
 * re-rendus) et les ids sont exactement ceux du sommaire (même parcours).
 */
export function remarkHeadingIds() {
  return (tree: unknown) =>
    forEachTocHeading(tree, (node, { id }) => {
      node.data = { ...(node.data ?? {}), hProperties: { ...(node.data?.hProperties ?? {}), id } };
    });
}

const parser = unified().use(remarkParse).use(remarkGfm);

/** Titres h2/h3 du document, avec les ids posés par remarkHeadingIds. */
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  forEachTocHeading(parser.runSync(parser.parse(markdown)), (_node, heading) => headings.push(heading));
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
