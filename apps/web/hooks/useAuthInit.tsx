"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/store";

/**
 * Hook to initialize user authentication on app load.
 * Call this in a top-level component (e.g., Shell or Layout)
 * to ensure user is loaded from token when the app starts.
 */
export function useAuthInit() {
  const { token, user, loadUser } = useAuth();

  useEffect(() => {
    // Only load user if we have a token but no user data yet
    if (token && !user) {
      loadUser();
    }
  }, [token, user, loadUser]);
}
