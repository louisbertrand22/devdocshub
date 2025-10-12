"use client";
import React from "react";

type User = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  roles?: string[];
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  apiBase: string;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (t: string | null) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "ddh_token";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "";

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  apiBase: string = API_BASE
): Promise<T> {
  const url = `${apiBase}${path}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers, cache: "no-store"});
  if (!res.ok) {
    const msg = (await res.text()) || res.statusText;
    throw new Error(msg);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : ((await res.text()) as any);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Charger token au démarrage
  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (saved) setTokenState(saved);
    setLoading(false);
  }, []);

  // Quand le token change, persister et (re)charger le user
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    }
    if (token) {
      refreshUser().catch(() => {
        // token invalide
        setUser(null);
        setTokenState(null);
      });
    } else {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const setToken = (t: string | null) => setTokenState(t);

  const refreshUser = React.useCallback(async () => {
    if (!token) return;
    try {
      const me = await apiFetch<User>("/auth/me", {}, token);
      setUser(me);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger le profil.");
      throw e;
    }
  }, [token]);

  const login = React.useCallback(async (email: string, password: string) => {
    setError(null);
    const data = await apiFetch<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setTokenState(data.access_token);
    // refreshUser sera déclenché par l'effet du token
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    setTokenState(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    apiBase: API_BASE,
    loading,
    error,
    login,
    logout,
    setToken,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
