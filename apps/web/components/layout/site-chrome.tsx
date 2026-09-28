"use client";

import { usePathname } from "next/navigation";
import { useAuthInit } from "@/hooks/useAuthInit";
import { useMounted } from "@/hooks/useMounted";
import { isSectionPath } from "@/lib/nav";
import { SidebarSlotProvider } from "./sidebar-slot";
import { TopBar } from "./top-bar";
import { Footer } from "./footer";

/**
 * Enveloppe commune, rendue côté serveur (top bar, footer).
 * Les pages lisent le token du store zustand, initialisé depuis localStorage
 * dès l'import côté client : leur rendu serveur différerait du premier rendu
 * client (erreur d'hydratation #418 → React re-rend toute la racine et perd la
 * classe de thème de <html>). On ne les monte donc qu'après hydratation, comme
 * avant la refonte (où tout l'app était en ssr: false).
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mounted = useMounted();
  useAuthInit();

  const page = mounted ? children : null;

  if (pathname === "/auth") return <main>{page}</main>;

  return (
    <SidebarSlotProvider>
      <TopBar />
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        <main className="flex-1 overflow-x-clip">
          {isSectionPath(pathname) ? (
            page
          ) : (
            <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">{page}</div>
          )}
        </main>
        <Footer />
      </div>
    </SidebarSlotProvider>
  );
}
