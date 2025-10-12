"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import "./Shell.css";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router: any = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage = pathname === "/auth";

  const handleSearch = () => {
    // TODO: Implémenter la recherche globale
    console.log("Search clicked");
  };

  const handleAuth = () => {
    router.push("/auth");
  };

  const handleProfile = () => {
    router.push("/profile");
    setSidebarOpen(false);
  };

  const handleNavigation = (tab: string) => {
    const routes: Record<string, string> = {
      dashboard: "/dashboard",
      docs: "/docs",
      notes: "/notes",
      collections: "/collections",
      users: "/users",
      auth: "/auth",
      profile: "/profile",
    };
    router.push(routes[tab] || "/dashboard");
    
    // Fermer la sidebar sur mobile après navigation
    setSidebarOpen(false);
  };

  const getActiveTab = () => {
    const path = pathname.split("/")[1];
    return path || "dashboard";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Layout minimal pour la page d'authentification
  if (isAuthPage) {
    return (
      <>
        <div className="shell-auth">
          {children}
        </div>
        <Toaster />
      </>
    );
  }

  // Layout principal avec sidebar
  return (
    <>
      <div className="shell">
        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div
            className="shell__overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside className={`shell__sidebar ${sidebarOpen ? "shell__sidebar--open" : ""}`}>
          <div className="shell__sidebar-content">
            <AppSidebar
              active={getActiveTab() as any}
              onSelect={handleNavigation}
            />
          </div>
        </aside>

        {/* Main content area */}
        <div className="shell__main">
          {/* Header */}
          <AppHeader
            onSearchClick={handleSearch}
            onAuthClick={handleAuth}
            onMenuClick={toggleSidebar}
            onProfileClick={handleProfile}
          />

          {/* Page content */}
          <main className="shell__content">
            <div className="shell__content-inner">
              {children}
            </div>
          </main>

          {/* Footer */}
          <AppFooter />
        </div>
      </div>
      <Toaster />
    </>
  );
}