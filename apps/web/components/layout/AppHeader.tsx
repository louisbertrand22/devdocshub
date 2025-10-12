"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Search, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import "./AppHeader.css";

interface AppHeaderProps {
  onSearchClick?: () => void;
  onAuthClick?: () => void;
  onMenuClick?: () => void;
}

export function AppHeader({
  onSearchClick,
  onAuthClick,
  onMenuClick,
}: AppHeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const username =
    user?.name ||
    user?.email?.split("@")?.[0] ||
    (user ? "Utilisateur" : undefined);

  // Initiales pour l'avatar
  const initials = username
    ? username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <header className="app-header">
      <div className="app-header__container">
        {/* Logo & Menu mobile */}
        <div className="app-header__brand">
          <button
            className="app-header__menu-btn"
            onClick={onMenuClick}
            aria-label="Menu"
          >
            {/* Icône menu SVG inline */}
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="app-header__logo">
            <span className="app-header__logo-icon">🧭</span>
            <h1 className="app-header__logo-text">DevDocsHub</h1>
          </div>
        </div>

        {/* Actions */}
        <div className="app-header__actions">
          {/* Barre de recherche */}
          <div className="app-header__search">
            <Search className="app-header__search-icon" />
            <input
              type="text"
              placeholder="Rechercher dans vos docs..."
              className="app-header__search-input"
              onClick={onSearchClick}
              readOnly
            />
            <kbd className="app-header__search-kbd">⌘K</kbd>
          </div>

          {/* Notifications */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="app-header__icon-btn"
              aria-label="Notifications"
            >
              {/* Icône cloche SVG inline */}
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="app-header__notification-badge">3</span>
            </Button>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="app-header__icon-btn"
            aria-label="Changer le thème"
          >
            {theme === "dark" ? (
              <span className="app-header__theme-icon">🌙</span>
            ) : (
              <span className="app-header__theme-icon">☀️</span>
            )}
          </Button>

          {/* User menu */}
          {user ? (
            <div className="app-header__user">
              <div className="app-header__user-info">
                <span className="app-header__username">{username}</span>
                <span className="app-header__user-role">Développeur</span>
              </div>
              <div className="app-header__avatar">{initials}</div>
              <Button
                onClick={logout}
                size="sm"
                variant="ghost"
                className="app-header__logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={onAuthClick}
              size="sm"
              className="app-header__login-btn"
            >
              <LogIn className="h-4 w-4 mr-2" />
              <span>Connexion</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;