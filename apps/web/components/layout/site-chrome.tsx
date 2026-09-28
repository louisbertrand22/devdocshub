"use client";

import { usePathname } from "next/navigation";
import { useAuthInit } from "@/hooks/useAuthInit";
import { isSectionPath } from "@/lib/nav";
import { SidebarSlotProvider } from "./sidebar-slot";
import { TopBar } from "./top-bar";
import { Footer } from "./footer";

/**
 * Enveloppe commune. Client (dépend de la route), mais les pages passées en
 * `children` restent rendues côté serveur.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useAuthInit();

  if (pathname === "/auth") return <main>{children}</main>;

  return (
    <SidebarSlotProvider>
      <TopBar />
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        <main className="flex-1">
          {isSectionPath(pathname) ? (
            children
          ) : (
            <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</div>
          )}
        </main>
        <Footer />
      </div>
    </SidebarSlotProvider>
  );
}
