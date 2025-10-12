"use client";

import { create } from "zustand";
import { DEFAULT_API_BASE, apiFetch } from "./api";

type User = { id?: string; email?: string; username?: string; name?: string } | null;

type AuthState = {
  token: string | null;
  user: User;
  apiBase: string;
  loading: boolean;
  setToken: (t: string | null) => void;
  setUser: (u: User) => void;
  setApiBase: (b: string) => void;
  loadUser: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("ddh_token") : null,
  user: null,
  apiBase:
    (typeof window !== "undefined" ? localStorage.getItem("ddh_api_base") : null) ??
    DEFAULT_API_BASE,
  loading: false,
  setToken: (t) => {
    if (typeof window !== "undefined") {
      if (t) {
        localStorage.setItem("ddh_token", t);
      } else {
        localStorage.removeItem("ddh_token");
      } 
    }
    set({ token: t });
    // Auto-load user when token is set
    if (t) {
      // Call loadUser in next tick to ensure state is updated
      const state = get();
      const apiBase = state.apiBase;
      setTimeout(() => {
        loadUserWithToken(t, apiBase, set);
      }, 0);
    } else {
      set({ user: null });
    }
  },
  setUser: (u) => set({ user: u }),
  setApiBase: (b) => {
    if (typeof window !== "undefined") localStorage.setItem("ddh_api_base", b);
    set({ apiBase: b });
  },
  loadUser: async () => {
    const { token, apiBase } = get();
    if (!token) {
      set({ user: null, loading: false });
      return;
    }
    
    await loadUserWithToken(token, apiBase, set);
  },
}));

// Helper function to load user with explicit token parameter
async function loadUserWithToken(
  token: string,
  apiBase: string,
  set: (state: Partial<AuthState>) => void
) {
  set({ loading: true });
  try {
    const user = await apiFetch("/auth/me", {}, apiBase, token);
    set({ user, loading: false });
  } catch (error) {
    console.error("Failed to load user:", error);
    // Token might be invalid, clear it
    set({ user: null, token: null, loading: false });
    if (typeof window !== "undefined") {
      localStorage.removeItem("ddh_token");
    }
  }
}
