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
  const variantClasses: Record<Variant, string> = {
    default: "border-l-border",
    destructive: "border-l-danger",
    success: "border-l-success",
    warning: "border-l-warning",
    info: "border-l-accent",
  };

  return (
    <div
      className={[
        "flex w-[356px] max-w-full items-start gap-3 rounded-lg border border-l-4 border-border bg-surface p-3 text-fg shadow-xl",
        variantClasses[variant || "default"],
      ].join(" ")}
    >
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold leading-5">{title}</div>}
        {description && (
          <div className="mt-0.5 text-sm leading-5 text-fg-muted">{description}</div>
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
