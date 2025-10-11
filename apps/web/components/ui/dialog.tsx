"use client";

import * as React from "react";
import { createPortal } from "react-dom";

type DialogContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
};

const DialogCtx = React.createContext<DialogContextValue | null>(null);

function useDialogCtx() {
  const ctx = React.useContext(DialogCtx);
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>");
  return ctx;
}

export function Dialog({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(!!defaultOpen);
  const open = isControlled ? !!controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setUncontrolledOpen(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange]
  );

  const triggerRef = React.useRef<HTMLElement>(null);

  // lock scroll when open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const ctx: DialogContextValue = React.useMemo(
    () => ({ open, setOpen, triggerRef }),
    [open, setOpen]
  );

  return <DialogCtx.Provider value={ctx}>{children}</DialogCtx.Provider>;
}

export function DialogTrigger({
  asChild,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }) {
  const { setOpen, triggerRef } = useDialogCtx();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      ...rest,
      ref: (node: HTMLElement) => {
        // support existing ref on child
        const childRef: any = (children as any).ref;
        if (typeof childRef === "function") childRef(node);
        else if (childRef && typeof childRef === "object") childRef.current = node;
        (triggerRef as any).current = node;
      },
      onClick: (e: React.MouseEvent) => {
        (children as any).props?.onClick?.(e);
        setOpen(true);
      },
    });
  }

  return (
    <button
      {...rest}
      ref={triggerRef as any}
      type="button"
      onClick={(e) => {
        (rest as any).onClick?.(e);
        setOpen(true);
      }}
    >
      {children}
    </button>
  );
}

function usePortalRoot() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted ? (typeof document !== "undefined" ? document.body : null) : null;
}

export function DialogContent({
  children,
  className = "",
  onPointerDownOutside,
  onEscapeKeyDown,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  onPointerDownOutside?: () => void;
  onEscapeKeyDown?: () => void;
}) {
  const { open, setOpen, triggerRef } = useDialogCtx();
  const portalRoot = usePortalRoot();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    // focus content on open
    const id = window.setTimeout(() => contentRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onEscapeKeyDown?.();
        setOpen(false);
        // restore focus to trigger
        triggerRef.current?.focus?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onEscapeKeyDown, setOpen, triggerRef]);

  if (!open || !portalRoot) return null;

  const overlay = (
    <div
      aria-hidden
      className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
      onMouseDown={() => {
        onPointerDownOutside?.();
        setOpen(false);
        triggerRef.current?.focus?.();
      }}
    />
  );

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed z-[81] inset-0 grid place-items-center p-4`}
      onMouseDown={(e) => {
        // stop overlay close when clicking inside the panel
        e.stopPropagation();
      }}
    >
      <div
        {...rest}
        ref={contentRef}
        tabIndex={-1}
        className={`w-full max-w-lg rounded-xl border bg-white text-gray-900 shadow-xl outline-none dark:bg-neutral-900 dark:text-white dark:border-neutral-800 ${className}`}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(
    <>
      {overlay}
      {content}
    </>,
    portalRoot
  );
}

export function DialogHeader({
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`border-b p-4 ${className}`} {...rest} />;
}

export function DialogTitle({
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-lg font-semibold leading-none ${className}`} {...rest} />;
}

export function DialogDescription({
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`mt-1 text-sm text-gray-600 dark:text-gray-300 ${className}`} {...rest} />;
}

/**
 * Usage simple:
 *
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <DialogTrigger asChild>
 *     <Button>Open</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>API Settings</DialogTitle>
 *       <DialogDescription>Configure backend base URL</DialogDescription>
 *     </DialogHeader>
 *     ...content...
 *   </DialogContent>
 * </Dialog>
 */
