"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { languageFromClassName, nodeText, remarkHeadingIds } from "@/lib/markdown";
import { cn } from "@/lib/utils";

// Défini une fois : les titres et blocs de code ne sont pas remontés à chaque rendu
const COMPONENTS: Components = {
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
};
const REMARK_PLUGINS = [remarkGfm, remarkHeadingIds];

export function Markdown({ content, className }: { content: string; className?: string }) {
  // Les ids des h2/h3 sont posés dans l'arbre par remarkHeadingIds (mêmes que le sommaire)
  return (
    <div className={cn("prose", className)}>
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const child = (Array.isArray(children) ? children[0] : children) as
    | ReactElement<{ className?: string; children?: ReactNode }>
    | undefined;
  const code = nodeText(child?.props?.children ?? children).replace(/\n$/, "");
  const language = languageFromClassName(child?.props?.className);
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1500);
  }

  return (
    <div className="my-5 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[11px] text-fg-muted">{language ?? "code"}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[11px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg [&_svg]:size-3.5"
        >
          {state === "copied" ? (
            <>
              <Check /> Copié
            </>
          ) : state === "failed" ? (
            "Échec de la copie"
          ) : (
            <>
              <Copy /> Copier
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-fg">
        <code>{code}</code>
      </pre>
    </div>
  );
}
