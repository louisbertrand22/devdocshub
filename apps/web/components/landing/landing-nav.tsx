import Link from "next/link";
import type { Route } from "next";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 md:px-8">
        <Logo href="/" />
        <nav aria-label="Sections" className="hidden items-center gap-5 text-[13px] text-fg-muted md:flex">
          <a href="#features" className="transition-colors hover:text-fg">Fonctionnalités</a>
          <a href="#how" className="transition-colors hover:text-fg">Comment ça marche</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/auth" className={buttonVariants({ variant: "ghost", size: "sm" })}>
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
