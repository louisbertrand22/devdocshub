"use client";

import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Charger le thème depuis localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const setThemeMode = (mode: "light" | "dark") => {
    if (!mounted) return;
    
    setTheme(mode);
    localStorage.setItem("theme", mode);
    document.documentElement.classList.toggle("dark", mode === "dark");
  };

  return { theme, toggleTheme, setTheme: setThemeMode, mounted };
}