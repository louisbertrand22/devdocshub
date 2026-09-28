"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { filterCommands, type Command } from "@/lib/command-filter";
import type { DocSummary } from "@/lib/docs-tree";
import { cn } from "@/lib/utils";

const PAGE_COMMANDS: Command[] = [
  { id: "page-dashboard", label: "Dashboard", href: "/dashboard", group: "Pages" },
  { id: "page-docs", label: "Docs", href: "/docs", group: "Pages" },
  { id: "page-doc-new", label: "Nouveau doc", href: "/docs/new", group: "Pages", keywords: "créer ajouter" },
  { id: "page-notes", label: "Notes", href: "/notes", group: "Pages" },
  { id: "page-note-new", label: "Nouvelle note", href: "/notes/new", group: "Pages", keywords: "créer ajouter" },
  { id: "page-collections", label: "Collections", href: "/collections", group: "Pages" },
  { id: "page-collection-new", label: "Nouvelle collection", href: "/collections/add", group: "Pages", keywords: "créer ajouter" },
  { id: "page-profile", label: "Mon profil", href: "/profile", group: "Pages", keywords: "compte" },
];

const MAX_RESULTS = 50;

function docToCommand(doc: DocSummary): Command {
  return { id: `doc-${doc.id}`, label: doc.title, href: `/docs/${doc.id}`, group: "Docs", keywords: doc.tech };
}

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { token, apiBase } = useAuth();
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [active, setActive] = useState(0);

  // Docs chargés à chaque ouverture ; erreur API → palette limitée aux pages
  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    if (!token) {
      setDocs([]);
      return;
    }
    let cancelled = false;
    apiFetch<DocSummary[]>("/docs/all", {}, apiBase, token)
      .then((data) => { if (!cancelled) setDocs(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setDocs([]); });
    return () => { cancelled = true; };
  }, [open, token, apiBase]);

  const results = useMemo(
    () => filterCommands([...PAGE_COMMANDS, ...docs.map(docToCommand)], query).slice(0, MAX_RESULTS),
    [docs, query],
  );

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    document.getElementById(`cmd-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function run(item: Command) {
    onOpenChange(false);
    router.push(item.href as Route);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-surface text-fg shadow-2xl"
        >
          <Dialog.Title className="sr-only">Rechercher</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-fg-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Rechercher un doc, une page…"
              role="combobox"
              aria-expanded="true"
              aria-controls="cmd-list"
              aria-activedescendant={results[active] ? `cmd-${active}` : undefined}
              className="h-12 w-full bg-transparent text-sm text-fg placeholder:text-fg-muted focus:outline-none"
            />
            <kbd className="rounded border border-border px-1.5 font-mono text-[11px] text-fg-muted">Échap</kbd>
          </div>
          <ul id="cmd-list" role="listbox" className="max-h-80 overflow-y-auto p-1">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-fg-muted">
                Aucun résultat pour « {query} »
              </li>
            )}
            {results.map((item, i) => (
              <li key={item.id} role="presentation">
                {(i === 0 || results[i - 1].group !== item.group) && (
                  <div className="px-2 pb-1 pt-2 font-mono text-[11px] text-fg-muted">{item.group}</div>
                )}
                <div
                  id={`cmd-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(item)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 text-[13px]",
                    i === active ? "bg-accent-subtle text-accent" : "text-fg",
                  )}
                >
                  <span className="truncate">{item.label}</span>
                  {item.group === "Docs" && item.keywords && (
                    <span className="shrink-0 font-mono text-[11px] text-fg-muted">~/{item.keywords}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
