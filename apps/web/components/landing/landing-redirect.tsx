"use client";

import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { safeGetItem } from "@/lib/safe-storage";

// useLayoutEffect avertit côté serveur ; il n'a de sens que dans le navigateur.
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Utilisateur connecté arrivant sur `/` : direction le dashboard.
 * Le script de <head> ne couvre que le chargement initial ; en navigation client (lien, Précédent)
 * on repositionne `data-authed` avant le premier affichage, dans un sens comme dans l'autre.
 */
export function LandingRedirect() {
  const router = useRouter();
  useBeforePaint(() => {
    const html = document.documentElement;
    if (safeGetItem("ddh_token")) {
      html.setAttribute("data-authed", "");
      router.replace("/dashboard");
    } else {
      html.removeAttribute("data-authed");
    }
  }, [router]);
  return null;
}
