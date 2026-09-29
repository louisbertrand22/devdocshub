"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogIn, LogOut, Moon, Search, Sun, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/command-palette";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/lib/store";
import { useTheme } from "@/hooks/useTheme";
import { useMounted } from "@/hooks/useMounted";
import { MAIN_NAV, isActivePath } from "@/lib/nav";
import { isCommandPaletteShortcut } from "@/lib/command-filter";
import { cn } from "@/lib/utils";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const { user, token, setToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      if (isCommandPaletteShortcut(e)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const username = user?.username || user?.name || user?.email?.split("@")[0] || "Utilisateur";

  function logout() {
    setToken(null);
    router.push("/auth");
  }

  // Avant montage, ou token présent mais profil pas encore chargé : réserver la place
  const authPending = !mounted || (token && !user);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 md:px-8">
        <MobileNav />
        <Logo />

        <nav aria-label="Navigation principale" className="hidden h-full items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full items-center px-2.5 text-[13px] transition-colors",
                  active
                    ? "text-fg after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:bg-accent"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Rechercher"
            className="flex h-8 w-8 items-center justify-center gap-2 rounded-md border border-border bg-bg text-[13px] text-fg-muted transition-colors hover:border-fg-muted sm:w-56 sm:justify-between sm:px-2.5"
          >
            <span className="flex items-center gap-2">
              <Search className="size-4" />
              <span className="hidden sm:inline">Rechercher…</span>
            </span>
            <kbd className="hidden rounded border border-border px-1.5 font-mono text-[11px] sm:inline">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>

          {mounted && user && (
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
          )}

          {authPending ? (
            <div className="size-8" aria-hidden />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu du compte"
                  className="grid size-8 place-items-center rounded-full bg-accent-subtle font-mono text-[13px] font-semibold text-accent ring-1 ring-accent-border"
                >
                  {username[0].toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  <div className="font-medium">{username}</div>
                  {user.email && <div className="font-mono text-[11px] text-fg-muted">{user.email}</div>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/profile")}>
                  <User /> Mon profil
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onSelect={() => router.push("/users")}>
                    <Users /> Utilisateurs
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}>
                  <LogOut /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => router.push("/auth")}>
              <LogIn /> Se connecter
            </Button>
          )}
        </div>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
