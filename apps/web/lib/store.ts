"use client";

import { create } from "zustand";
import { DEFAULT_API_BASE } from "./api";

type User = { id?: string; email?: string; username?: string; name?: string } | null;

type AuthState = {
  token: string | null;
  user: User;
  apiBase: string;
  setToken: (t: string | null) => void;
  setUser: (u: User) => void;
  setApiBase: (b: string) => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("ddh_token") : null,
  user: null,
  apiBase:
    (typeof window !== "undefined" ? localStorage.getItem("ddh_api_base") : null) ??
    DEFAULT_API_BASE,
  setToken: (t) => {
    if (typeof window !== "undefined") {
      if (t) {
        localStorage.setItem("ddh_token", t);
      } else {
        localStorage.removeItem("ddh_token");
      } 
    }
    set({ token: t });
  },
  setUser: (u) => set({ user: u }),
  setApiBase: (b) => {
    if (typeof window !== "undefined") localStorage.setItem("ddh_api_base", b);
    set({ apiBase: b });
  },
}));
