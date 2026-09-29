"use client";

import { create } from "zustand";
import { DEFAULT_API_BASE, apiFetch, isUnauthorized } from "./api";
import { safeGetItem, safeRemoveItem, safeSetItem } from "./safe-storage";

type User = { id?: string; email?: string; username?: string; name?: string; role?: string } | null;

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
  token: safeGetItem("ddh_token"),
  user: null,
  apiBase: safeGetItem("ddh_api_base") ?? DEFAULT_API_BASE,
  loading: false,
  setToken: (t) => {
    if (t) safeSetItem("ddh_token", t);
    else safeRemoveItem("ddh_token");
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
    safeSetItem("ddh_api_base", b);
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
    if (isUnauthorized(error)) {
      set({ user: null, token: null, loading: false });
      safeRemoveItem("ddh_token");
    } else {
      // 429, 5xx ou réseau : la session reste valide, on garde le token.
      set({ loading: false });
    }
  }
}
