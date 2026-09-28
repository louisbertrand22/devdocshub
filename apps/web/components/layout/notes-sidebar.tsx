"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "./sidebar-link";

// Filtres « épinglées » / « par doc » : phase 2
export function NotesSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Notes" className="flex flex-col gap-0.5">
      <SidebarLink href="/notes" active={pathname === "/notes"}>Toutes les notes</SidebarLink>
      <SidebarLink href="/notes/new" active={pathname === "/notes/new"}>+ Nouvelle note</SidebarLink>
    </nav>
  );
}
