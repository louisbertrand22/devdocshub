"use client";

import { useRegisterSidebar } from "./sidebar-slot";

export function SectionLayout({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  // Rend la sidebar disponible pour le tiroir mobile
  useRegisterSidebar(sidebar);

  return (
    <div className="mx-auto flex w-full max-w-[1440px]">
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border px-3 py-6 md:block">
        {sidebar}
      </aside>
      <div className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">{children}</div>
    </div>
  );
}
