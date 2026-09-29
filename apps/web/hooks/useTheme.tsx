"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY, resolveTheme, type Theme } from "@/lib/theme";
import { safeSetItem, safeGetItem } from "@/lib/safe-storage";

function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  // stockage indisponible : le choix vaut pour la session en cours
  safeSetItem(THEME_STORAGE_KEY, theme);
}

/**
 * Réapplique le thème stocké sur <html>. Filet de sécurité si React re-rend la
 * racine après une erreur d'hydratation (il remettrait class="dark" du serveur).
 */
export function applyStoredTheme(): Theme {
  const theme = resolveTheme(safeGetItem(THEME_STORAGE_KEY));
  document.documentElement.classList.toggle("dark", theme === "dark");
  return theme;
}

export function useTheme() {
  // "dark" = valeur rendue par le serveur ; corrigée après montage
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(applyStoredTheme());
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, toggleTheme, setTheme, mounted };
}
