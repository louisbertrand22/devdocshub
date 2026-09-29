"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { safeGetItem } from "@/lib/safe-storage";

/** Utilisateur connecté arrivant sur `/` : direction le dashboard (la landing est déjà masquée). */
export function LandingRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (safeGetItem("ddh_token")) router.replace("/dashboard");
  }, [router]);
  return null;
}
