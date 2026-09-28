"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "./sidebar-link";

// Liste des collections : quand une page de détail de collection existera
export function CollectionsSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Collections" className="flex flex-col gap-0.5">
      <SidebarLink href="/collections" active={pathname === "/collections"}>Toutes les collections</SidebarLink>
      <SidebarLink href="/collections/add" active={pathname === "/collections/add"}>+ Nouvelle collection</SidebarLink>
    </nav>
  );
}
