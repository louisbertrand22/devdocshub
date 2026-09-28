"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Deux contextes : les sections n'écoutent que le setter (stable), donc
// enregistrer une sidebar ne les re-rend pas (pas de boucle).
const SlotValue = createContext<ReactNode>(null);
const SlotSetter = createContext<((node: ReactNode) => void) | null>(null);

export function SidebarSlotProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<ReactNode>(null);
  return (
    <SlotSetter.Provider value={setNode}>
      <SlotValue.Provider value={node}>{children}</SlotValue.Provider>
    </SlotSetter.Provider>
  );
}

/** Sidebar de la section courante, pour le tiroir mobile. */
export function useSidebarSlot() {
  return useContext(SlotValue);
}

export function useRegisterSidebar(node: ReactNode) {
  const setNode = useContext(SlotSetter);
  useEffect(() => {
    setNode?.(node);
    return () => setNode?.(null);
  }, [setNode, node]);
}
