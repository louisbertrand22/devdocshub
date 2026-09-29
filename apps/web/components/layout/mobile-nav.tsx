"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { SidebarLink } from "./sidebar-link";
import { useSidebarSlot } from "./sidebar-slot";
import { MAIN_NAV, isActivePath } from "@/lib/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sectionSidebar = useSidebarSlot();

  // Fermer après navigation
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Ouvrir le menu">
          <Menu />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 md:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto border-r border-border bg-bg p-4 md:hidden"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="flex items-center justify-between">
            <Logo />
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Fermer le menu">
                <X />
              </Button>
            </Dialog.Close>
          </div>
          <nav aria-label="Navigation principale" className="flex flex-col gap-0.5">
            {MAIN_NAV.map((item) => (
              <SidebarLink key={item.href} href={item.href} active={isActivePath(pathname, item.href)}>
                {item.label}
              </SidebarLink>
            ))}
          </nav>
          {sectionSidebar && <div className="border-t border-border pt-4">{sectionSidebar}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
