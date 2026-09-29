"use client";

import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";

// Toaster global, rendu une seule fois (app/providers.tsx)
export function Toaster() {
  return (
    <SonnerToaster
      closeButton
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "!rounded-lg !border !border-border !bg-surface !text-fg !shadow-xl !font-sans",
          description: "!text-fg-muted",
          closeButton: "!border-border !bg-surface !text-fg-muted",
        },
      }}
    />
  );
}

export default Toaster;
