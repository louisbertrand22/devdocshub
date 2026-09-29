import Link from "next/link";
import type { Route } from "next";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-6 md:px-8">
        <Logo href="/" />
        <nav aria-label="Sections" className="hidden items-center gap-5 text-[13px] text-fg-muted md:flex">
          <a href="#features" className="transition-colors hover:text-fg">Fonctionnalités</a>
          <a href="#how" className="transition-colors hover:text-fg">Comment ça marche</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {/* Sous 640px : « Se connecter » reste dans le hero, la barre ne déborde pas */}
          <Link href="/auth" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
            Se connecter
          </Link>
          <Link href={"/auth?mode=register" as Route} className={buttonVariants({ size: "sm" })}>
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  );
}
