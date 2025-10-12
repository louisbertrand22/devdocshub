"use client";
import React, { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppFooter } from "@/components/layout/AppFooter";
import AuthPage from "@/app/auth/page";
import Dashboard from "@/components/dashboard";
import CollectionsPage from "@/app/collections/page";
/**
 * Layout global avec Header / Sidebar / Footer
 * Version minimaliste sans dépendances supplémentaires.
 */
export default function DevDocsHubApp() {
  const [tab, setTab] = useState<
    "dashboard" | "docs" | "notes" | "collections" | "users" | "auth" | "profile"
  >("dashboard");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        background: "#f9fafb",
      }}
    >
      <AppHeader
        onSearchClick={() => alert("Recherche à venir")}
        onAuthClick={() => setTab("auth")}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 16,
          padding: "16px 24px",
        }}
      >
        <AppSidebar active={tab} onSelect={setTab} />

        <main style={{ display: "grid", gap: 16, alignSelf: "start" }}>
          <div
            style={{
              padding: 16,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              background: "white",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </h2>
            <p style={{ marginTop: 6, color: "#6b7280" }}>
              Page actuelle : <strong>{tab}</strong>
            </p>
          </div>

          <div
            style={{
              padding: 16,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              background: "white",
            }}
          >
            {tab === "dashboard" && (
              <Dashboard
              />
            )}
            {tab === "docs" && (
              <Section title="Docs">Liste des documents (placeholder)</Section>
            )}
            {tab === "notes" && (
              <Section title="Notes">Liste des notes (placeholder)</Section>
            )}
            {tab === "collections" && <CollectionsPage />}
            {tab === "users" && (
              <Section title="Users">
                Liste des utilisateurs (placeholder)
              </Section>
            )}
            {tab === "auth" && <AuthPage />}
          </div>
        </main>
      </div>

      <AppFooter />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        style={{ marginTop: 0, marginBottom: 8, fontSize: 16, fontWeight: 600 }}
      >
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}
