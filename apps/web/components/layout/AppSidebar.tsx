"use client";

import React from "react";
import "./AppSidebar.css";

type Tab = "dashboard" | "docs" | "notes" | "collections" | "users" | "auth" | "profile";

interface MenuItem {
  key: Tab;
  label: string;
  icon: () => JSX.Element;
  badge?: string | number;
}

export function AppSidebar({
  active,
  onSelect,
}: {
  active: Tab;
  onSelect: (t: Tab) => void;
}) {
  // Icons SVG inline
  const DashboardIcon = () => (
    <svg className="app-sidebar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const DocsIcon = () => (
    <svg className="app-sidebar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const NotesIcon = () => (
    <svg className="app-sidebar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  const CollectionsIcon = () => (
    <svg className="app-sidebar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );

  const UsersIcon = () => (
    <svg className="app-sidebar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const AuthIcon = () => (
    <svg className="app-sidebar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const ProfileIcon = () => (
    <svg className="app-sidebar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const menuItems: MenuItem[] = [
    {
      key: "dashboard",
      label: "Tableau de bord",
      icon: DashboardIcon,
    },
    {
      key: "docs",
      label: "Documentation",
      icon: DocsIcon,
      badge: "12",
    },
    {
      key: "notes",
      label: "Notes",
      icon: NotesIcon,
      badge: "5",
    },
    {
      key: "collections",
      label: "Collections",
      icon: CollectionsIcon,
      badge: "New",
    },
    {
      key: "users",
      label: "Utilisateurs",
      icon: UsersIcon,
    },
    {
      key: "profile",
      label: "Mon Profil",
      icon: ProfileIcon,
    },
    {
      key: "auth",
      label: "Authentification",
      icon: AuthIcon,
    },
  ];

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__container">
        {/* Header */}
        <div className="app-sidebar__header">
          <h2 className="app-sidebar__title">Navigation</h2>
          <span className="app-sidebar__subtitle">Menu principal</span>
        </div>

        {/* Menu items */}
        <nav className="app-sidebar__nav">
          {menuItems.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => onSelect(item.key)}
                className={`app-sidebar__item ${
                  isActive ? "app-sidebar__item--active" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon />
                <span className="app-sidebar__item-label">{item.label}</span>
                {item.badge && (
                  <span className="app-sidebar__badge">{item.badge}</span>
                )}
                {isActive && <div className="app-sidebar__item-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* Footer section */}
        <div className="app-sidebar__footer">
          <div className="app-sidebar__stats">
            <div className="app-sidebar__stat">
              <span className="app-sidebar__stat-value">42</span>
              <span className="app-sidebar__stat-label">Documents</span>
            </div>
            <div className="app-sidebar__stat">
              <span className="app-sidebar__stat-value">15</span>
              <span className="app-sidebar__stat-label">Collections</span>
            </div>
          </div>

          <div className="app-sidebar__upgrade">
            <div className="app-sidebar__upgrade-icon">✨</div>
            <div className="app-sidebar__upgrade-content">
              <span className="app-sidebar__upgrade-title">Passer à Pro</span>
              <span className="app-sidebar__upgrade-text">
                Débloquez toutes les fonctionnalités
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AppSidebar;