"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SidebarLink } from "./sidebar-link";

export function NotesSidebar() {
  const pathname = usePathname();
  const pinned = useSearchParams().get("pinned") === "1";
  return (
    <nav aria-label="Notes" className="flex flex-col gap-0.5">
      <SidebarLink href="/notes" active={pathname === "/notes" && !pinned}>Toutes les notes</SidebarLink>
      <SidebarLink href="/notes?pinned=1" active={pathname === "/notes" && pinned}>★ Épinglées</SidebarLink>
      <SidebarLink href="/notes/new" active={pathname === "/notes/new"}>+ Nouvelle note</SidebarLink>
    </nav>
  );
}
