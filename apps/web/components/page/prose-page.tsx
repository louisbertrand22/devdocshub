import type { ReactNode } from "react";
import { PageHeader } from "@/components/page/page-header";

/** Gabarit des pages de contenu (à propos, mentions légales…). */
export function ProsePage({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <article className="prose max-w-[72ch]">{children}</article>
    </div>
  );
}
