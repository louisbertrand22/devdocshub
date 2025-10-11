"use client";

import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";

// Toaster global, à placer une seule fois (ex: app/layout.tsx)
export function Toaster() {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        // Styles par défaut pour s’aligner sur Tailwind/shadcn
        className:
          "rounded-xl border border-border shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80",
      }}
    />
  );
}

export default Toaster;
