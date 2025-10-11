import * as React from "react";
import { toast as baseToast, Toaster as SonnerToaster } from "sonner";

type Variant = "default" | "destructive" | "success" | "warning" | "info";

type ToastInput = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode; // bouton(s) optionnel(s)
  variant?: Variant;
  duration?: number; // ms
};

function renderToast({ title, description, action, variant }: ToastInput) {
  // Styles basés sur Tailwind + variantes
  const variantClasses: Record<Variant, string> = {
    default: "bg-background text-foreground border",
    destructive: "bg-destructive text-destructive-foreground",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-black",
    info: "bg-primary text-primary-foreground",
  };

  return (
    <div 
      className={[
        "w-full rounded-xl p-3 shadow-lg",
        "flex items-start gap-3",
        "ring-1 ring-black/5",
        variantClasses[variant || "default"],
      ].join(" ")}
    >
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold leading-5">{title}</div>}
        {description && (
          <div className="mt-0.5 text-sm opacity-90 leading-5">{description}</div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * useToast
 * API: toast({ title, description, variant?, duration?, action? })
 */
export function useToast() {
  function toast(input: ToastInput) {
    return baseToast.custom(() => renderToast(input), {
      duration: input.duration ?? 3000,
    });
  }

  // Helpers courants
  toast.success = (opts: Omit<ToastInput, "variant">) =>
    toast({ ...opts, variant: "success" });
  toast.error = (opts: Omit<ToastInput, "variant">) =>
    toast({ ...opts, variant: "destructive" });
  toast.warning = (opts: Omit<ToastInput, "variant">) =>
    toast({ ...opts, variant: "warning" });
  toast.info = (opts: Omit<ToastInput, "variant">) =>
    toast({ ...opts, variant: "info" });

  return { toast };
}

// Re-export pratique si tu veux importer Toaster depuis ici aussi
export const Toaster = SonnerToaster;
